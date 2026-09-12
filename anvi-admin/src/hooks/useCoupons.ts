import { useState, useCallback, useEffect } from 'react';
import { initialMockCoupons } from '../data/mockCoupons';
import type { Coupon, CouponFormData } from '../types/coupon';
import { generateId } from '../lib/utils';
import { STORAGE_KEYS, getStoredItem, setStoredItem, subscribeToStoreUpdates } from '../lib/storeSync';

const normalizeCoupon = (c: Coupon): Coupon => ({
  ...c,
  discountType: c.discountType || c.type || 'percentage',
  type: c.type || c.discountType || 'percentage',
  discountValue: c.discountValue ?? c.value ?? 10,
  value: c.value ?? c.discountValue ?? 10,
  minOrderAmount: c.minOrderAmount ?? c.minSpend ?? 0,
  minSpend: c.minSpend ?? c.minOrderAmount ?? 0,
  maxDiscountAmount: c.maxDiscountAmount ?? c.maxDiscount,
  maxDiscount: c.maxDiscount ?? c.maxDiscountAmount,
  usedCount: c.usedCount ?? c.usageCount ?? 0,
  usageCount: c.usageCount ?? c.usedCount ?? 0,
});

export function useCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    const raw: Coupon[] = getStoredItem<Coupon[]>(STORAGE_KEYS.COUPONS, initialMockCoupons);
    return raw.map(normalizeCoupon);
  });

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
    const newCoupon: Coupon = normalizeCoupon({
      ...formData,
      id: generateId('coup'),
      code: formData.code.toUpperCase().trim(),
      usageCount: 0,
      usedCount: 0,
    });
    const updated = [newCoupon, ...coupons];
    saveCoupons(updated);
    return newCoupon;
  }, [coupons]);

  const updateCoupon = useCallback((id: string, formData: Partial<CouponFormData>) => {
    const updated = coupons.map((c) =>
      c.id === id ? normalizeCoupon({ ...c, ...formData, code: formData.code ? formData.code.toUpperCase().trim() : c.code }) : c
    );
    saveCoupons(updated);
  }, [coupons]);

  const toggleCouponStatus = useCallback((id: string) => {
    const updated = coupons.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c));
    saveCoupons(updated);
  }, [coupons]);

  const deleteCoupon = useCallback((id: string) => {
    const updated = coupons.filter((c) => c.id !== id);
    saveCoupons(updated);
  }, [coupons]);

  return {
    coupons,
    addCoupon,
    updateCoupon,
    toggleCouponStatus,
    deleteCoupon,
  };
}
