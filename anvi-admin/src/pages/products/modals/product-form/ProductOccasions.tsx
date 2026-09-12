import React from 'react';
import { OCCASIONS } from '@/config/constants';
import { ProductFormData } from '@/types/product';

interface ProductOccasionsProps {
  formData: ProductFormData;
  onChange: (field: keyof ProductFormData, value: any) => void;
}

export const ProductOccasions: React.FC<ProductOccasionsProps> = ({
  formData,
  onChange,
}) => {
  const selectedOccasions = formData.occasions || [];

  const toggleOccasion = (slug: string) => {
    if (selectedOccasions.includes(slug)) {
      onChange('occasions', selectedOccasions.filter((o: string) => o !== slug));
    } else {
      onChange('occasions', [...selectedOccasions, slug]);
    }
  };

  return (
    <div className="space-y-3">
      <h4 className="text-xs uppercase tracking-wider font-semibold text-anvi-muted border-b border-anvi-sand/40 pb-2">
        Styling Occasion
      </h4>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {OCCASIONS.map((occ: { slug: string; name: string }) => {
          const isSelected = selectedOccasions.includes(occ.slug);
          return (
            <button
              key={occ.slug}
              type="button"
              onClick={() => toggleOccasion(occ.slug)}
              className={`p-2.5 rounded-xl text-center text-xs transition-all border ${
                isSelected
                  ? 'bg-anvi-gold/15 border-anvi-gold text-anvi-charcoal font-semibold shadow-sm'
                  : 'bg-white border-anvi-sand/60 text-anvi-muted hover:text-anvi-charcoal hover:border-anvi-gold'
              }`}
            >
              {occ.name}
            </button>
          );
        })}
      </div>
    </div>
  );
};
export default ProductOccasions;
