// Supabase Edge Function: verify-razorpay-payment
// POST /functions/v1/verify-razorpay-payment
// Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature }
// Returns 200 { verified: true } only when HMAC-SHA256(order_id|payment_id, KEY_SECRET)
// matches razorpay_signature. Mismatch -> 400 and the order must NOT be marked paid.
//
// Security:
//   - Cryptographic constant-time HMAC-SHA256 verification against RAZORPAY_KEY_SECRET.
//   - Rate-limited per user or client IP.
//   - Dynamic CORS supporting configured origins, localhost, and Vercel domains.
//
// Deploy: supabase functions deploy verify-razorpay-payment --no-verify-jwt

import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CONFIGURED_ORIGINS = (Deno.env.get("CORS_ALLOWED_ORIGINS") ??
  "http://localhost:5173,http://localhost:5174,http://localhost:3000,https://anviclothing.com,https://www.anviclothing.com,https://anviclothings.com")
  .split(",")
  .map((s: string) => s.trim())
  .filter(Boolean);
// O(1) exact-match set; regexes below are precompiled once at isolate start.
const ORIGIN_SET = new Set(CONFIGURED_ORIGINS);
const RE_LOCALHOST = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;
const RE_VERCEL = /^https:\/\/([a-z0-9-]+\.)*vercel\.app$/;
const RE_CANONICAL = /^https:\/\/(www\.)?anviclothings?\.com$/;

function isAllowedOrigin(origin: string): boolean {
  if (!origin) return false;
  if (ORIGIN_SET.has(origin) || ORIGIN_SET.has("*")) return true;
  // Allow all localhost / 127.0.0.1 ports in local development
  if (RE_LOCALHOST.test(origin)) return true;
  // Allow Vercel preview and production environments
  if (RE_VERCEL.test(origin)) return true;
  // Allow canonical boutique domains
  if (RE_CANONICAL.test(origin)) return true;
  return false;
}

