import React, { useState } from 'react';
import { ProductFormData } from '@/types/product';
import { ProductBasicInfo } from './ProductBasicInfo';
import { ProductPricing } from './ProductPricing';
import { ProductCategory } from './ProductCategory';
import { ProductImages } from './ProductImages';
import { ProductSizes } from './ProductSizes';
import { ProductTags } from './ProductTags';
import { ProductCollections } from './ProductCollections';
import { ProductOccasions } from './ProductOccasions';
import { ProductAvailability } from './ProductAvailability';
import { ProductFormActions } from './ProductFormActions';
import { validateProductForm } from '@/lib/validation';

interface ProductFormProps {
  initialData?: Partial<ProductFormData>;
  onSubmit: (data: ProductFormData) => void;
  onCancel: () => void;
  loading?: boolean;
  submitLabel?: string;
}

const defaultFormData: ProductFormData = {
  name: '',
  description: '',
  price: 0,
  originalPrice: undefined,
  categorySlug: '',
  sku: '',
  stockQuantity: 15,
  isActive: true,
  isFeatured: false,
  isBestseller: false,
  isNewArrival: true,
  sizes: ['S', 'M', 'L'],
  colors: [],
  images: [],
  tags: [],
  fabric: '',
  careInstructions: 'Dry clean only.',
  occasions: [],
  collections: [],
};

export const ProductForm: React.FC<ProductFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  loading = false,
  submitLabel = 'Save Product',
}) => {
  const [formData, setFormData] = useState<ProductFormData>({
    ...defaultFormData,
    ...initialData,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleFieldChange = (field: keyof ProductFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateProductForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <ProductBasicInfo
        formData={formData}
        onChange={handleFieldChange}
        errors={errors}
      />

      <ProductPricing
        formData={formData}
        onChange={handleFieldChange}
        errors={errors}
      />

      <ProductCategory
        formData={formData}
        onChange={handleFieldChange}
        errors={errors}
      />

      <ProductImages
        formData={formData}
        onChange={handleFieldChange}
        errors={errors}
      />

      <ProductSizes
        formData={formData}
        onChange={handleFieldChange}
      />

      <ProductOccasions
        formData={formData}
        onChange={handleFieldChange}
      />

      <ProductCollections
        formData={formData}
        onChange={handleFieldChange}
      />

      <ProductTags
        formData={formData}
        onChange={handleFieldChange}
      />

      <ProductAvailability
        formData={formData}
        onChange={handleFieldChange}
      />

      <ProductFormActions
        onCancel={onCancel}
        loading={loading}
        submitLabel={submitLabel}
      />
    </form>
  );
};
export default ProductForm;
