import React from 'react';
import { FormField } from '@/components/forms/FormField';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { ImagePicker } from '@/components/ui/ImagePicker';
import { StoreAmbience } from '@/types/ambience';

interface AmbienceFormProps {
  ambience: StoreAmbience;
  onChange: (updated: StoreAmbience) => void;
}

export const AmbienceForm: React.FC<AmbienceFormProps> = ({ ambience, onChange }) => {
  const update = (field: keyof StoreAmbience, value: any) => {
    onChange({ ...ambience, [field]: value });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Store Designation" required>
          <Input
            value={ambience.storeName}
            onChange={(e) => update('storeName', e.target.value)}
            required
          />
        </FormField>

        <FormField label="Headline Tagline">
          <Input
            value={ambience.tagline}
            onChange={(e) => update('tagline', e.target.value)}
          />
        </FormField>
      </div>

      <FormField label="Physical Store Address" required>
        <Input
          value={ambience.address}
          onChange={(e) => update('address', e.target.value)}
          required
        />
      </FormField>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Direct Hotline / Phone">
          <Input
            value={ambience.phone}
            onChange={(e) => update('phone', e.target.value)}
          />
        </FormField>

        <FormField label="Boutique Operating Hours">
          <Input
            value={ambience.timings}
            onChange={(e) => update('timings', e.target.value)}
          />
        </FormField>
      </div>

      <ImagePicker
        label="Hero Backdrop Image"
        value={ambience.heroImage || ''}
        onChange={(url) => update('heroImage', url)}
        required
        bucket="ambience-gallery"
        helpText="Upload a picture of your boutique showroom from your local device or paste an image URL."
      />

      <FormField label="Boutique Experience Narrative" required>
        <Textarea
          value={ambience.description}
          onChange={(e) => update('description', e.target.value)}
          rows={3}
          required
        />
      </FormField>
    </div>
  );
};
export default AmbienceForm;
