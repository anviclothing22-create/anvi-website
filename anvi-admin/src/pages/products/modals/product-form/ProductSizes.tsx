import React from 'react';
import { AVAILABLE_SIZES } from '@/config/constants';
import { ProductFormData } from '@/types/product';

interface ProductSizesProps {
  formData: ProductFormData;
  onChange: (field: keyof ProductFormData, value: any) => void;
}

export const ProductSizes: React.FC<ProductSizesProps> = ({ formData, onChange }) => {
  const selectedSizes = formData.sizes || [];

  const toggleSize = (size: string) => {
    if (selectedSizes.includes(size)) {
      onChange('sizes', selectedSizes.filter((s: string) => s !== size));
    } else {
      onChange('sizes', [...selectedSizes, size]);
    }
  };

  return (
    <div className="space-y-3">
      <h4 className="text-xs uppercase tracking-wider font-semibold text-anvi-muted border-b border-anvi-sand/40 pb-2">
        Available Sizing & Fits
      </h4>

      <div className="flex flex-wrap gap-2">
        {AVAILABLE_SIZES.map((size: string) => {
          const isSelected = selectedSizes.includes(size);
          return (
            <button
              key={size}
              type="button"
              onClick={() => toggleSize(size)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold tracking-wider transition-all border ${
                isSelected
                  ? 'bg-anvi-maroon text-white border-anvi-maroon shadow-sm'
                  : 'bg-white text-anvi-charcoal border-anvi-sand hover:border-anvi-gold'
              }`}
            >
              {size}
            </button>
          );
        })}
      </div>
    </div>
  );
};
export default ProductSizes;
