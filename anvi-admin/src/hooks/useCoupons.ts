import { useState, useCallback, useEffect } from 'react';
import { initialMockCoupons } from '../data/mockCoupons';
import type { Coupon, CouponFormData } from '../types/coupon';
import { generateUUID, isUUID } from '../lib/utils';
import { STORAGE_KEYS, getStoredItem, setStoredItem, subscribeToStoreUpdates } from '../lib/storeSync';
import { supabase } from '../lib/supabase';

const normalizeCoupon = (c: any): Coupon => ({
  ...c,
  id: String(c.id),
  code: (c.code || '').toUpperCase().trim(),
  discountType: c.discount_type || c.discountType || c.type || 'percentage',
  type: c.discount_type || c.type || c.discountType || 'percentage',
  discountValue: c.discount_value ?? c.discountValue ?? c.value ?? 10,
  value: c.discount_value ?? c.value ?? c.discountValue ?? 10,
  minOrderAmount: c.min_order_amount_int ?? c.minOrderAmount ?? c.minSpend ?? 0,
  minSpend: c.min_order_amount_int ?? c.minSpend ?? c.minOrderAmount ?? 0,
  maxDiscountAmount: c.max_discount_amount_int ?? c.maxDiscountAmount ?? c.maxDiscount,
  maxDiscount: c.max_discount_amount_int ?? c.maxDiscount ?? c.maxDiscountAmount,
  usedCount: c.used_count ?? c.usedCount ?? c.usageCount ?? 0,
  usageCount: c.used_count ?? c.usageCount ?? c.usedCount ?? 0,
  isActive: c.is_active ?? c.isActive ?? true,
});

export function useCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    const raw: Coupon[] = getStoredItem<Coupon[]>(STORAGE_KEYS.COUPONS, initialMockCoupons);
    return raw.map(normalizeCoupon);
  });

  // Fetch live coupons from Supabase on mount
  useEffect(() => {
    let cancelled = false;
    async function loadLiveCoupons() {
      try {
        const { data, error } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
        if (!error && data && data.length > 0 && !cancelled) {
          const mapped = data.map(normalizeCoupon);
          setCoupons(mapped);
          setStoredItem(STORAGE_KEYS.COUPONS, mapped, 'COUPONS_UPDATED');
        }
      } catch (err) {
        console.warn('[useCoupons] Load live coupons error:', err);
      }
    }
    loadLiveCoupons();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToStoreUpdates((event) => {
      if (event.type === 'COUPONS_UPDATED') {
        const raw = getStoredItem<Coupon[]>(STORAGE_KEYS.COUPONS, initialMockCoupons);
        setCoupons(raw.map(normalizeCoupon));
      }
    });
    return unsubscribe;
  }, []);

  const saveCoupons = (updated: Coupon[]) => {
    setCoupons(updated);
    setStoredItem(STORAGE_KEYS.COUPONS, updated, 'COUPONS_UPDATED');
  };

  const addCoupon = useCallback((formData: CouponFormData) => {
    const couponId = generateUUID();
    const newCoupon: Coupon = normalizeCoupon({
      ...formData,
      id: couponId,
      code: formData.code.toUpperCase().trim(),
      usageCount: 0,
      usedCount: 0,
      isActive: true,
    });
    const updated = [newCoupon, ...coupons];
    saveCoupons(updated);

    try {
      void supabase.from('coupons').insert({
        id: couponId,
        code: newCoupon.code,
        discount_type: newCoupon.discountType === 'fixed' ? 'fixed' : 'percentage',
        discount_value: Number(newCoupon.discountValue || 10),
        min_order_amount_int: Number(newCoupon.minOrderAmount || 0),
        max_discount_amount_int: newCoupon.maxDiscountAmount ? Number(newCoupon.maxDiscountAmount) : null,
        description: newCoupon.description || 'Promotional coupon',
        is_active: true,
      }).then(({ error }) => {
        if (error) console.error('[useCoupons] Supabase insert coupon error:', error);
      });
    } catch (err) {
      console.warn('[useCoupons] Supabase insert coupon exception:', err);
    }

    return newCoupon;
  }, [coupons]);

  const updateCoupon = useCallback((id: string, formData: Partial<CouponFormData>) => {
    const updated = coupons.map((c) =>
      c.id === id ? normalizeCoupon({ ...c, ...formData, code: formData.code ? formData.code.toUpperCase().trim() : c.code }) : c
    );
    saveCoupons(updated);

    try {
      const c = updated.find((item) => item.id === id);
      if (c) {
        const payload = {
          code: c.code,
          discount_type: c.discountType === 'fixed' ? 'fixed' : 'percentage',
          discount_value: Number(c.discountValue || 10),
          min_order_amount_int: Number(c.minOrderAmount || 0),
          max_discount_amount_int: c.maxDiscountAmount ? Number(c.maxDiscountAmount) : null,
          description: c.description || '',
          is_active: c.isActive ?? true,
        };
        const query = isUUID(id)
          ? supabase.from('coupons').update(payload).eq('id', id)
          : supabase.from('coupons').update(payload).or(`code.eq.${c.code},id.eq.${id}`);
        void query.then(({ error }) => {
          if (error) console.error('[useCoupons] Supabase update coupon error:', error);
        });
      }
    } catch (err) {
      console.warn('[useCoupons] Supabase update coupon exception:', err);
    }
  }, [coupons]);

  const toggleCouponStatus = useCallback((id: string) => {
    let nextStatus = true;
    const updated = coupons.map((c) => {
      if (c.id === id) {
        nextStatus = !c.isActive;
        return { ...c, isActive: nextStatus };
      }
      return c;
    });
    saveCoupons(updated);

    try {
      const query = isUUID(id)
        ? supabase.from('coupons').update({ is_active: nextStatus }).eq('id', id)
        : supabase.from('coupons').update({ is_active: nextStatus }).or(`id.eq.${id}`);
      void query.then(({ error }) => {
        if (error) console.error('[useCoupons] Supabase toggle coupon error:', error);
      });
    } catch (err) {
      console.warn('[useCoupons] Supabase toggle coupon exception:', err);
    }
  }, [coupons]);

  const deleteCoupon = useCallback((id: string) => {
    const updated = coupons.filter((c) => c.id !== id);
    saveCoupons(updated);

    try {
      const query = isUUID(id)
        ? supabase.from('coupons').delete().eq('id', id)
        : supabase.from('coupons').delete().or(`id.eq.${id}`);
      void query.then(({ error }) => {
        if (error) console.error('[useCoupons] Supabase delete coupon error:', error);
      });
    } catch (err) {
      console.warn('[useCoupons] Supabase delete coupon exception:', err);
    }
  }, [coupons]);

  return {
    coupons,
    addCoupon,
    updateCoupon,
    toggleCouponStatus,
    deleteCoupon,
  };
}

