import React from 'react';
import { Coupon } from '@/types/coupon';
import { formatCurrency } from '@/lib/formatCurrency';
import { formatDate } from '@/lib/formatDate';
import { CouponStatusBadge } from './CouponStatusBadge';
import { CouponActions } from './CouponActions';

interface CouponTableRowProps {
  coupon: Coupon;
  onEdit: (coupon: Coupon) => void;
  onDelete: (coupon: Coupon) => void;
  onToggleStatus: (id: string, currentStatus: boolean) => void;
}

export const CouponTableRow: React.FC<CouponTableRowProps> = ({
  coupon,
  onEdit,
  onDelete,
}) => {
  const discountType = coupon.discountType || coupon.type || 'percentage';
  const discountVal = coupon.discountValue ?? coupon.value ?? 10;
  const maxDisc = coupon.maxDiscountAmount ?? coupon.maxDiscount;
  const minSpend = coupon.minOrderAmount ?? coupon.minSpend;
  const count = coupon.usedCount ?? coupon.usageCount ?? 0;

  return (
    <tr className="border-b border-anvi-sand/30 hover:bg-anvi-linen/30 transition-colors group">
      {/* Code & Description */}
      <td className="py-3.5 px-4">
        <div className="space-y-0.5">
          <span className="inline-block font-mono font-bold text-xs bg-anvi-linen text-anvi-maroon px-2 py-0.5 rounded border border-anvi-sand/60">
            {coupon.code}
          </span>
          <p className="text-xs text-anvi-charcoal font-medium line-clamp-1">
            {coupon.description || 'Promotional offer'}
          </p>
        </div>
      </td>

      {/* Discount Rate */}
      <td className="py-3.5 px-4 text-xs font-serif font-bold text-anvi-charcoal">
        {discountType === 'percentage'
          ? `${discountVal}% OFF`
          : `${formatCurrency(discountVal)} OFF`}
        {maxDisc && (
          <span className="block text-[10px] font-sans font-normal text-anvi-muted">
            Up to {formatCurrency(maxDisc)}
          </span>
        )}
      </td>

      {/* Min Order Spend */}
      <td className="py-3.5 px-4 text-xs font-mono text-anvi-charcoal">
        {minSpend ? formatCurrency(minSpend) : 'No min'}
      </td>

      {/* Redemptions / Limit */}
      <td className="py-3.5 px-4 text-xs">
        <span className="font-semibold text-anvi-charcoal">{count}</span>
        <span className="text-anvi-muted"> / {coupon.usageLimit ? `${coupon.usageLimit}` : '∞'}</span>
      </td>

      {/* Validity Window */}
      <td className="py-3.5 px-4 text-xs text-anvi-muted font-mono">
        {formatDate(coupon.endDate)}
      </td>

      {/* Status */}
      <td className="py-3.5 px-4">
        <CouponStatusBadge coupon={coupon} />
      </td>

      {/* Actions */}
      <td className="py-3.5 px-4 text-right">
        <CouponActions
          coupon={coupon}
          onEdit={() => onEdit(coupon)}
          onDelete={() => onDelete(coupon)}
        />
      </td>
    </tr>
  );
};
export default CouponTableRow;
