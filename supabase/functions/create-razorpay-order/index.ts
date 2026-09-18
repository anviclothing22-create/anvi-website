// Supabase Edge Function: create-razorpay-order
// POST /functions/v1/create-razorpay-order
// Body: { amount_paise: number, currency?: string, receipt: string, notes?: Record<string,string> }
// Returns: { order_id, amount, currency, receipt }
//
// Security:
//   - Rate-limited per user or client IP.
//   - Dynamic CORS supporting configured origins, localhost, and Vercel domains.
//   - Credentials kept in Supabase secrets (RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET).
//
// Deploy: supabase functions deploy create-razorpay-order --no-verify-jwt

import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const MIN_AMOUNT_PAISE = 100;

const CONFIGURED_ORIGINS = (Deno.env.get("CORS_ALLOWED_ORIGINS") ??
  "http://localhost:5173,http://localhost:5174,http://localhost:3000,https://anviclothing.com,https://www.anviclothing.com,https://anviclothings.com")
  .split(",")
  .map((s: string) => s.trim())
  .filter(Boolean);

function isAllowedOrigin(origin: string): boolean {
  if (!origin) return false;
  if (CONFIGURED_ORIGINS.includes(origin) || CONFIGURED_ORIGINS.includes("*")) return true;
  // Allow all localhost / 127.0.0.1 ports in local development
  if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return true;
  // Allow Vercel preview and production environments
  if (/^https:\/\/([a-z0-9-]+\.)*vercel\.app$/.test(origin)) return true;
  // Allow canonical boutique domains
  if (/^https:\/\/(www\.)?anviclothings?\.com$/.test(origin)) return true;
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

/** Returns the authenticated user's id, or null for guests or invalid tokens. */
async function getAuthUserId(req: Request): Promise<string | null> {
  const url = Deno.env.get("SUPABASE_URL");
  const anon = Deno.env.get("SUPABASE_ANON_KEY");
  const header = req.headers.get("Authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!url || !anon || !token) return null;
  // Skip auth call if client passed the anon key or publishable token
  if (token === anon || token.startsWith("sb_publishable_")) return null;
  try {
    const supabase = createClient(url, anon, { auth: { persistSession: false } });
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) return null;
    return data.user.id;
  } catch {
    return null;
  }
}

/** Sliding-window per-user/IP rate limit (per edge instance). */
const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 30;
const rateHits = new Map<string, number[]>();
function rateLimited(key: string): boolean {
  const now = Date.now();
  const arr = (rateHits.get(key) ?? []).filter((t: number) => now - t < RATE_WINDOW_MS);
  arr.push(now);
  rateHits.set(key, arr);
  return arr.length > RATE_MAX;
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

  const keyId = Deno.env.get("RAZORPAY_KEY_ID");
  const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET");
  if (!keyId || !keySecret) {
    console.error("[create-razorpay-order] Missing RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET in secrets");
    return json({ error: "Payment gateway is not configured on the server." }, cors, 500);
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON request body." }, cors, 400);
  }

  const rawAmount = body["amount_paise"] ?? body["amount"];
  const amount = Math.round(Number(rawAmount));
  const currency = String(body["currency"] ?? "INR").toUpperCase();
  const receipt = String(body["receipt"] ?? "").slice(0, 40);

  if (!Number.isFinite(amount) || amount < MIN_AMOUNT_PAISE) {
    return json({ error: `Amount must be at least ${MIN_AMOUNT_PAISE} paise (₹1).` }, cors, 400);
  }
  if (!receipt) {
    return json({ error: "receipt is required for payment reconciliation." }, cors, 400);
  }
  if (!/^[A-Z]{3}$/.test(currency)) {
    return json({ error: "Invalid currency. Use a 3-letter ISO code (e.g. INR)." }, cors, 400);
  }

  const notes =
    body["notes"] && typeof body["notes"] === "object"
      ? (body["notes"] as Record<string, string>)
      : {};

  let rzp: Record<string, unknown>;
  try {
    const res = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Basic ${btoa(`${keyId}:${keySecret}`)}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ amount, currency, receipt, notes }),
    });
    rzp = await res.json();
    if (!res.ok) {
      const desc =
        (rzp?.["error"] as Record<string, unknown> | undefined)?.["description"] ??
        "Razorpay order creation failed.";
      console.error("[create-razorpay-order] Razorpay error:", res.status, desc, rzp);
      const userMessage =
        res.status === 401
          ? "Razorpay API authentication failed. Please ensure RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET match in Supabase secrets."
          : String(desc);
      return json({ error: userMessage, code: res.status }, cors, res.status === 401 ? 401 : 500);
    }
  } catch (err) {
    console.error("[create-razorpay-order] Network error connecting to Razorpay:", err);
    return json({ error: "Could not reach Razorpay API. Try again." }, cors, 500);
  }

  return json(
    {
      order_id: rzp["id"],
      amount: rzp["amount"],
      currency: rzp["currency"],
      receipt: rzp["receipt"],
      key_id: keyId,
    },
    cors,
  );
});
