import React from 'react';
import { Layers, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface CategoryEmptyStateProps {
  onAddCategory: () => void;
}

export const CategoryEmptyState: React.FC<CategoryEmptyStateProps> = ({ onAddCategory }) => {
  return (
    <div className="py-16 text-center space-y-4 max-w-sm mx-auto">
      <div className="w-14 h-14 rounded-2xl bg-anvi-linen border border-anvi-sand flex items-center justify-center mx-auto text-anvi-muted">
        <Layers className="w-7 h-7" />
      </div>
      <div className="space-y-1">
        <h3 className="text-base font-serif font-bold text-anvi-charcoal">
          No categories found
        </h3>
        <p className="text-xs text-anvi-muted leading-relaxed">
          Create collections like Sarees, Salwars, Co-ords, and Kidswear to structure your boutique catalogue.
        </p>
      </div>
      <Button onClick={onAddCategory} size="sm">
        <Plus className="w-4 h-4" />
        <span>Create Category</span>
      </Button>
    </div>
  );
};
export default CategoryEmptyState;
