import React, { useState, useEffect, useCallback } from 'react';
import { getSupabase } from '../lib/supabaseClient';
import { AuthContext } from './auth-context';
import type { AuthContextValue, Profile } from './auth-context';

async function fetchProfile(userId: string): Promise<Profile | null> {
  const sb = getSupabase();
  if (!sb) return null;
  try {
    const { data, error } = await sb
      .from('profiles')
      .select('id,email,first_name,last_name,phone,app_role')
      .eq('id', userId)
      .maybeSingle();
    if (error || !data) return null;
    return data as Profile;
  } catch {
    return null;
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<AuthContextValue['session']>(null);
  const [user, setUser] = useState<AuthContextValue['user']>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sb = getSupabase();
    if (!sb) {
      setLoading(false);
      return;
    }
    let cancelled = false;

    sb.auth
      .getSession()
      .then(({ data }) => {
        if (cancelled) return;
        setSession(data.session);
        setUser(data.session?.user ?? null);
        setLoading(false);
        if (data.session?.user) {
          void fetchProfile(data.session.user.id).then((p) => {
            if (!cancelled) setProfile(p);
          });
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });

    const { data: listener } = sb.auth.onAuthStateChange((_event, newSession) => {
      if (cancelled) return;
      setSession(newSession);
      setUser(newSession?.user ?? null);
      if (newSession?.user) {
        void fetchProfile(newSession.user.id).then((p) => {
          if (!cancelled) setProfile(p);
        });
      } else {
        setProfile(null);
      }
    });

    return () => {
      cancelled = true;
      listener.subscription.unsubscribe();
    };
  }, []);

  const signUp = useCallback(async (fullName: string, email: string, password: string) => {
    const sb = getSupabase();
    if (!sb) throw new Error('Accounts are unavailable while offline. Please reconnect and try again.');
    const { error } = await sb.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { full_name: fullName.trim() } },
    });
    if (error) throw error;
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const sb = getSupabase();
    if (!sb) throw new Error('Accounts are unavailable while offline. Please reconnect and try again.');
    const { error } = await sb.auth.signInWithPassword({ email: email.trim(), password });
    if (error) throw error;
  }, []);

  const signOut = useCallback(async () => {
    const sb = getSupabase();
    setProfile(null);
    if (!sb) {
      setSession(null);
      setUser(null);
      return;
    }
    const { error } = await sb.auth.signOut();
    if (error) throw error;
    setSession(null);
    setUser(null);
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    const sb = getSupabase();
    if (!sb) throw new Error('Accounts are unavailable while offline. Please reconnect and try again.');
    const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}/account` : undefined;
    const { error } = await sb.auth.resetPasswordForEmail(email.trim(), redirectTo ? { redirectTo } : undefined);
    if (error) throw error;
  }, []);

  const verifyOtp = useCallback(async (email: string, token: string) => {
    const sb = getSupabase();
    if (!sb) throw new Error('Accounts are unavailable while offline. Please reconnect and try again.');
    const cleanToken = token.trim();
    const cleanEmail = email.trim();
    let res = await sb.auth.verifyOtp({
      email: cleanEmail,
      token: cleanToken,
      type: 'signup',
    });
    if (res.error) {
      const fallbackRes = await sb.auth.verifyOtp({
        email: cleanEmail,
        token: cleanToken,
        type: 'email',
      });
      if (!fallbackRes.error) {
        res = fallbackRes;
      } else {
        throw res.error;
      }
    }
    if (res.data.session) {
      setSession(res.data.session);
      setUser(res.data.session.user);
      void fetchProfile(res.data.session.user.id).then((p) => setProfile(p));
    }
  }, []);

  const resendConfirmation = useCallback(async (email: string) => {
    const sb = getSupabase();
    if (!sb) throw new Error('Accounts are unavailable while offline. Please reconnect and try again.');
    const { error } = await sb.auth.resend({
      type: 'signup',
      email: email.trim(),
    });
    if (error) throw error;
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    const p = await fetchProfile(user.id);
    setProfile(p);
  }, [user]);

  return (
    <AuthContext.Provider
      value={{ session, user, profile, loading, signUp, signIn, signOut, resetPassword, verifyOtp, resendConfirmation, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
};
