import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { CouponTable } from './components/CouponTable';
import { CreateCouponModal } from './modals/CreateCouponModal';
import { EditCouponModal } from './modals/EditCouponModal';
import { DeleteCouponModal } from './modals/DeleteCouponModal';
import { useCoupons } from '@/hooks/useCoupons';
import { Coupon, CouponFormData } from '@/types/coupon';

export const CouponsPage: React.FC = () => {
  const {
    coupons,
    addCoupon,
    updateCoupon,
    deleteCoupon,
    toggleCouponStatus,
  } = useCoupons();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [deletingCoupon, setDeletingCoupon] = useState<Coupon | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const handleAddSubmit = (data: CouponFormData) => {
    setActionLoading(true);
    setTimeout(() => {
      addCoupon(data);
      setActionLoading(false);
      setIsAddOpen(false);
    }, 400);
  };

  const handleEditSubmit = (id: string, data: Partial<CouponFormData>) => {
    setActionLoading(true);
    setTimeout(() => {
      updateCoupon(id, data);
      setActionLoading(false);
      setEditingCoupon(null);
    }, 400);
  };

  const handleDeleteSubmit = (id: string) => {
    setActionLoading(true);
    setTimeout(() => {
      deleteCoupon(id);
      setActionLoading(false);
      setDeletingCoupon(null);
    }, 400);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Promotions & Privilege Vouchers"
        subtitle={`Managing ${coupons.length} promotional codes for storefront patrons and bespoke clients.`}
        actions={
          <Button
            size="sm"
            onClick={() => setIsAddOpen(true)}
            className="text-xs"
          >
            <Plus className="w-4 h-4" />
            <span>New Privilege Code</span>
          </Button>
        }
      />

      <CouponTable
        coupons={coupons}
        onEdit={(c) => setEditingCoupon(c)}
        onDelete={(c) => setDeletingCoupon(c)}
        onToggleStatus={toggleCouponStatus}
        onCreateCoupon={() => setIsAddOpen(true)}
      />

      <CreateCouponModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onCreate={handleAddSubmit}
        loading={actionLoading}
      />

      <EditCouponModal
        isOpen={!!editingCoupon}
        onClose={() => setEditingCoupon(null)}
        coupon={editingCoupon}
        onUpdate={handleEditSubmit}
        loading={actionLoading}
      />

      <DeleteCouponModal
        isOpen={!!deletingCoupon}
        onClose={() => setDeletingCoupon(null)}
        coupon={deletingCoupon}
        onConfirm={handleDeleteSubmit}
        loading={actionLoading}
      />
    </div>
  );
};
export default CouponsPage;
