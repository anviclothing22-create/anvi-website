import { getSupabase } from './supabaseClient';

export interface CouponCheck {
  valid: boolean;
  discount_int: number;
  reason: string;
  coupon_id: string | null;
}

const COUPON_MEMO_TTL_MS = 30_000;
const couponMemo = new Map<string, { at: number; val: CouponCheck }>();
const couponInflight = new Map<string, Promise<CouponCheck>>();

/** Server-authoritative coupon validation. Never trust localStorage math. */
export async function validateCoupon(code: string, subtotalInt: number): Promise<CouponCheck> {
  const clean = code.trim().toUpperCase();
  if (!clean) return { valid: false, discount_int: 0, reason: 'Please enter a coupon code.', coupon_id: null };
  // Short memo: checkout re-validates the same code+subtotal on every keystroke/
  // re-render (incl. StrictMode double-effects). Server stays authoritative —
  // this only skips repeat RPCs for 30s. Discount math still comes from the RPC.
  const memoKey = `${clean}:${Math.round(subtotalInt)}`;
  const memo = couponMemo.get(memoKey);
  if (memo && Date.now() - memo.at <= COUPON_MEMO_TTL_MS) return memo.val;
  const inFlight = couponInflight.get(memoKey);
  if (inFlight) return inFlight;
  const p = validateCouponUncached(clean, subtotalInt).then((val) => {
    if (couponMemo.size >= 50) {
      const oldest = couponMemo.keys().next().value;
      if (oldest !== undefined) couponMemo.delete(oldest);
    }
    couponMemo.set(memoKey, { at: Date.now(), val });
    return val;
  }).finally(() => {
    if (couponInflight.get(memoKey) === p) couponInflight.delete(memoKey);
  });
  couponInflight.set(memoKey, p);
  return p;
}

async function validateCouponUncached(clean: string, subtotalInt: number): Promise<CouponCheck> {
  const sb = getSupabase();
  if (!sb) return { valid: false, discount_int: 0, reason: 'Coupons unavailable offline.', coupon_id: null };
  const { data, error } = await sb.rpc('validate_coupon', { p_code: clean, p_subtotal_int: Math.round(subtotalInt) });
  if (error) throw new Error(error.message);
  const row = (Array.isArray(data) ? data[0] : data) as CouponCheck | undefined;
  return row ?? { valid: false, discount_int: 0, reason: 'Invalid code.', coupon_id: null };
}
