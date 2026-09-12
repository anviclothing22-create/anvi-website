import React, { useState } from 'react';
import { PromoPopup } from '@/types/popup';
import { CMSSection } from '../components/CMSSection';
import { PopupForm } from './PopupForm';
import { PopupPreview } from './PopupPreview';
import { Button } from '@/components/ui/Button';

interface PopupManagerProps {
  popup: PromoPopup;
  onUpdate: (updated: PromoPopup) => void;
}

export const PopupManager: React.FC<PopupManagerProps> = ({ popup, onUpdate }) => {
  const [localData, setLocalData] = useState<PromoPopup>(popup);

  const handleSave = () => {
    onUpdate(localData);
  };

  return (
    <CMSSection
      title="First-Time Visitor Welcome Modal"
      description="Configure luxury conversion popups with welcome promo codes."
      action={
        <Button size="sm" onClick={handleSave} className="text-xs">
          Commit Popup Settings
        </Button>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <PopupForm popup={localData} onChange={setLocalData} />

        <div className="space-y-3">
          <h4 className="text-xs uppercase tracking-wider font-semibold text-anvi-muted">
            Live Storefront Simulation
          </h4>
          <PopupPreview popup={localData} />
        </div>
      </div>
    </CMSSection>
  );
};
export default PopupManager;
