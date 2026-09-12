import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | null = null;

/** Shared Supabase client (anon key only — RLS enforced). Returns null when env missing (offline/dev fallback). */
export function getSupabase(): SupabaseClient | null {
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
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
  return Boolean(
    (import.meta.env.VITE_SUPABASE_URL as string | undefined) &&
      (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined),
  );
}
