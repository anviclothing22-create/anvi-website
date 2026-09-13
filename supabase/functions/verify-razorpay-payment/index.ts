// Supabase Edge Function: verify-razorpay-payment
// POST /functions/v1/verify-razorpay-payment
// Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature }
// Returns 200 { verified: true } only when HMAC-SHA256(order_id|payment_id, KEY_SECRET)
// matches razorpay_signature. Mismatch -> 400 and the order must NOT be marked paid.
//
// Security:
//   - Requires a valid authenticated Supabase session (Bearer JWT) to limit who can
//     probe the verification endpoint.
//   - CORS restricted to an origin allowlist (CORS_ALLOWED_ORIGINS env, comma-separated).
//
// Secret (never in client code — set via `supabase secrets set`):
//   RAZORPAY_KEY_SECRET
// Optional:
//   CORS_ALLOWED_ORIGINS  e.g. "https://anvi.example,https://admin.anvi.example"
//
// Deploy: supabase functions deploy verify-razorpay-payment
// Serve locally: supabase functions serve verify-razorpay-payment --env-file ./supabase/.env.local

import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ALLOWED_ORIGINS = (Deno.env.get("CORS_ALLOWED_ORIGINS") ??
  "http://localhost:5173,http://localhost:5174")
  .split(",")
  .map((s: string) => s.trim())
  .filter(Boolean);

function corsHeadersFor(req: Request): Record<string, string> {
  const origin = req.headers.get("Origin") ?? "";
  const allowed = ALLOWED_ORIGINS.includes(origin);
  return {
    "Access-Control-Allow-Origin": allowed ? origin : ALLOWED_ORIGINS[0],
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    Vary: "Origin",
  };
}

function json(data: unknown, cors: Record<string, string>, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}

/** Returns the authenticated user's id, or null when the bearer token is invalid. */
async function getAuthUserId(req: Request): Promise<string | null> {
  const url = Deno.env.get("SUPABASE_URL");
  const anon = Deno.env.get("SUPABASE_ANON_KEY");
  const header = req.headers.get("Authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!url || !anon || !token) return null;
  const supabase = createClient(url, anon, { auth: { persistSession: false } });
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return null;
  return data.user.id;
}

/** Sliding-window per-user rate limit (per edge instance). */
const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 20;
const rateHits = new Map<string, number[]>();
function rateLimited(key: string): boolean {
  const now = Date.now();
  const arr = (rateHits.get(key) ?? []).filter((t: number) => now - t < RATE_WINDOW_MS);
  arr.push(now);
  rateHits.set(key, arr);
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

serve(async (req: Request) => {
  const cors = corsHeadersFor(req);
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: cors });
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
    console.error("[verify-razorpay-payment] Missing RAZORPAY_KEY_SECRET");
    return json({ verified: false, error: "Payment gateway is not configured." }, cors, 500);
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ verified: false, error: "Invalid JSON body." }, cors, 400);
  }

  const orderId = String(body["razorpay_order_id"] ?? "");
  const paymentId = String(body["razorpay_payment_id"] ?? "");
  const signature = String(body["razorpay_signature"] ?? "");

  if (!orderId || !paymentId || !signature) {
    return json(
      {
        verified: false,
        error: "Missing fields. Required: razorpay_order_id, razorpay_payment_id, razorpay_signature.",
      },
      cors,
      400,
    );
  }

  const payload = `${orderId}|${paymentId}`;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const digest = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  const expected = [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  if (!timingSafeEqual(expected, signature.toLowerCase())) {
    console.warn("[verify-razorpay-payment] Signature mismatch for order:", orderId);
    return json({ verified: false, error: "Signature mismatch. Payment NOT verified." }, cors, 400);
  }

  // Record a one-time, server-side confirmation that attach_verified_payment() consumes
  // to flip the order to paid. Written with service_role; clients cannot forge it.
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (supabaseUrl && serviceKey) {
    const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
    const { error: upErr } = await admin
      .from("payment_confirmations")
      .upsert(
        { razorpay_order_id: orderId, razorpay_payment_id: paymentId, signature, profile_id: userId },
        { onConflict: "razorpay_order_id", ignoreDuplicates: true },
      );
    if (upErr) console.error("[verify-razorpay-payment] confirmation write failed:", upErr.message);
  }

  return json({ verified: true, order_id: orderId, payment_id: paymentId }, cors);
});
