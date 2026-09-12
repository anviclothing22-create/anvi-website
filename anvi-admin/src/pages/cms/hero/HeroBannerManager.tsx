import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { CMSSection } from '../components/CMSSection';
import { HeroBannerCard } from './HeroBannerCard';
import { AddHeroBanner } from './AddHeroBanner';
import { HeroBannerForm } from './HeroBannerForm';
import { Modal } from '@/components/ui/Modal';
import { HeroBanner } from '@/types/hero';

interface HeroBannerManagerProps {
  banners: HeroBanner[];
  onAdd: (data: Omit<HeroBanner, 'id'>) => void;
  onUpdate: (id: string, data: Partial<HeroBanner>) => void;
  onDelete: (id: string) => void;
}

export const HeroBannerManager: React.FC<HeroBannerManagerProps> = ({
  banners,
  onAdd,
  onUpdate,
  onDelete,
}) => {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<HeroBanner | null>(null);

  return (
    <CMSSection
      title="Homepage Hero Editorial Slides"
      description="Design and schedule full-width visual statements that introduce new seasonal drops."
      action={
        <Button size="sm" onClick={() => setIsAddOpen(true)} className="text-xs">
          <Plus className="w-3.5 h-3.5" />
          <span>New Slide</span>
        </Button>
      }
    >
      <div className="space-y-4">
        {banners.map((banner) => (
          <HeroBannerCard
            key={banner.id}
            banner={banner}
            onEdit={() => setEditingItem(banner)}
            onDelete={() => onDelete(banner.id)}
            onToggle={(active) => onUpdate(banner.id, { isActive: active })}
          />
        ))}

        {banners.length === 0 && (
          <p className="text-xs text-anvi-muted text-center py-8">
            No hero slides created yet.
          </p>
        )}
      </div>

      <AddHeroBanner
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onAdd={onAdd}
      />

      {editingItem && (
        <Modal
          isOpen={!!editingItem}
          onClose={() => setEditingItem(null)}
          title="Edit Hero Banner"
          size="lg"
        >
          <HeroBannerForm
            initialData={editingItem}
            onSubmit={(data) => {
              onUpdate(editingItem.id, data);
              setEditingItem(null);
            }}
            onCancel={() => setEditingItem(null)}
            submitLabel="Update Slide"
          />
        </Modal>
      )}
    </CMSSection>
  );
};
export default HeroBannerManager;
