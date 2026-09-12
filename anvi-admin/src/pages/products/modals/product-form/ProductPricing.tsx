import React from 'react';
import { FormField } from '@/components/forms/FormField';
import { Input } from '@/components/ui/Input';
import { ProductFormData } from '@/types/product';

interface ProductPricingProps {
  formData: ProductFormData;
  onChange: (field: keyof ProductFormData, value: any) => void;
  errors?: Record<string, string>;
}

export const ProductPricing: React.FC<ProductPricingProps> = ({
  formData,
  onChange,
  errors = {},
}) => {
  return (
    <div className="space-y-4">
      <h4 className="text-xs uppercase tracking-wider font-semibold text-anvi-muted border-b border-anvi-sand/40 pb-2">
        Pricing & Stock Levels
      </h4>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormField label="Retail Selling Price (₹)" required error={errors.price}>
          <Input
            type="number"
            min="0"
            step="1"
            value={formData.price || ''}
            onChange={(e) => onChange('price', Number(e.target.value))}
            placeholder="2850"
            required
          />
        </FormField>

        <FormField label="Original MRP / Compare At (₹)">
          <Input
            type="number"
            min="0"
            step="1"
            value={formData.originalPrice || ''}
            onChange={(e) => onChange('originalPrice', e.target.value ? Number(e.target.value) : undefined)}
            placeholder="3450"
          />
        </FormField>

        <FormField label="Available Stock Units" required error={errors.stockQuantity}>
          <Input
            type="number"
            min="0"
            step="1"
            value={formData.stockQuantity !== undefined ? formData.stockQuantity : ''}
            onChange={(e) => onChange('stockQuantity', Number(e.target.value))}
            placeholder="15"
            required
          />
        </FormField>
      </div>
    </div>
  );
};
export default ProductPricing;
