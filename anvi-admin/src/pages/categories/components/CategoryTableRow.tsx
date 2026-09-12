import React from 'react';
import { Category } from '@/types/category';
import { CategoryActions } from './CategoryActions';
import { ImagePreview } from '@/components/shared/ImagePreview';

interface CategoryTableRowProps {
  category: Category;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
  onToggleStatus: (id: string, currentStatus: boolean) => void;
}

export const CategoryTableRow: React.FC<CategoryTableRowProps> = ({
  category,
  onEdit,
  onDelete,
  onToggleStatus,
}) => {
  return (
    <tr className="border-b border-anvi-sand/30 hover:bg-anvi-linen/30 transition-colors group">
      {/* Category Name & Image */}
      <td className="py-3.5 px-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-14 rounded-lg overflow-hidden border border-anvi-sand/50 bg-stone-50 shrink-0">
            <ImagePreview
              src={category.imageUrl || '/assets/brand/anvi-logo.svg'}
              alt={category.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="space-y-0.5">
            <p className="font-serif font-bold text-sm text-anvi-charcoal group-hover:text-anvi-maroon transition-colors">
              {category.name}
            </p>
            <p className="text-xs text-anvi-muted line-clamp-1 max-w-sm">
              {category.description || 'Curated luxury collection'}
            </p>
          </div>
        </div>
      </td>

      {/* Slug */}
      <td className="py-3.5 px-4 text-xs font-mono text-anvi-muted">
        /{category.slug}
      </td>

      {/* Order */}
      <td className="py-3.5 px-4 text-xs font-mono text-anvi-charcoal font-medium">
        #{category.order}
      </td>

      {/* Items Count */}
      <td className="py-3.5 px-4">
        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-anvi-linen text-anvi-charcoal border border-anvi-sand/60">
          {category.productCount || 0} styles
        </span>
      </td>

      {/* Status Toggle */}
      <td className="py-3.5 px-4">
        <button
          type="button"
          onClick={() => onToggleStatus(category.id, Boolean(category.isActive))}
          className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium transition-all ${
            category.isActive
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-stone-100 text-stone-600 border border-stone-200'
          }`}
        >
          {category.isActive ? 'Active' : 'Hidden'}
        </button>
      </td>

      {/* Actions */}
      <td className="py-3.5 px-4 text-right">
        <CategoryActions
          category={category}
          onEdit={() => onEdit(category)}
          onDelete={() => onDelete(category)}
        />
      </td>
    </tr>
  );
};
export default CategoryTableRow;
