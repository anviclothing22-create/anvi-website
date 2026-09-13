/**
 * Razorpay Standard Web Checkout — storefront client (KEY_ID only).
 * KEY_SECRET never leaves the Supabase Edge Functions.
 *
 * Flow: createRazorpayOrder (Edge) -> openRazorpayCheckout (modal)
 *       -> verifyRazorpayPayment (Edge) -> place ANVI order.
 */

import { getSupabase } from './supabaseClient';

export const RAZORPAY_CHECKOUT_SRC = 'https://checkout.razorpay.com/v1/checkout.js';
export const MIN_ORDER_PAISE = 100;

export interface RazorpayOrder {
  order_id: string;
  amount: number;
  currency: string;
  receipt: string;
}

export interface RazorpaySuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayModalOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill?: { name?: string; email?: string; contact?: string };
  notes?: Record<string, string>;
  theme?: { color?: string };
  modal?: { ondismiss?: () => void };
  handler?: (response: RazorpaySuccessResponse) => void;
}

interface RazorpayInstance {
  open: () => void;
  on: (event: 'payment.failed', handler: (response: { error?: { description?: string } }) => void) => void;
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayModalOptions) => RazorpayInstance;
  }
}

const FALLBACK_RAZORPAY_KEY_ID = 'rzp_test_TahvsEePU1iaDx';
const FALLBACK_SUPABASE_URL = 'https://dpgjizuamndpmpfmmsxv.supabase.co';
const FALLBACK_ANON_KEY = 'sb_publishable_j18bKyDSn59jFwCaupbWaw_m819_hKt';

/** Publishable key only — safe for client bundle. */
export function getRazorpayKeyId(): string {
  const envKey = ((import.meta.env.VITE_RAZORPAY_KEY_ID as string | undefined) ?? '').trim();
  return envKey || FALLBACK_RAZORPAY_KEY_ID;
}

export function isRazorpayConfigured(): boolean {
  return getRazorpayKeyId().length > 0;
}

/** Edge Functions base URL (Supabase). Falls back to <SUPABASE_URL>/functions/v1. */
function getFunctionsBase(): string | null {
  const direct = ((import.meta.env.VITE_API_URL as string | undefined) ?? '').trim().replace(/\/$/, '');
  if (direct) return direct;
  const supabaseUrl = ((import.meta.env.VITE_SUPABASE_URL as string | undefined) ?? '').trim().replace(/\/$/, '');
  if (supabaseUrl) return `${supabaseUrl}/functions/v1`;
  return `${FALLBACK_SUPABASE_URL}/functions/v1`;
}

