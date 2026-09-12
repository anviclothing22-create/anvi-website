// Supabase Edge Function: create-razorpay-order
// POST /functions/v1/create-razorpay-order
// Body: { amount_paise: number, currency?: string, receipt: string, notes?: Record<string,string> }
// Returns: { order_id, amount, currency, receipt }
//
// Security:
//   - Requires a valid authenticated Supabase session (Bearer JWT) so anonymous
//     callers / arbitrary origins cannot spam Razorpay order creation.
//   - CORS restricted to an origin allowlist (CORS_ALLOWED_ORIGINS env, comma-separated).
//
// Secrets (never in client code — set via `supabase secrets set`):
//   RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET
// Optional:
//   CORS_ALLOWED_ORIGINS  e.g. "https://anvi.example,https://admin.anvi.example"
//
// Deploy: supabase functions deploy create-razorpay-order
// Serve locally: supabase functions serve create-razorpay-order --env-file ./supabase/.env.local

import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const MIN_AMOUNT_PAISE = 100;

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

serve(async (req: Request) => {
  const cors = corsHeadersFor(req);
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: cors });
  }
  if (req.method !== "POST") {
    return json({ error: "Method not allowed. Use POST." }, cors, 405);
  }
  const userId = await getAuthUserId(req);
  if (!userId) {
    return json({ error: "Authentication required. Sign in and try again." }, cors, 401);
  }
  if (rateLimited(userId)) {
    return json({ error: "Too many requests. Slow down and try again." }, cors, 429);
  }

  const keyId = Deno.env.get("RAZORPAY_KEY_ID");
  const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET");
  if (!keyId || !keySecret) {
    console.error("[create-razorpay-order] Missing RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET");
    return json({ error: "Payment gateway is not configured." }, cors, 500);
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON body." }, cors, 400);
  }

  const rawAmount = body["amount_paise"] ?? body["amount"];
  const amount = Math.round(Number(rawAmount));
  const currency = String(body["currency"] ?? "INR").toUpperCase();
  const receipt = String(body["receipt"] ?? "").slice(0, 40);

  if (!Number.isFinite(amount) || amount < MIN_AMOUNT_PAISE) {
    return json({ error: `Amount must be at least ${MIN_AMOUNT_PAISE} paise.` }, cors, 400);
  }
  if (!receipt) {
    return json({ error: "receipt is required (idempotency key)." }, cors, 400);
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
      console.error("[create-razorpay-order] Razorpay error:", res.status, desc);
      // Auth failures surface as 401 so the client can report misconfiguration.
      return json({ error: String(desc) }, cors, res.status === 401 ? 401 : 500);
    }
  } catch (err) {
    console.error("[create-razorpay-order] Network error:", err);
    return json({ error: "Could not reach Razorpay. Try again." }, cors, 500);
  }

  return json(
    {
      order_id: rzp["id"],
      amount: rzp["amount"],
      currency: rzp["currency"],
      receipt: rzp["receipt"],
    },
    cors,
  );
});
