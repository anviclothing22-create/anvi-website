import React, { useState } from 'react';
import { FormField } from '@/components/forms/FormField';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Switch } from '@/components/ui/Switch';
import { Button } from '@/components/ui/Button';
import { HeroBanner } from '@/types/hero';

interface HeroBannerFormProps {
  initialData?: Partial<HeroBanner>;
  onSubmit: (data: Omit<HeroBanner, 'id'>) => void;
  onCancel: () => void;
  submitLabel?: string;
}

export const HeroBannerForm: React.FC<HeroBannerFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  submitLabel = 'Save Slide',
}) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [subtitle, setSubtitle] = useState(initialData?.subtitle || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl || '');
  const [ctaText, setCtaText] = useState(initialData?.ctaText || 'Explore Collection');
  const [ctaLink, setCtaLink] = useState(initialData?.ctaLink || '/collections/sarees');
  const [order, setOrder] = useState(initialData?.order || 1);
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      subtitle,
      description,
      imageUrl,
      ctaText,
      ctaLink,
      order,
      isActive,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField label="Hero Headline" required>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Timeless Sarees Handcrafted with Soul"
          required
        />
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Overline / Subtitle">
          <Input
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder="e.g. Festive Splendour '26"
          />
        </FormField>

        <FormField label="Display Order Rank">
          <Input
            type="number"
            min="1"
            value={order}
            onChange={(e) => setOrder(Number(e.target.value))}
          />
        </FormField>
      </div>

      <FormField label="Supporting Narrative">
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief copy celebrating Indian hand-block printing, zari weaves, and grace..."
          rows={2}
        />
      </FormField>

      <FormField label="Hero Image URL" required>
        <Input
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://images.unsplash.com/..."
          required
        />
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Button Label (CTA)" required>
          <Input
            value={ctaText}
            onChange={(e) => setCtaText(e.target.value)}
            placeholder="Explore Sarees"
            required
          />
        </FormField>

        <FormField label="Button Target Link" required>
          <Input
            value={ctaLink}
            onChange={(e) => setCtaLink(e.target.value)}
            placeholder="/collections/sarees"
            required
          />
        </FormField>
      </div>

      <div className="pt-2">
        <Switch
          checked={isActive}
          onChange={setIsActive}
          label="Display in Homepage Carousel"
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
export default HeroBannerForm;
