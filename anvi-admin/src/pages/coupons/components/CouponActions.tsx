import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { IconButton } from '@/components/ui/IconButton';
import { Coupon } from '@/types/coupon';

interface CouponActionsProps {
  coupon: Coupon;
  onEdit: () => void;
  onDelete: () => void;
}

export const CouponActions: React.FC<CouponActionsProps> = ({
  onEdit,
  onDelete,
}) => {
  return (
    <div className="flex items-center justify-end gap-1">
      <IconButton
        icon={Edit2}
        label="Edit Code"
        onClick={onEdit}
        className="text-anvi-muted hover:text-anvi-maroon"
      />
      <IconButton
        icon={Trash2}
        label="Revoke Code"
        onClick={onDelete}
        className="text-anvi-muted hover:text-rose-600"
      />
    </div>
  );
};
export default CouponActions;
