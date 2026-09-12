import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { HeroBannerForm } from './HeroBannerForm';
import { HeroBanner } from '@/types/hero';

interface AddHeroBannerProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: Omit<HeroBanner, 'id'>) => void;
}

export const AddHeroBanner: React.FC<AddHeroBannerProps> = ({
  isOpen,
  onClose,
  onAdd,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Hero Editorial Slide"
      description="Feature a brand collection with large luxury photography on the customer homepage."
      size="lg"
    >
      <HeroBannerForm
        onSubmit={(data) => {
          onAdd(data);
          onClose();
        }}
        onCancel={onClose}
        submitLabel="Add Slide"
      />
    </Modal>
  );
};
export default AddHeroBanner;
