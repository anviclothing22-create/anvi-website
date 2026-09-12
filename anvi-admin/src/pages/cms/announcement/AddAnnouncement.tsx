import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { AnnouncementForm } from './AnnouncementForm';
import { Announcement } from '@/types/announcement';

interface AddAnnouncementProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: Omit<Announcement, 'id'>) => void;
}

export const AddAnnouncement: React.FC<AddAnnouncementProps> = ({
  isOpen,
  onClose,
  onAdd,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Storefront Announcement"
      description="Publish an alert banner ticker across all pages of the ANVI store."
      size="md"
    >
      <AnnouncementForm
        onSubmit={(data) => {
          onAdd(data);
          onClose();
        }}
        onCancel={onClose}
        submitLabel="Add to Ticker"
      />
    </Modal>
  );
};
export default AddAnnouncement;
