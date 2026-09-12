import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { ProductForm } from './product-form/ProductForm';
import { ProductFormData } from '@/types/product';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: ProductFormData) => void;
  loading?: boolean;
}

export const AddProductModal: React.FC<AddProductModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  loading = false,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Handcrafted Creation"
      description="Introduce a new ensemble to the ANVI luxury storefront catalogue."
      size="xl"
    >
      <ProductForm
        onSubmit={onAdd}
        onCancel={onClose}
        loading={loading}
        submitLabel="Publish Creation to Catalogue"
      />
    </Modal>
  );
};
export default AddProductModal;
