/**
 * ANVI E-COMMERCE LIVE STORE SYNCHRONIZATION ENGINE
 * Reactive cross-tab and cross-port data synchronization between
 * Customer Storefront (:5173) and Admin Command (:5174).
 *
 * Uses dual-layer sync:
 * 1. Native BroadcastChannel for same-origin tabs
 * 2. Supabase Realtime Broadcast for cross-port / cross-origin (:5173 ↔ :5174)
 */

import { supabase } from './supabase';

export const STORAGE_KEYS = {
  PRODUCTS: 'anvi_store_products',
  ORDERS: 'anvi_customer_orders',
  COUPONS: 'anvi_store_coupons',
  CMS: 'anvi_store_cms',
  CATEGORIES: 'anvi_store_categories',
  LEADS: 'anvi_store_leads',
} as const;

export const SYNC_CHANNEL_NAME = 'anvi_live_store_sync';

export interface StoreSyncEvent {
  type:
    | 'PRODUCTS_UPDATED'
    | 'ORDER_PLACED'
    | 'ORDER_UPDATED'
    | 'COUPONS_UPDATED'
    | 'CMS_UPDATED'
    | 'CATEGORIES_UPDATED'
    | 'LEADS_UPDATED'
    | 'SYNC_REQUEST'
    | 'SYNC_RESPONSE';
  timestamp: number;
  key?: string;
  payload?: unknown;
}

const subscribers = new Set<(event: StoreSyncEvent) => void>();

let localChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    localChannel = new BroadcastChannel(SYNC_CHANNEL_NAME);
    localChannel.onmessage = (e: MessageEvent<StoreSyncEvent>) => {
      if (e.data && e.data.type) {
        dispatchToSubscribers(e.data, false);
      }
    };
  }
} catch {
  // Graceful fallback
}

let realtimeChannel: any = null;
let isSubscribedRealtime = false;

function initRealtimeSync(): void {
  if (typeof window === 'undefined' || realtimeChannel) return;

  try {
    realtimeChannel = supabase.channel(SYNC_CHANNEL_NAME, {
      config: { broadcast: { self: false } },
    });

    realtimeChannel.on('broadcast', { event: 'STORE_SYNC' }, (msg: { payload?: StoreSyncEvent }) => {
      if (msg?.payload && msg.payload.type) {
        dispatchToSubscribers(msg.payload, false);
      }
    });

    realtimeChannel.subscribe((status: string) => {
      if (status === 'SUBSCRIBED') {
        isSubscribedRealtime = true;
      }
    });
  } catch (err) {
    console.warn('[storeSync] Realtime channel initialization error:', err);
  }
}

function dispatchToSubscribers(event: StoreSyncEvent, isLocalOrigin: boolean): void {
  // Automatically hydrate local storage when payload and key are provided
  if (!isLocalOrigin && event.key && event.payload !== undefined && typeof window !== 'undefined') {
    try {
      localStorage.setItem(event.key, JSON.stringify(event.payload));
    } catch {
      // quota or private mode
    }
  }

  subscribers.forEach((callback) => {
    try {
      callback(event);
    } catch (err) {
      console.error('[storeSync] Subscriber callback error:', err);
    }
  });
}

/**
 * Broadcast an update event across tabs AND across ports (:5173 ↔ :5174)
 */
export const broadcastStoreUpdate = (event: StoreSyncEvent): void => {
  // 1. Same port/origin broadcast
  if (localChannel) {
    try {
      localChannel.postMessage(event);
    } catch {
      // ignore
    }
  }

  // 2. Cross-port broadcast via Supabase Realtime
  initRealtimeSync();
  if (realtimeChannel && isSubscribedRealtime) {
    try {
      void realtimeChannel.send({
        type: 'broadcast',
        event: 'STORE_SYNC',
        payload: event,
      });
    } catch {
      // ignore
    }
  } else if (realtimeChannel) {
    setTimeout(() => {
      try {
        void realtimeChannel?.send({
          type: 'broadcast',
          event: 'STORE_SYNC',
          payload: event,
        });
      } catch {
        // ignore
      }
    }, 400);
  }

  // Also dispatch locally
  dispatchToSubscribers(event, true);
};

/**
 * Subscribe to live store updates from any tab or port
 */
export const subscribeToStoreUpdates = (callback: (event: StoreSyncEvent) => void): (() => void) => {
  if (typeof window === 'undefined') return () => {};

  initRealtimeSync();
  subscribers.add(callback);

  const handleStorageEvent = (e: StorageEvent) => {
    if (Object.values(STORAGE_KEYS).includes(e.key as (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS])) {
      const typeMap: Record<string, StoreSyncEvent['type']> = {
        [STORAGE_KEYS.PRODUCTS]: 'PRODUCTS_UPDATED',
        [STORAGE_KEYS.ORDERS]: 'ORDER_UPDATED',
        [STORAGE_KEYS.COUPONS]: 'COUPONS_UPDATED',
        [STORAGE_KEYS.CMS]: 'CMS_UPDATED',
        [STORAGE_KEYS.CATEGORIES]: 'CATEGORIES_UPDATED',
        [STORAGE_KEYS.LEADS]: 'LEADS_UPDATED',
      };
      const mappedType = e.key ? typeMap[e.key] || 'PRODUCTS_UPDATED' : 'PRODUCTS_UPDATED';
      callback({
        type: mappedType,
        timestamp: Date.now(),
        key: e.key || undefined,
      });
    }
  };

  window.addEventListener('storage', handleStorageEvent);

  return () => {
    subscribers.delete(callback);
    window.removeEventListener('storage', handleStorageEvent);
  };
};

export const getStoredItem = <T>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

export const setStoredItem = <T>(key: string, value: T, eventType?: StoreSyncEvent['type']): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
    if (eventType) {
      broadcastStoreUpdate({
        type: eventType,
        timestamp: Date.now(),
        key,
        payload: value,
      });
    }
  } catch {
    // ignore
  }
};
