import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { ProductFormData } from '@/types/product';
import { Input } from '@/components/ui/Input';

interface ProductTagsProps {
  formData: ProductFormData;
  onChange: (field: keyof ProductFormData, value: any) => void;
}

export const ProductTags: React.FC<ProductTagsProps> = ({ formData, onChange }) => {
  const [tagInput, setTagInput] = useState('');
  const tags = formData.tags || [];

  const handleAddTag = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();

    const trimmed = tagInput.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed)) {
      onChange('tags', [...tags, trimmed]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onChange('tags', tags.filter((t) => t !== tagToRemove));
  };

  return (
    <div className="space-y-3">
      <h4 className="text-xs uppercase tracking-wider font-semibold text-anvi-muted border-b border-anvi-sand/40 pb-2">
        Search Tags & Keywords
      </h4>

      <div className="flex gap-2">
        <Input
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleAddTag}
          placeholder="e.g. handloom, pure modal, festive, ajrakh"
          className="text-xs h-9"
        />
        <button
          type="button"
          onClick={handleAddTag}
          className="px-3 py-1.5 rounded-xl bg-anvi-sand/60 hover:bg-anvi-sand text-anvi-charcoal text-xs font-medium flex items-center gap-1 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add</span>
        </button>
      </div>

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-anvi-linen text-anvi-charcoal border border-anvi-sand/60"
            >
              #{tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="text-anvi-muted hover:text-rose-600 ml-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
export default ProductTags;
