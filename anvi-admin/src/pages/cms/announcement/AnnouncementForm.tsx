import React, { useState } from 'react';
import { FormField } from '@/components/forms/FormField';
import { Input } from '@/components/ui/Input';
import { Switch } from '@/components/ui/Switch';
import { Button } from '@/components/ui/Button';
import { Announcement } from '@/types/announcement';

interface AnnouncementFormProps {
  initialData?: Partial<Announcement>;
  onSubmit: (data: Omit<Announcement, 'id'>) => void;
  onCancel: () => void;
  submitLabel?: string;
}

export const AnnouncementForm: React.FC<AnnouncementFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  submitLabel = 'Save Announcement',
}) => {
  const [text, setText] = useState(initialData?.text || '');
  const [link, setLink] = useState(initialData?.link || '');
  const [order, setOrder] = useState(initialData?.order || 1);
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ text, link, order, isActive });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField label="Announcement Message" required>
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="e.g. Complimentary Luxury Shipping Across India On Orders Above ₹2,999"
          required
        />
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Target Link / URL (Optional)">
          <Input
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="/collections/festive"
          />
        </FormField>

        <FormField label="Sequence Order">
          <Input
            type="number"
            min="1"
            value={order}
            onChange={(e) => setOrder(Number(e.target.value))}
          />
        </FormField>
      </div>

      <div className="pt-2">
        <Switch
          checked={isActive}
          onChange={setIsActive}
          label="Display on Live Storefront Bar"
        />
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t border-anvi-sand/40">
        <Button variant="outline" size="sm" type="button" onClick={onCancel}>
          Cancel
        </Button>
        <Button size="sm" type="submit">
          {submitLabel}
        </Button>
      </div>
    </form>
  );
};
export default AnnouncementForm;