function corsHeadersFor(req: Request): Record<string, string> {
  const origin = req.headers.get("Origin") ?? "";
  const allowed = isAllowedOrigin(origin);
  return {
    "Access-Control-Allow-Origin": allowed ? origin : (origin || CONFIGURED_ORIGINS[0] || "*"),
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

function json(data: unknown, cors: Record<string, string>, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}

/** Reused base client for token verification (no session persistence, no I/O on creation). */
let cachedAuthClient: ReturnType<typeof createClient> | null = null;
let cachedAuthEnv = "";
async function getAuthUserId(req: Request): Promise<string | null> {
  const url = Deno.env.get("SUPABASE_URL");
  const anon = Deno.env.get("SUPABASE_ANON_KEY");
  const header = req.headers.get("Authorization") ?? "";
  // Fast path: most guest checkouts send no Bearer token or the anon key itself.
  if (!url || !anon || !header.startsWith("Bearer ")) return null;
  const token = header.slice(7).trim();
  if (!token) return null;
  if (token === anon || token.startsWith("sb_publishable_")) return null;
  try {
    const envKey = `${url}|${anon}`;
    if (!cachedAuthClient || cachedAuthEnv !== envKey) {
      cachedAuthClient = createClient(url, anon, { auth: { persistSession: false } });
      cachedAuthEnv = envKey;
    }
    const { data, error } = await cachedAuthClient.auth.getUser(token);
    if (error || !data.user) return null;
    return data.user.id;
  } catch {
    return null;
  }
}

/** Sliding-window per-user/IP rate limit (per edge instance). */
const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 30;
// Bounded: per-key arrays are pruned on write; the map itself is pruned at most
// once per window to avoid unbounded growth on high-cardinality guest IPs.
const rateHits = new Map<string, number[]>();
let lastRatePrune = 0;
const RATE_MAP_CAP = 5000;
function rateLimited(key: string): boolean {
  const now = Date.now();
  const arr = (rateHits.get(key) ?? []).filter((t: number) => now - t < RATE_WINDOW_MS);
  arr.push(now);
  rateHits.set(key, arr);
  if (now - lastRatePrune > RATE_WINDOW_MS) {
    lastRatePrune = now;
    if (rateHits.size > RATE_MAP_CAP) {
      // Evict oldest-inserted keys first (Map preserves insertion order).
      const overflow = rateHits.size - RATE_MAP_CAP;
      const it = rateHits.keys();
      for (let i = 0; i < overflow; i++) {
        const k = it.next().value;
        if (k === undefined) break;
        if (k !== key) rateHits.delete(k);
      }
    }
    for (const [k, v] of rateHits) {
      if (v.length === 0 || v[v.length - 1] < now - RATE_WINDOW_MS) rateHits.delete(k);
    }
  }
  return arr.length > RATE_MAX;
}

/** Constant-time string comparison to avoid timing side-channels. */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

// Cached HMAC key: importing the key is async work worth skipping per request.
// Rotations are handled by keying the cache on the secret value itself.
let cachedHmacKey: CryptoKey | null = null;
let cachedHmacSecret = "";
// Cached service-role client for the confirmation write (rotation-safe).
let cachedAdminClient: ReturnType<typeof createClient> | null = null;
let cachedAdminEnv = "";
async function hmacHex(secret: string, payload: string): Promise<string> {
  if (!cachedHmacKey || cachedHmacSecret !== secret) {
    cachedHmacKey = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );
    cachedHmacSecret = secret;
  }
  const digest = await crypto.subtle.sign("HMAC", cachedHmacKey, new TextEncoder().encode(payload));
  return [...new Uint8Array(digest)].map((bb) => bb.toString(16).padStart(2, "0")).join("");
}

serve(async (req: Request) => {
  const cors = corsHeadersFor(req);
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: cors });
  }
  if (req.method !== "POST") {
    return json({ error: "Method not allowed. Use POST." }, cors, 405);
  }

  const userId = await getAuthUserId(req);
  const clientIp = req.headers.get("x-forwarded-for") ?? req.headers.get("cf-connecting-ip") ?? "guest-ip";
  const rateLimitKey = userId ?? clientIp;
  if (rateLimited(rateLimitKey)) {
    return json({ error: "Too many requests. Slow down and try again." }, cors, 429);
  }

  const secret = Deno.env.get("RAZORPAY_KEY_SECRET");
  if (!secret) {
    console.error("[verify-razorpay-payment] Missing RAZORPAY_KEY_SECRET in Supabase secrets");
    return json({ verified: false, error: "Payment gateway verification is not configured on the server." }, cors, 500);
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ verified: false, error: "Invalid JSON request body." }, cors, 400);
  }

  const orderId = String(body["razorpay_order_id"] ?? "").trim();
  const paymentId = String(body["razorpay_payment_id"] ?? "").trim();
  const signature = String(body["razorpay_signature"] ?? "").trim();

  if (!orderId || !paymentId || !signature) {
    return json(
      {
        verified: false,
        error: "Missing required payment fields (order_id, payment_id, signature).",
      },
      cors,
      400,
    );
  }

  const payload = `${orderId}|${paymentId}`;
  const expected = await hmacHex(secret, payload);

  if (!timingSafeEqual(expected, signature.toLowerCase())) {
    console.warn("[verify-razorpay-payment] Signature mismatch for order:", orderId, "payment:", paymentId);
    return json({ verified: false, error: "Cryptographic signature mismatch. Payment could not be verified." }, cors, 400);
  }

  // Record server-side confirmation consumed by attach_verified_payment() RPC
  // Reuse one service-role client per secret rotation (creation itself does no I/O).
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (supabaseUrl && serviceKey) {
    try {
      const adminEnv = `${supabaseUrl}|${serviceKey}`;
      if (!cachedAdminClient || cachedAdminEnv !== adminEnv) {
        cachedAdminClient = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
        cachedAdminEnv = adminEnv;
      }
      const { error: upErr } = await cachedAdminClient
        .from("payment_confirmations")
        .upsert(
          { razorpay_order_id: orderId, razorpay_payment_id: paymentId, signature, profile_id: userId },
          { onConflict: "razorpay_order_id", ignoreDuplicates: true },
        );
      if (upErr) console.error("[verify-razorpay-payment] Confirmation write failed:", upErr.message);
    } catch (dbErr) {
      console.error("[verify-razorpay-payment] Supabase DB write error:", dbErr);
    }
  }

  return json({ verified: true, order_id: orderId, payment_id: paymentId }, cors);
});