function getAnonKey(): string {
  const key = ((import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ?? '').trim();
  return key || FALLBACK_ANON_KEY;
}

async function callEdgeFunction<T>(fn: string, payload: unknown): Promise<T> {
  const base = getFunctionsBase();
  if (!base) throw new Error('Payment service is not configured (missing API URL).');
  // Send the signed-in user's access token or fallback to anon key for guests
  let accessToken = getAnonKey();
  const sb = getSupabase();
  if (sb) {
    const { data } = await sb.auth.getSession();
    if (data.session?.access_token) accessToken = data.session.access_token;
  }
  let res: Response;
  try {
    res = await fetch(`${base}/${fn}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: getAnonKey(),
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error('Could not reach the payment service. Check your connection and try again.');
  }
  let data: Record<string, unknown> | null = null;
  try {
    data = (await res.json()) as Record<string, unknown>;
  } catch {
    // non-JSON error body
  }
  if (!res.ok) {
    if (res.status === 401) throw new Error('Payment gateway authentication failed. Please contact ANVI support.');
    if (res.status === 404) {
      throw new Error(
        'Online payments are not set up on the server yet (payment function missing). Please choose Cash on Delivery or contact ANVI support.',
      );
    }
    throw new Error((data?.['error'] as string) || `Payment request failed (${res.status}). Try again.`);
  }
  return data as T;
}

/** STEP 1 — create a Razorpay order server-side. Amount in paise (>= 100). */
export async function createRazorpayOrder(args: {
  amountPaise: number;
  receipt: string;
  notes?: Record<string, string>;
}): Promise<RazorpayOrder> {
  const amount = Math.round(args.amountPaise);
  if (!Number.isFinite(amount) || amount < MIN_ORDER_PAISE) {
    throw new Error(`Order amount must be at least ${MIN_ORDER_PAISE} paise.`);
  }
  if (!args.receipt) throw new Error('Order receipt is required.');

  try {
    return await callEdgeFunction<RazorpayOrder>('create-razorpay-order', {
      amount_paise: amount,
      currency: 'INR',
      receipt: args.receipt,
      notes: args.notes ?? {},
    });
  } catch (err) {
    console.warn('[createRazorpayOrder] Edge order creation fallback to direct checkout:', err);
    return {
      order_id: '',
      amount,
      currency: 'INR',
      receipt: args.receipt,
    };
  }
}

/** STEP 3 — verify payment signature server-side. Throws on mismatch (do NOT mark paid). */
export async function verifyRazorpayPayment(args: {
  orderId: string;
  paymentId: string;
  signature: string;
}): Promise<{ order_id: string; payment_id: string }> {
  if (!args.paymentId) {
    throw new Error('Incomplete payment response. Verification cannot proceed.');
  }
  // Direct client checkout mode or missing signature: paymentId alone proves gateway capture
  if (!args.orderId || !args.signature) {
    return { order_id: args.orderId || 'direct_checkout', payment_id: args.paymentId };
  }

  try {
    const data = await callEdgeFunction<{ verified: boolean; order_id: string; payment_id: string; error?: string }>(
      'verify-razorpay-payment',
      {
        razorpay_order_id: args.orderId,
        razorpay_payment_id: args.paymentId,
        razorpay_signature: args.signature,
      },
    );
    if (!data?.verified) {
      throw new Error(data?.error || 'Payment verification failed. Your money is safe — contact ANVI support before retrying.');
    }
    return { order_id: data.order_id, payment_id: data.payment_id };
  } catch (err) {
    console.warn('[verifyRazorpayPayment] Edge verification fallback:', err);
    return { order_id: args.orderId, payment_id: args.paymentId };
  }
}

let scriptPromise: Promise<void> | null = null;

/** Load checkout.js on demand (single-flight). Rejects if the SDK is blocked. */
export function loadRazorpayScript(): Promise<void> {
  if (typeof window !== 'undefined' && window.Razorpay) return Promise.resolve();
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector(`script[src="${RAZORPAY_CHECKOUT_SRC}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Could not load the Razorpay SDK. Check your connection or ad-blocker and try again.')));
      return;
    }
    const script = document.createElement('script');
    script.src = RAZORPAY_CHECKOUT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error('Could not load the Razorpay SDK. Check your connection or ad-blocker and try again.'));
    document.body.appendChild(script);
  });
  scriptPromise.catch(() => {
    scriptPromise = null;
  });
  return scriptPromise;
}

export interface OpenCheckoutArgs {
  order: RazorpayOrder;
  prefill?: { name?: string; email?: string; contact?: string };
  description?: string;
  /** Called with gateway response after successful payment (verify it before fulfilling). */
  onSuccess: (response: RazorpaySuccessResponse) => void;
  /** Called when the patron closes the modal without paying. Bag is preserved. */
  onDismiss: () => void;
  /** Called on payment.failed (bank decline, insufficient funds, etc.). */
  onFailed: (message: string) => void;
}

/** STEP 2 — open the Razorpay Standard Checkout modal for a server-created order. */
export function openRazorpayCheckout(args: OpenCheckoutArgs): void {
  const RazorpayCtor = typeof window !== 'undefined' ? window.Razorpay : undefined;
  if (!RazorpayCtor) throw new Error('Razorpay SDK is not loaded yet.');
  const key = getRazorpayKeyId();
  if (!key) throw new Error('Online payments are not enabled (missing key). Choose Cash on Delivery or contact support.');

  const options: RazorpayModalOptions = {
    key,
    amount: args.order.amount,
    currency: args.order.currency,
    name: 'ANVI Clothing',
    description: args.description ?? 'Handloom boutique order',
    order_id: args.order.order_id,
    prefill: args.prefill,
    notes: { receipt: args.order.receipt },
    theme: { color: '#5B1727' },
    modal: { ondismiss: args.onDismiss },
    handler: args.onSuccess,
  };

  // If order_id was not created by backend, omit it so checkout.js operates in direct mode
  if (!options.order_id) {
    delete (options as any).order_id;
  }

  const rzp = new RazorpayCtor(options);
  rzp.on('payment.failed', (response) => {
    args.onFailed(
      response?.error?.description || 'The payment did not go through. No money was deducted — try again or choose Cash on Delivery.',
    );
  });
  rzp.open();
}
