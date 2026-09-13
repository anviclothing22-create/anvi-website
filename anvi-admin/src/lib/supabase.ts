import { createClient } from '@supabase/supabase-js';

const FALLBACK_SUPABASE_URL = 'https://dpgjizuamndpmpfmmsxv.supabase.co';
const FALLBACK_SUPABASE_ANON_KEY = 'sb_publishable_j18bKyDSn59jFwCaupbWaw_m819_hKt';

const url = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim() || FALLBACK_SUPABASE_URL;
const anon = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim() || FALLBACK_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anon);

export const supabase = createClient(url, anon, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, storageKey: 'anvi-admin-auth' },
});

/** Guard for admin routes: accepts active local admin session or Supabase session with app_role = admin/support. */
export async function requireAdmin(): Promise<string> {
  // 1. Check if we already have an active Supabase authenticated session
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session) {
      const { data, error } = await supabase.from('profiles').select('app_role').eq('id', session.user.id).single();
      if (!error) {
        const role = (data as { app_role?: string } | null)?.app_role;
        if (role === 'admin' || role === 'support') {
          return session.user.id;
        }
      }
    }
  } catch (err) {
    console.warn('[requireAdmin] Supabase auth check error:', err);
  }

  // 2. Direct founder / local administrator session: auto-establish Supabase session
  if (typeof window !== 'undefined') {
    const localSession = localStorage.getItem('anvi_admin_auth');
    if (localSession === 'anvi_admin_session') {
      try {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: 'anviclothing22@gmail.com',
          password: 'anvi@2026',
        });
        if (!authError && authData.session) {
          return authData.session.user.id;
        }
      } catch (err) {
        console.warn('[requireAdmin] Auto Supabase auth attempt:', err);
      }
      return 'admin_local_founder';
    }
  }

  throw new Error('NOT_ADMIN');
}


