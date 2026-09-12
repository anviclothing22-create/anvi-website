/**
 * Indian Pincode & Phone Validators
 * Used by CheckoutPage and LeadCouponModal
 */

export const IN_PINCODE = /^[1-9][0-9]{5}$/;
export const IN_PHONE_E164 = /^\+91[6-9]\d{9}$/;

/**
 * Normalizes user-entered phone input into Indian E.164 format (+91XXXXXXXXXX)
 */
export function normalizePhone(raw: string): string {
  if (!raw) return '';
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 10) {
    return `+91${digits}`;
  }
  if (digits.length === 12 && digits.startsWith('91')) {
    return `+${digits}`;
  }
  if (raw.trim().startsWith('+')) {
    return `+${digits}`;
  }
  return raw.trim();
}
