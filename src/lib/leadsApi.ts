import { getSupabase } from './supabaseClient';
import { STORAGE_KEYS, getStoredItem, setStoredItem } from './storeSync';

export const UNLOCKED_COUPON_KEY = 'anvi_unlocked_coupon';
export const LEAD_SUBMITTED_KEY = 'anvi_lead_submitted';
export const WELCOME_COUPON = 'WELCOME10';

export interface SubmitLeadInput {
  fullName: string;
  email: string;
  phone: string;
  source?: string;
  consent?: boolean;
}

/** Insert lead server-side. Requires unique email (see migration 20260911000005). Duplicate returns duplicate:true. */
export async function submitLead(input: SubmitLeadInput): Promise<{ coupon: string; duplicate: boolean }> {
  const cleanEmail = input.email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) throw new Error('Invalid email');
  if (input.phone.replace(/\D/g, '').length < 10) throw new Error('Invalid phone');

  const sb = getSupabase();
  if (!sb) {
    try {
      localStorage.setItem(UNLOCKED_COUPON_KEY, WELCOME_COUPON);
      sessionStorage.setItem(UNLOCKED_COUPON_KEY, WELCOME_COUPON);
      sessionStorage.setItem(LEAD_SUBMITTED_KEY, 'true');
    } catch {
      // private mode
    }
    return { coupon: WELCOME_COUPON, duplicate: false };
  }

  const { error } = await sb.from('leads').insert({
    full_name: input.fullName.trim(),
    email: cleanEmail,
    phone: input.phone.trim(),
    source: input.source ?? 'website_popup',
    coupon_unlocked_code: WELCOME_COUPON,
    consent_whatsapp: input.consent ?? true,
    interest_category: 'Privilege Patron',
    notes: `Storefront popup lead. Unlocked: ${WELCOME_COUPON}`,
  });

  const code = (error as { code?: string } | null)?.code;
  if (error && code !== '23505') throw new Error(error.message);

  const newLead = {
    id: `lead-${Date.now()}`,
    fullName: input.fullName.trim(),
    name: input.fullName.trim(),
    email: cleanEmail,
    phone: input.phone.trim(),
    source: 'website_popup',
    status: 'new',
    interestCategory: 'Privilege Patron',
    createdAt: new Date().toISOString(),
  };

  try {
    const existing = getStoredItem<any[]>(STORAGE_KEYS.LEADS, []);
    setStoredItem(STORAGE_KEYS.LEADS, [newLead, ...existing], 'LEADS_UPDATED');
    localStorage.setItem(UNLOCKED_COUPON_KEY, WELCOME_COUPON);
    sessionStorage.setItem(UNLOCKED_COUPON_KEY, WELCOME_COUPON);
    sessionStorage.setItem(LEAD_SUBMITTED_KEY, 'true');
  } catch {
    // ignore
  }
  return { coupon: WELCOME_COUPON, duplicate: code === '23505' };
}

export function getUnlockedCoupon(): string | null {
  try {
    return sessionStorage.getItem(UNLOCKED_COUPON_KEY) ?? localStorage.getItem(UNLOCKED_COUPON_KEY);
  } catch {
    return null;
  }
}
