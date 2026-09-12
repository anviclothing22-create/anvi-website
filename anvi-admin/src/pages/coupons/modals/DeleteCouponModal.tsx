import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Coupon } from '@/types/coupon';

interface DeleteCouponModalProps {
  isOpen: boolean;
  onClose: () => void;
  coupon: Coupon | null;
  onConfirm: (id: string) => void;
  loading?: boolean;
}

export const DeleteCouponModal: React.FC<DeleteCouponModalProps> = ({
  isOpen,
  onClose,
  coupon,
  onConfirm,
  loading = false,
}) => {
  if (!coupon) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Revoke Promotional Coupon"
      size="md"
    >
      <div className="space-y-4">
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs text-rose-900">
            <p className="font-semibold">Confirm Revocation</p>
            <p className="leading-relaxed">
              Are you sure you want to revoke <span className="font-mono font-bold">{coupon.code}</span>?
              Customers will no longer be able to apply this discount during checkout.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-anvi-sand/40">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => onConfirm(coupon.id)}
            loading={loading}
          >
            Revoke Code
          </Button>
        </div>
      </div>
    </Modal>
  );
};
export default DeleteCouponModal;
