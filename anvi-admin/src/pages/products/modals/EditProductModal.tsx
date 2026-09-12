import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { ProductForm } from './product-form/ProductForm';
import { Product, ProductFormData } from '@/types/product';

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onUpdate: (id: string, data: Partial<ProductFormData>) => void;
  loading?: boolean;
}

export const EditProductModal: React.FC<EditProductModalProps> = ({
  isOpen,
  onClose,
  product,
  onUpdate,
  loading = false,
}) => {
  if (!product) return null;

  const handleSubmit = (data: ProductFormData) => {
    onUpdate(product.id, data);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Modify Creation: ${product.name}`}
      description="Update pricing, photography, sizing, or craftsmanship narrative."
      size="xl"
    >
      <ProductForm
        initialData={product}
        onSubmit={handleSubmit}
        onCancel={onClose}
        loading={loading}
        submitLabel="Commit Updates"
      />
    </Modal>
  );
};
export default EditProductModal;
