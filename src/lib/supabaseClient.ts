import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const FALLBACK_SUPABASE_URL = 'https://dpgjizuamndpmpfmmsxv.supabase.co';
const FALLBACK_SUPABASE_ANON_KEY = 'sb_publishable_j18bKyDSn59jFwCaupbWaw_m819_hKt';

let client: SupabaseClient | null = null;

/** Shared Supabase client (anon key only — RLS enforced). Falls back to active ANVI project when env missing. */
export function getSupabase(): SupabaseClient | null {
  const url = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim() || FALLBACK_SUPABASE_URL;
  const key = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim() || FALLBACK_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  if (!client) {
    client = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
        storageKey: 'anvi-storefront-auth',
      },
      realtime: { params: { eventsPerSecond: 10 } },
    });
  }
  return client;
}

/** True when Supabase env is configured. */
export function isSupabaseConfigured(): boolean {
  const url = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim() || FALLBACK_SUPABASE_URL;
  const key = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim() || FALLBACK_SUPABASE_ANON_KEY;
  return Boolean(url && key);
}

