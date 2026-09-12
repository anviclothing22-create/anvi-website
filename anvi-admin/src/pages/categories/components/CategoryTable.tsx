import React from 'react';
import { Category } from '@/types/category';
import { CategoryTableRow } from './CategoryTableRow';
import { CategoryEmptyState } from './CategoryEmptyState';

interface CategoryTableProps {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
  onToggleStatus: (id: string, currentStatus: boolean) => void;
  onAddCategory: () => void;
}

export const CategoryTable: React.FC<CategoryTableProps> = ({
  categories,
  onEdit,
  onDelete,
  onToggleStatus,
  onAddCategory,
}) => {
  if (categories.length === 0) {
    return <CategoryEmptyState onAddCategory={onAddCategory} />;
  }

  return (
    <div className="bg-white rounded-2xl border border-anvi-sand/60 shadow-luxury-subtle overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-anvi-linen/50 border-b border-anvi-sand/60 text-[11px] font-sans font-semibold uppercase tracking-wider text-anvi-muted">
            <tr>
              <th className="py-3.5 px-4 text-left">Category Name & Story</th>
              <th className="py-3.5 px-4 text-left">Path Slug</th>
              <th className="py-3.5 px-4 text-left">Sort Rank</th>
              <th className="py-3.5 px-4 text-left">Live Pieces</th>
              <th className="py-3.5 px-4 text-left">Storefront Status</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-anvi-sand/20">
            {categories.map((cat) => (
              <CategoryTableRow
                key={cat.id}
                category={cat}
                onEdit={onEdit}
                onDelete={onDelete}
                onToggleStatus={onToggleStatus}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default CategoryTable;
