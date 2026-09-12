import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { FormField } from '@/components/forms/FormField';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Switch } from '@/components/ui/Switch';
import { Button } from '@/components/ui/Button';
import { CategoryFormData } from '@/types/category';

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: CategoryFormData) => void;
  loading?: boolean;
}

export const AddCategoryModal: React.FC<AddCategoryModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  loading = false,
}) => {
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    slug: '',
    description: '',
    imageUrl: '',
    order: 1,
    isActive: true,
  });

  const handleNameChange = (val: string) => {
    setFormData((prev) => ({
      ...prev,
      name: val,
      slug: prev.slug || val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(formData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Category"
      description="Define an overarching collection for sarees, festive sets, or kids."
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Category Name" required>
          <Input
            value={formData.name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="e.g. Sarees & Drapes"
            required
          />
        </FormField>

        <FormField label="URL Slug" required>
          <Input
            value={formData.slug}
            onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
            placeholder="sarees-drapes"
            required
          />
        </FormField>

        <FormField label="Editorial Story & Description">
          <Textarea
            value={formData.description || ''}
            onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
            placeholder="Summarize the essence of this luxury collection..."
            rows={2}
          />
        </FormField>

        <FormField label="Cover Imagery URL">
          <Input
            value={formData.imageUrl || ''}
            onChange={(e) => setFormData((prev) => ({ ...prev, imageUrl: e.target.value }))}
            placeholder="https://images.unsplash.com/..."
          />
        </FormField>

        <div className="grid grid-cols-2 gap-4 pt-2">
          <FormField label="Display Order Rank">
            <Input
              type="number"
              min="1"
              value={formData.order || 1}
              onChange={(e) => setFormData((prev) => ({ ...prev, order: Number(e.target.value) }))}
            />
          </FormField>

          <div className="flex items-center pt-6">
            <Switch
              checked={formData.isActive ?? true}
              onChange={(checked) => setFormData((prev) => ({ ...prev, isActive: checked }))}
              label="Active Status"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-6 border-t border-anvi-sand/50">
          <Button variant="outline" type="button" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Save Category
          </Button>
        </div>
      </form>
    </Modal>
  );
};
export default AddCategoryModal;
