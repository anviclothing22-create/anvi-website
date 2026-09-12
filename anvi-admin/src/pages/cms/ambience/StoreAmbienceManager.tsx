import React, { useState } from 'react';
import { StoreAmbience, AmbienceImage } from '@/types/ambience';
import { CMSSection } from '../components/CMSSection';
import { AmbienceHero } from './AmbienceHero';
import { AmbienceForm } from './AmbienceForm';
import { AmbienceGallery } from './AmbienceGallery';
import { AmbienceImageUpload } from './AmbienceImageUpload';
import { Button } from '@/components/ui/Button';

interface StoreAmbienceManagerProps {
  ambience: StoreAmbience;
  onUpdate: (updated: StoreAmbience) => void;
}

export const StoreAmbienceManager: React.FC<StoreAmbienceManagerProps> = ({
  ambience,
  onUpdate,
}) => {
  const [localData, setLocalData] = useState<StoreAmbience>(ambience);

  const currentGallery = localData.galleryImages || (localData.photos as AmbienceImage[]) || [];

  const handleAddImage = (url: string, caption: string) => {
    const newImg: AmbienceImage = {
      id: `amb_${Date.now()}`,
      url,
      caption,
      order: currentGallery.length + 1,
    };
    const updated = {
      ...localData,
      galleryImages: [...currentGallery, newImg],
    };
    setLocalData(updated);
    onUpdate(updated);
  };

  const handleRemoveImage = (id: string) => {
    const updated = {
      ...localData,
      galleryImages: currentGallery.filter((img) => img.id !== id),
    };
    setLocalData(updated);
    onUpdate(updated);
  };

  const handleSave = () => {
    onUpdate(localData);
  };

  return (
    <CMSSection
      title="Store Ambience & Tatabad Boutique Showroom"
      description="Showcase the Coimbatore boutique experience, interior decor, fitting suites, and visitor timings."
      action={
        <Button size="sm" onClick={handleSave} className="text-xs">
          Commit Ambience Story
        </Button>
      }
    >
      <div className="space-y-6">
        <AmbienceHero ambience={localData} />

        <AmbienceForm ambience={localData} onChange={setLocalData} />

        <AmbienceImageUpload onAddImage={handleAddImage} />

        <AmbienceGallery
          images={currentGallery}
          onRemove={handleRemoveImage}
        />
      </div>
    </CMSSection>
  );
};
export default StoreAmbienceManager;
