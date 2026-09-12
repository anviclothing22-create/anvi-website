import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { FormField } from '@/components/forms/FormField';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Switch } from '@/components/ui/Switch';
import { Button } from '@/components/ui/Button';
import { CouponFormData } from '@/types/coupon';

interface CreateCouponModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: CouponFormData) => void;
  loading?: boolean;
}

export const CreateCouponModal: React.FC<CreateCouponModalProps> = ({
  isOpen,
  onClose,
  onCreate,
  loading = false,
}) => {
  const [formData, setFormData] = useState<CouponFormData>({
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: 10,
    minOrderAmount: 2000,
    maxDiscountAmount: 1000,
    usageLimit: 100,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    isActive: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate(formData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Privilege Voucher"
      description="Issue a new promotional coupon code for luxury checkouts."
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Coupon Code" required>
            <Input
              value={formData.code}
              onChange={(e) => setFormData((prev) => ({ ...prev, code: e.target.value.toUpperCase().trim() }))}
              placeholder="ANVIFESTIVE15"
              required
            />
          </FormField>

          <FormField label="Discount Mode" required>
            <Select
              value={formData.discountType}
              onChange={(e) => setFormData((prev) => ({ ...prev, discountType: e.target.value as any }))}
            >
              <option value="percentage">Percentage (%)</option>
              <option value="fixed">Fixed Amount (₹)</option>
            </Select>
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            label={formData.discountType === 'percentage' ? 'Percentage Off (%)' : 'Deduction Amount (₹)'}
            required
          >
            <Input
              type="number"
              min="1"
              value={formData.discountValue}
              onChange={(e) => setFormData((prev) => ({ ...prev, discountValue: Number(e.target.value) }))}
              required
            />
          </FormField>

          <FormField label="Maximum Discount Cap (₹)">
            <Input
              type="number"
              min="0"
              value={formData.maxDiscountAmount || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, maxDiscountAmount: e.target.value ? Number(e.target.value) : undefined }))}
              placeholder="e.g. 1500"
            />
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Minimum Order Spend (₹)">
            <Input
              type="number"
              min="0"
              value={formData.minOrderAmount || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, minOrderAmount: e.target.value ? Number(e.target.value) : undefined }))}
              placeholder="e.g. 2999"
            />
          </FormField>

          <FormField label="Total Redemptions Limit">
            <Input
              type="number"
              min="1"
              value={formData.usageLimit || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, usageLimit: e.target.value ? Number(e.target.value) : undefined }))}
              placeholder="Leave empty for unlimited"
            />
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Valid From" required>
            <Input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData((prev) => ({ ...prev, startDate: e.target.value }))}
              required
            />
          </FormField>

          <FormField label="Expiry Date" required>
            <Input
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData((prev) => ({ ...prev, endDate: e.target.value }))}
              required
            />
          </FormField>
        </div>

        <FormField label="Campaign Narrative">
          <Input
            value={formData.description || ''}
            onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
            placeholder="e.g. Festive season introductory privilege"
          />
        </FormField>

        <div className="flex items-center justify-between pt-2">
          <Switch
            checked={formData.isActive ?? true}
            onChange={(checked) => setFormData((prev) => ({ ...prev, isActive: checked }))}
            label="Activate Immediately"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-anvi-sand/40">
          <Button variant="outline" type="button" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Issue Voucher
          </Button>
        </div>
      </form>
    </Modal>
  );
};
export default CreateCouponModal;
