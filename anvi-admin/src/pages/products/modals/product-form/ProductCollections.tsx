import React from 'react';
import { COLLECTIONS } from '@/config/constants';
import { ProductFormData } from '@/types/product';

interface ProductCollectionsProps {
  formData: ProductFormData;
  onChange: (field: keyof ProductFormData, value: any) => void;
}

export const ProductCollections: React.FC<ProductCollectionsProps> = ({
  formData,
  onChange,
}) => {
  const selectedCollections = formData.collections || [];

  const toggleCollection = (slug: string) => {
    if (selectedCollections.includes(slug)) {
      onChange('collections', selectedCollections.filter((c: string) => c !== slug));
    } else {
      onChange('collections', [...selectedCollections, slug]);
    }
  };

  return (
    <div className="space-y-3">
      <h4 className="text-xs uppercase tracking-wider font-semibold text-anvi-muted border-b border-anvi-sand/40 pb-2">
        Curated Collections
      </h4>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {COLLECTIONS.map((col: { slug: string; name: string }) => {
          const isSelected = selectedCollections.includes(col.slug);
          return (
            <button
              key={col.slug}
              type="button"
              onClick={() => toggleCollection(col.slug)}
              className={`p-2 rounded-xl text-left text-xs transition-all border ${
                isSelected
                  ? 'bg-anvi-maroon/5 border-anvi-maroon text-anvi-maroon font-semibold'
                  : 'bg-white border-anvi-sand/60 text-anvi-charcoal hover:border-anvi-gold'
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`w-3 h-3 rounded-full border flex items-center justify-center text-[9px] ${
                    isSelected
                      ? 'bg-anvi-maroon border-anvi-maroon text-white'
                      : 'border-anvi-sand'
                  }`}
                >
                  {isSelected && '✓'}
                </span>
                <span className="truncate">{col.name}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
export default ProductCollections;
