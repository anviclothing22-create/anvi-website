import React from 'react';
import { Switch } from '@/components/ui/Switch';
import { ProductFormData } from '@/types/product';

interface ProductAvailabilityProps {
  formData: ProductFormData;
  onChange: (field: keyof ProductFormData, value: any) => void;
}

export const ProductAvailability: React.FC<ProductAvailabilityProps> = ({
  formData,
  onChange,
}) => {
  return (
    <div className="space-y-4">
      <h4 className="text-xs uppercase tracking-wider font-semibold text-anvi-muted border-b border-anvi-sand/40 pb-2">
        Visibility & Featured Status
      </h4>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 bg-anvi-linen/40 p-4 rounded-xl border border-anvi-sand/60">
        <Switch
          checked={formData.isActive ?? true}
          onChange={(checked) => onChange('isActive', checked)}
          label="Active Status"
          description="Visible to public"
        />

        <Switch
          checked={formData.isFeatured ?? false}
          onChange={(checked) => onChange('isFeatured', checked)}
          label="Featured"
          description="Showcase prominently"
        />

        <Switch
          checked={formData.isBestseller ?? false}
          onChange={(checked) => onChange('isBestseller', checked)}
          label="Bestseller"
          description="Flag as patron favourite"
        />

        <Switch
          checked={formData.isNewArrival ?? false}
          onChange={(checked) => onChange('isNewArrival', checked)}
          label="New Arrival"
          description="Recent curation badge"
        />
      </div>
    </div>
  );
};
export default ProductAvailability;
