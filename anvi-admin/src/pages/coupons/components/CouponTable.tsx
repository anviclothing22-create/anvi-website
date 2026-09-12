import React from 'react';
import { Coupon } from '@/types/coupon';
import { CouponTableRow } from './CouponTableRow';
import { CouponEmptyState } from './CouponEmptyState';

interface CouponTableProps {
  coupons: Coupon[];
  onEdit: (coupon: Coupon) => void;
  onDelete: (coupon: Coupon) => void;
  onToggleStatus: (id: string, currentStatus: boolean) => void;
  onCreateCoupon: () => void;
}

export const CouponTable: React.FC<CouponTableProps> = ({
  coupons,
  onEdit,
  onDelete,
  onToggleStatus,
  onCreateCoupon,
}) => {
  if (coupons.length === 0) {
    return <CouponEmptyState onCreateCoupon={onCreateCoupon} />;
  }

  return (
    <div className="bg-white rounded-2xl border border-anvi-sand/60 shadow-luxury-subtle overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-anvi-linen/50 border-b border-anvi-sand/60 text-[11px] font-sans font-semibold uppercase tracking-wider text-anvi-muted">
            <tr>
              <th className="py-3.5 px-4 text-left">Coupon Code & Campaign</th>
              <th className="py-3.5 px-4 text-left">Discount Rate</th>
              <th className="py-3.5 px-4 text-left">Min Spend</th>
              <th className="py-3.5 px-4 text-left">Redeemed</th>
              <th className="py-3.5 px-4 text-left">Expiry Date</th>
              <th className="py-3.5 px-4 text-left">Status</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-anvi-sand/20">
            {coupons.map((coupon) => (
              <CouponTableRow
                key={coupon.id}
                coupon={coupon}
                onEdit={onEdit}
                onDelete={onDelete}
                onToggleStatus={onToggleStatus}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default CouponTable;
