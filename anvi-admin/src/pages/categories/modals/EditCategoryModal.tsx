import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { FormField } from '@/components/forms/FormField';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Switch } from '@/components/ui/Switch';
import { Button } from '@/components/ui/Button';
import { Category, CategoryFormData } from '@/types/category';

interface EditCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: Category | null;
  onUpdate: (id: string, data: Partial<CategoryFormData>) => void;
  loading?: boolean;
}

export const EditCategoryModal: React.FC<EditCategoryModalProps> = ({
  isOpen,
  onClose,
  category,
  onUpdate,
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

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        slug: category.slug,
        description: category.description || '',
        imageUrl: category.imageUrl || '',
        order: category.order || 1,
        isActive: category.isActive,
      });
    }
  }, [category]);

  if (!category) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(category.id, formData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit Category: ${category.name}`}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Category Name" required>
          <Input
            value={formData.name}
            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            required
          />
        </FormField>

        <FormField label="URL Slug" required>
          <Input
            value={formData.slug}
            onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
            required
          />
        </FormField>

        <FormField label="Editorial Story & Description">
          <Textarea
            value={formData.description || ''}
            onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
            rows={2}
          />
        </FormField>

        <FormField label="Cover Imagery URL">
          <Input
            value={formData.imageUrl || ''}
            onChange={(e) => setFormData((prev) => ({ ...prev, imageUrl: e.target.value }))}
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
            Update Category
          </Button>
        </div>
      </form>
    </Modal>
  );
};
export default EditCategoryModal;
