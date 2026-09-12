import React from 'react';
import { Coupon } from '@/types/coupon';

interface CouponStatusBadgeProps {
  coupon: Coupon;
}

export const CouponStatusBadge: React.FC<CouponStatusBadgeProps> = ({ coupon }) => {
  const isExpired = new Date(coupon.endDate) < new Date();
  const count = coupon.usedCount ?? coupon.usageCount ?? 0;
  const isLimitReached = coupon.usageLimit ? count >= coupon.usageLimit : false;

  if (!coupon.isActive) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-stone-100 text-stone-600 border border-stone-200">
        Disabled
      </span>
    );
  }

  if (isExpired) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-rose-50 text-rose-700 border border-rose-200">
        Expired
      </span>
    );
  }

  if (isLimitReached) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
        Exhausted
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
      Active
    </span>
  );
};
export default CouponStatusBadge;
