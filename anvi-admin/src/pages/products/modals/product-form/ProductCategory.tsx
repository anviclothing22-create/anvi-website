import React from 'react';
import { FormField } from '@/components/forms/FormField';
import { Select } from '@/components/ui/Select';
import { ProductFormData } from '@/types/product';
import { useCategories } from '@/hooks/useCategories';

interface ProductCategoryProps {
  formData: ProductFormData;
  onChange: (field: keyof ProductFormData, value: any) => void;
  errors?: Record<string, string>;
}

export const ProductCategory: React.FC<ProductCategoryProps> = ({
  formData,
  onChange,
  errors = {},
}) => {
  const { categories } = useCategories();

  return (
    <div className="space-y-4">
      <h4 className="text-xs uppercase tracking-wider font-semibold text-anvi-muted border-b border-anvi-sand/40 pb-2">
        Catalogue Taxonomy
      </h4>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="Primary Category" required error={errors.categorySlug}>
          <Select
            value={formData.categorySlug}
            onChange={(e) => onChange('categorySlug', e.target.value)}
            required
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField label="Pattern / Craft Origin">
          <input
            type="text"
            value={formData.pattern || ''}
            onChange={(e) => onChange('pattern', e.target.value)}
            placeholder="e.g. Ajrakh Hand-Block, Zari Weave"
            className="w-full px-3.5 py-2 text-xs rounded-xl border border-anvi-sand/80 bg-white focus:outline-none focus:ring-2 focus:ring-anvi-gold/40 focus:border-anvi-gold text-anvi-charcoal"
          />
        </FormField>
      </div>
    </div>
  );
};
export default ProductCategory;
