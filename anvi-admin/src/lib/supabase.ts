import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!url || !anon) {
  console.warn('[anvi-admin] Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY');
}

export const supabase = createClient(url ?? '', anon ?? '', {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, storageKey: 'anvi-admin-auth' },
});

/** Guard for admin routes: accepts active admin session or Supabase session with app_role = admin/support. */
export async function requireAdmin(): Promise<string> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error('NO_SESSION');
  const { data, error } = await supabase.from('profiles').select('app_role').eq('id', session.user.id).single();
  if (error) throw new Error('NOT_ADMIN');
  const role = (data as { app_role?: string } | null)?.app_role;
  if (role !== 'admin' && role !== 'support') {
    await supabase.auth.signOut();
    throw new Error('NOT_ADMIN');
  }
  return session.user.id;
}
