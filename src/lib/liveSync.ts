import type { RealtimeChannel } from '@supabase/supabase-js';
import { getSupabase } from './supabaseClient';

export type DomainEvent<T> =
  | { kind: 'INSERT'; row: T }
  | { kind: 'UPDATE'; row: T }
  | { kind: 'DELETE'; row: T };

export interface SubscribeOpts<T> {
  channelName: string;
  table: string;
  filter?: string;
  onEvent: (e: DomainEvent<T>) => void;
  onStatus?: (s: string) => void;
}

const MAX_BACKOFF_MS = 30000;

export function subscribeTable<T>(opts: SubscribeOpts<T>): () => void {
  const sb = getSupabase();
  if (!sb) return () => undefined;
  let channel: RealtimeChannel | null = null;
  let closed = false;
  let attempt = 0;
  let timer: ReturnType<typeof setTimeout> | null = null;

  const connect = (): void => {
    if (closed) return;
    try {
      if (channel) {
        try { void sb.removeChannel(channel); } catch { /* ignore */ }
        channel = null;
      }
      const uniqueName = `${opts.channelName}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      channel = sb.channel(uniqueName);
      channel.on(
        'postgres_changes' as never,
        { event: '*', schema: 'public', table: opts.table, ...(opts.filter ? { filter: opts.filter } : {}) } as never,
        (payload: { eventType: string; new: T; old: T }) => {
          attempt = 0;
          if (payload.eventType === 'INSERT') opts.onEvent({ kind: 'INSERT', row: payload.new });
          else if (payload.eventType === 'UPDATE') opts.onEvent({ kind: 'UPDATE', row: payload.new });
          else if (payload.eventType === 'DELETE') opts.onEvent({ kind: 'DELETE', row: payload.old });
        },
      );
      channel.subscribe((status) => {
        opts.onStatus?.(status);
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
          if (closed) return;
          const backoff = Math.min(1000 * 2 ** attempt, MAX_BACKOFF_MS) + Math.random() * 250;
          attempt += 1;
          timer = setTimeout(() => {
            connect();
          }, backoff);
        }
      });
    } catch (err) {
      console.warn(`[liveSync] Realtime subscribe error for ${opts.table}:`, err);
    }
  };
  connect();

  return () => {
    closed = true;
    if (timer) clearTimeout(timer);
    if (channel) {
      try { void sb.removeChannel(channel); } catch { /* ignore */ }
      channel = null;
    }
  };
}

export function onConnectivityChange(cb: (online: boolean) => void): () => void {
  const handler = (): void => cb(navigator.onLine);
  window.addEventListener('online', handler);
  window.addEventListener('offline', handler);
  return () => {
    window.removeEventListener('online', handler);
    window.removeEventListener('offline', handler);
  };
}

// NOTE: Cart/Wishlist are localStorage-only in this release (anvi_cart,
// anvi_wishlist). No offline outbox — Supabase carts/cart_items/wishlist
// tables exist for a future authenticated-sync milestone.
