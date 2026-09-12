import { getSupabase } from './supabaseClient';

export interface CouponCheck {
  valid: boolean;
  discount_int: number;
  reason: string;
  coupon_id: string | null;
}

/** Server-authoritative coupon validation. Never trust localStorage math. */
export async function validateCoupon(code: string, subtotalInt: number): Promise<CouponCheck> {
  const clean = code.trim().toUpperCase();
  if (!clean) return { valid: false, discount_int: 0, reason: 'Please enter a coupon code.', coupon_id: null };
  const sb = getSupabase();
  if (!sb) return { valid: false, discount_int: 0, reason: 'Coupons unavailable offline.', coupon_id: null };
  const { data, error } = await sb.rpc('validate_coupon', { p_code: clean, p_subtotal_int: Math.round(subtotalInt) });
  if (error) throw new Error(error.message);
  const row = (Array.isArray(data) ? data[0] : data) as CouponCheck | undefined;
  return row ?? { valid: false, discount_int: 0, reason: 'Invalid code.', coupon_id: null };
}
