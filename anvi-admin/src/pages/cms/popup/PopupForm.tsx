import React from 'react';
import { FormField } from '@/components/forms/FormField';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Switch } from '@/components/ui/Switch';
import { PromoPopup } from '@/types/popup';

interface PopupFormProps {
  popup: PromoPopup;
  onChange: (updated: PromoPopup) => void;
}

export const PopupForm: React.FC<PopupFormProps> = ({ popup, onChange }) => {
  const update = (field: keyof PromoPopup, value: any) => {
    onChange({ ...popup, [field]: value });
  };

  return (
    <div className="space-y-4">
      <FormField label="Modal Headline" required>
        <Input
          value={popup.title}
          onChange={(e) => update('title', e.target.value)}
          placeholder="e.g. Welcome to ANVI Curation"
          required
        />
      </FormField>

      <FormField label="Privilege Description" required>
        <Textarea
          value={popup.description}
          onChange={(e) => update('description', e.target.value)}
          placeholder="Enjoy 10% privilege reduction on your maiden luxury handloom saree order."
          rows={3}
          required
        />
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Associated Coupon Code">
          <Input
            value={popup.couponCode || ''}
            onChange={(e) => update('couponCode', e.target.value.toUpperCase())}
            placeholder="FIRST10"
          />
        </FormField>

        <FormField label="Trigger Delay (seconds)">
          <Input
            type="number"
            min="1"
            max="60"
            value={popup.delaySeconds || 3}
            onChange={(e) => update('delaySeconds', Number(e.target.value))}
          />
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="CTA Button Text" required>
          <Input
            value={popup.ctaText}
            onChange={(e) => update('ctaText', e.target.value)}
            placeholder="Claim Privilege"
            required
          />
        </FormField>

        <FormField label="CTA Target URL" required>
          <Input
            value={popup.ctaLink}
            onChange={(e) => update('ctaLink', e.target.value)}
            placeholder="/collections/sarees"
            required
          />
        </FormField>
      </div>

      <FormField label="Imagery URL (Optional)">
        <Input
          value={popup.imageUrl || ''}
          onChange={(e) => update('imageUrl', e.target.value)}
          placeholder="https://images.unsplash.com/..."
        />
      </FormField>

      <div className="pt-2">
        <Switch
          checked={Boolean(popup.isActive ?? popup.isEnabled)}
          onChange={(val) => update('isActive', val)}
          label="Display Welcome Modal to First-Time Visitors"
        />
      </div>
    </div>
  );
};
export default PopupForm;
