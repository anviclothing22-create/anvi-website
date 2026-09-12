import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { CMSSection } from '../components/CMSSection';
import { AnnouncementCard } from './AnnouncementCard';
import { AddAnnouncement } from './AddAnnouncement';
import { AnnouncementForm } from './AnnouncementForm';
import { Modal } from '@/components/ui/Modal';
import { Announcement } from '@/types/announcement';

interface AnnouncementManagerProps {
  announcements: Announcement[];
  onAdd: (data: Omit<Announcement, 'id'>) => void;
  onUpdate: (id: string, data: Partial<Announcement>) => void;
  onDelete: (id: string) => void;
}

export const AnnouncementManager: React.FC<AnnouncementManagerProps> = ({
  announcements,
  onAdd,
  onUpdate,
  onDelete,
}) => {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Announcement | null>(null);

  return (
    <CMSSection
      title="Header Announcement Bar"
      description="Manage the revolving notifications displayed at the very top of the customer storefront."
      action={
        <Button size="sm" onClick={() => setIsAddOpen(true)} className="text-xs">
          <Plus className="w-3.5 h-3.5" />
          <span>New Notification</span>
        </Button>
      }
    >
      <div className="space-y-3">
        {announcements.map((item) => (
          <AnnouncementCard
            key={item.id}
            announcement={item}
            onEdit={() => setEditingItem(item)}
            onDelete={() => onDelete(item.id)}
            onToggle={(active) => onUpdate(item.id, { isActive: active })}
          />
        ))}

        {announcements.length === 0 && (
          <p className="text-xs text-anvi-muted text-center py-8">
            No announcement items configured. The top bar will be hidden.
          </p>
        )}
      </div>

      <AddAnnouncement
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onAdd={onAdd}
      />

      {editingItem && (
        <Modal
          isOpen={!!editingItem}
          onClose={() => setEditingItem(null)}
          title="Edit Announcement"
          size="md"
        >
          <AnnouncementForm
            initialData={editingItem}
            onSubmit={(data) => {
              onUpdate(editingItem.id, data);
              setEditingItem(null);
            }}
            onCancel={() => setEditingItem(null)}
            submitLabel="Update Banner"
          />
        </Modal>
      )}
    </CMSSection>
  );
};
export default AnnouncementManager;
