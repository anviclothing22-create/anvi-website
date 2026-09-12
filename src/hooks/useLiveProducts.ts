import { useState, useEffect } from 'react';
import { productsData } from '../data/products';
import { fetchProducts } from '../lib/productsApi';
import { subscribeTable, onConnectivityChange } from '../lib/liveSync';
import { STORAGE_KEYS, getStoredItem, subscribeToStoreUpdates } from '../lib/storeSync';
import type { Product } from '../lib/types';

const CACHE_KEY = 'anvi_cache_products_v1';
const CACHE_TS_KEY = 'anvi_cache_products_ts_v1';
const CACHE_TTL_MS = 5 * 60 * 1000;

export function normalizeToStorefrontProduct(p: any): Product {
  const rawImages = p.images || [];
  const images = rawImages.map((img: any) => (typeof img === 'string' ? img : img?.url || ''));
  const validImages = images.filter(Boolean).length > 0 ? images.filter(Boolean) : ['/images/products/saree_ajrakh_1.jpg'];
  const stock = p.stockQuantity ?? p.stock ?? 15;
  const availability = p.availability === 'Out of Stock' || stock === 0
    ? 'Sold Out'
    : (p.availability || 'In Stock');

  return {
    id: String(p.id),
    slug: p.slug || p.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || `prod-${p.id}`,
    name: p.name || 'Handcrafted Creation',
    category: p.category || 'Sarees',
    price: Number(p.price ?? p.price_int ?? 0),
    originalPrice: p.originalPrice ?? p.original_price_int ?? undefined,
    images: validImages,
    description: p.description || '',
    availability: availability as Product['availability'],
    variants: p.variants && p.variants.length > 0 ? p.variants : ['Free Size'],
    tags: p.tags || [],
    collection: p.collection || 'New Arrivals',
    occasion: p.occasion || 'Festive',
    isNewArrival: Boolean(p.isNewArrival ?? p.is_new_arrival),
    isBestseller: Boolean(p.isBestseller ?? p.is_bestseller),
    isOutOfStock: stock === 0 || availability === 'Sold Out',
    isOnSale: Boolean(p.isOnSale || (p.originalPrice && p.originalPrice > p.price)),
    stock: stock,
    fabric: p.fabric || undefined,
    care: p.care || p.fabricCare || p.careInstructions || undefined,
  };
}

function readStoredOrCache(): Product[] | null {
  // DB is canonical. Cache (5-min TTL) is the only boot fast-path.
  // Admin localStorage overrides are NOT used at boot to avoid stale
  // localStorage permanently shadowing Supabase. They arrive via
  // PRODUCTS_UPDATED events and via loadProducts fallback when offline.
  try {
    const ts = Number(localStorage.getItem(CACHE_TS_KEY) ?? '0');
    if (Date.now() - ts <= CACHE_TTL_MS) {
      const raw = localStorage.getItem(CACHE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as any[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map(normalizeToStorefrontProduct);
        }
      }
    }
  } catch {
    // continue
  }

  return null;
}

/** Clear local admin overrides + cache so next load uses live DB. */
export function resetLiveProductsToServer(): void {
  try {
    localStorage.removeItem(CACHE_KEY);
    localStorage.removeItem(CACHE_TS_KEY);
  } catch {
    // ignore
  }
  sharedProducts = [...productsData];
  listeners.forEach((fn) => {
    try { fn(sharedProducts); } catch { /* ignore */ }
  });
  void loadProducts();
}

// Module-level shared store to prevent redundant network requests and duplicate channels
let sharedProducts: Product[] = readStoredOrCache() ?? productsData;
const listeners = new Set<(prods: Product[]) => void>();
let unsubRealtime: (() => void) | null = null;
let unsubNet: (() => void) | null = null;
let unsubStoreSync: (() => void) | null = null;
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let isFetching = false;

async function loadProducts(): Promise<void> {
  if (isFetching) return;
  if (typeof navigator !== 'undefined' && !navigator.onLine) return;
  isFetching = true;
  try {
    const res = await fetchProducts({ limit: 200 });
    if (res.data && res.data.length > 0) {
      // Supabase is the source of truth. Use live DB rows directly.
      sharedProducts = res.data;

      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(sharedProducts));
        localStorage.setItem(CACHE_TS_KEY, String(Date.now()));
      } catch {
        // quota full — keep in-memory only
      }
      listeners.forEach((fn) => {
        try { fn(sharedProducts); } catch { /* ignore */ }
      });
    }
  } catch (err) {
    console.warn('[useLiveProducts] Failed to fetch live products, keeping current cache:', err);
  } finally {
    isFetching = false;
  }
}

function scheduleReload(): void {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    void loadProducts();
  }, 400);
}

function startSubscriptionIfNeeded(): void {
  // 1. Supabase Postgres Changes
  if (!unsubRealtime) {
    unsubRealtime = subscribeTable<Record<string, unknown>>({
      channelName: 'storefront-products',
      table: 'products',
      onEvent: () => scheduleReload(),
    });
  }

  // 2. Admin Command Cross-Port Realtime Sync (:5174 ↔ :5173)
  if (!unsubStoreSync) {
    unsubStoreSync = subscribeToStoreUpdates((event) => {
      if (event.type === 'PRODUCTS_UPDATED') {
        const stored = getStoredItem<any[]>(STORAGE_KEYS.PRODUCTS, []);
        if (stored && stored.length > 0) {
          sharedProducts = stored.map(normalizeToStorefrontProduct);
          try {
            localStorage.setItem(CACHE_KEY, JSON.stringify(sharedProducts));
            localStorage.setItem(CACHE_TS_KEY, String(Date.now()));
          } catch {
            // ignore
          }
          listeners.forEach((fn) => {
            try { fn(sharedProducts); } catch { /* ignore */ }
          });
        } else {
          scheduleReload();
        }
      }
    });
  }

  // 3. Online/Offline Network Status
  if (!unsubNet) {
    unsubNet = onConnectivityChange((online) => {
      if (online) void loadProducts();
    });
  }
}

function stopSubscriptionIfUnused(): void {
  if (listeners.size === 0) {
    if (debounceTimer) clearTimeout(debounceTimer);
    if (unsubRealtime) {
      unsubRealtime();
      unsubRealtime = null;
    }
    if (unsubStoreSync) {
      unsubStoreSync();
      unsubStoreSync = null;
    }
    if (unsubNet) {
      unsubNet();
      unsubNet = null;
    }
  }
}

/**
 * Live storefront catalog — Realtime dual-layer sync with Admin Command and Supabase.
 * Updates immediately (< 200ms) whenever changes occur in Admin or Database.
 */
export function useLiveProducts(): Product[] {
  const [products, setProducts] = useState<Product[]>(() => sharedProducts);

  useEffect(() => {
    const listener = (newProducts: Product[]) => {
      setProducts(newProducts);
    };

    listeners.add(listener);
    startSubscriptionIfNeeded();

    // Check if storeSync has more recent updates
    const stored = getStoredItem<any[]>(STORAGE_KEYS.PRODUCTS, []);
    if (stored && stored.length > 0) {
      const normalized = stored.map(normalizeToStorefrontProduct);
      setProducts(normalized);
    } else {
      void loadProducts();
    }

    return () => {
      listeners.delete(listener);
      stopSubscriptionIfUnused();
    };
  }, []);

  return products;
}

export default useLiveProducts;
