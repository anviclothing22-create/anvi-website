import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { FormField } from '@/components/forms/FormField';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Switch } from '@/components/ui/Switch';
import { Button } from '@/components/ui/Button';
import { Coupon, CouponFormData } from '@/types/coupon';

interface EditCouponModalProps {
  isOpen: boolean;
  onClose: () => void;
  coupon: Coupon | null;
  onUpdate: (id: string, data: Partial<CouponFormData>) => void;
  loading?: boolean;
}

export const EditCouponModal: React.FC<EditCouponModalProps> = ({
  isOpen,
  onClose,
  coupon,
  onUpdate,
  loading = false,
}) => {
  const [formData, setFormData] = useState<CouponFormData>({
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: 10,
    minOrderAmount: 0,
    maxDiscountAmount: undefined,
    usageLimit: undefined,
    startDate: '',
    endDate: '',
    isActive: true,
  });

  useEffect(() => {
    if (coupon) {
      setFormData({
        code: coupon.code,
        description: coupon.description || '',
        discountType: coupon.discountType || coupon.type || 'percentage',
        discountValue: coupon.discountValue ?? coupon.value ?? 10,
        minOrderAmount: coupon.minOrderAmount ?? coupon.minSpend,
        maxDiscountAmount: coupon.maxDiscountAmount ?? coupon.maxDiscount,
        usageLimit: coupon.usageLimit,
        startDate: coupon.startDate.split('T')[0],
        endDate: coupon.endDate.split('T')[0],
        isActive: coupon.isActive,
      });
    }
  }, [coupon]);

  if (!coupon) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(coupon.id, formData);
  };

  const discountVal = formData.discountValue ?? formData.value ?? 10;
  const maxDiscountVal = formData.maxDiscountAmount ?? formData.maxDiscount ?? '';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Modify Voucher: ${coupon.code}`}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Coupon Code" required>
            <Input
              value={formData.code}
              onChange={(e) => setFormData((prev) => ({ ...prev, code: e.target.value.toUpperCase().trim() }))}
              required
            />
          </FormField>

          <FormField label="Discount Mode" required>
            <Select
              value={formData.discountType || formData.type || 'percentage'}
              onChange={(e) => setFormData((prev) => ({ ...prev, discountType: e.target.value as any, type: e.target.value as any }))}
            >
              <option value="percentage">Percentage (%)</option>
              <option value="fixed">Fixed Amount (₹)</option>
            </Select>
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Discount Value" required>
            <Input
              type="number"
              min="1"
              value={discountVal}
              onChange={(e) => setFormData((prev) => ({ ...prev, discountValue: Number(e.target.value), value: Number(e.target.value) }))}
              required
            />
          </FormField>

          <FormField label="Cap Limit (₹)">
            <Input
              type="number"
              min="0"
              value={maxDiscountVal}
              onChange={(e) => setFormData((prev) => ({
                ...prev,
                maxDiscountAmount: e.target.value ? Number(e.target.value) : undefined,
                maxDiscount: e.target.value ? Number(e.target.value) : undefined,
              }))}
            />
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Expiry Date" required>
            <Input
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData((prev) => ({ ...prev, endDate: e.target.value }))}
              required
            />
          </FormField>

          <div className="flex items-center pt-6">
            <Switch
              checked={formData.isActive ?? true}
              onChange={(checked) => setFormData((prev) => ({ ...prev, isActive: checked }))}
              label="Active Status"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-anvi-sand/40">
          <Button variant="outline" type="button" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Commit Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
};
export default EditCouponModal;
