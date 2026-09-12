import React from 'react';
import { Tag, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface CouponEmptyStateProps {
  onCreateCoupon: () => void;
}

export const CouponEmptyState: React.FC<CouponEmptyStateProps> = ({ onCreateCoupon }) => {
  return (
    <div className="py-16 text-center space-y-4 max-w-sm mx-auto">
      <div className="w-14 h-14 rounded-2xl bg-anvi-linen border border-anvi-sand flex items-center justify-center mx-auto text-anvi-muted">
        <Tag className="w-7 h-7" />
      </div>
      <div className="space-y-1">
        <h3 className="text-base font-serif font-bold text-anvi-charcoal">
          No promotional codes active
        </h3>
        <p className="text-xs text-anvi-muted leading-relaxed">
          Create festive discounts, bridal privilege passes, or first-purchase welcome vouchers.
        </p>
      </div>
      <Button onClick={onCreateCoupon} size="sm">
        <Plus className="w-4 h-4" />
        <span>Create Privilege Voucher</span>
      </Button>
    </div>
  );
};
export default CouponEmptyState;
