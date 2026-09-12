import React from 'react';
import { FormField } from '@/components/forms/FormField';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { ProductFormData } from '@/types/product';

interface ProductBasicInfoProps {
  formData: ProductFormData;
  onChange: (field: keyof ProductFormData, value: any) => void;
  errors?: Record<string, string>;
}

export const ProductBasicInfo: React.FC<ProductBasicInfoProps> = ({
  formData,
  onChange,
  errors = {},
}) => {
  return (
    <div className="space-y-4">
      <h4 className="text-xs uppercase tracking-wider font-semibold text-anvi-muted border-b border-anvi-sand/40 pb-2">
        General Details
      </h4>

      <FormField label="Product Name" required error={errors.name}>
        <Input
          value={formData.name}
          onChange={(e) => onChange('name', e.target.value)}
          placeholder="e.g. Royal Ajrakh Hand-Block Modal Saree"
          required
        />
      </FormField>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="SKU Code" required error={errors.sku}>
          <Input
            value={formData.sku}
            onChange={(e) => onChange('sku', e.target.value.toUpperCase())}
            placeholder="ANVI-SR-01"
            required
          />
        </FormField>

        <FormField label="Fabric / Craft Material">
          <Input
            value={formData.fabric || ''}
            onChange={(e) => onChange('fabric', e.target.value)}
            placeholder="e.g. Modal Silk with Natural Vegetable Dyes"
          />
        </FormField>
      </div>

      <FormField label="Editorial Story & Product Description" required error={errors.description}>
        <Textarea
          value={formData.description}
          onChange={(e) => onChange('description', e.target.value)}
          placeholder="Describe the craftsmanship, drape, and inspiration behind this piece..."
          rows={3}
          required
        />
      </FormField>

      <FormField label="Care & Maintenance Instructions">
        <Input
          value={formData.careInstructions || ''}
          onChange={(e) => onChange('careInstructions', e.target.value)}
          placeholder="e.g. Dry clean only. Store in muslin cloth."
        />
      </FormField>
    </div>
  );
};
export default ProductBasicInfo;
