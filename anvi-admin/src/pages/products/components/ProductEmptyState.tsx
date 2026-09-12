import React from 'react';
import { Package, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ProductEmptyStateProps {
  onAddProduct: () => void;
  isFiltered?: boolean;
}

export const ProductEmptyState: React.FC<ProductEmptyStateProps> = ({
  onAddProduct,
  isFiltered,
}) => {
  return (
    <div className="py-16 text-center space-y-4 max-w-sm mx-auto">
      <div className="w-14 h-14 rounded-2xl bg-anvi-linen border border-anvi-sand flex items-center justify-center mx-auto text-anvi-muted">
        <Package className="w-7 h-7" />
      </div>
      <div className="space-y-1">
        <h3 className="text-base font-serif font-bold text-anvi-charcoal">
          {isFiltered ? 'No creations match filters' : 'No products in catalog'}
        </h3>
        <p className="text-xs text-anvi-muted leading-relaxed">
          {isFiltered
            ? 'Try resetting your search query, status filters, or category selection.'
            : 'Start populating your ANVI catalogue by adding your first handcrafted outfit.'}
        </p>
      </div>
      {!isFiltered && (
        <Button onClick={onAddProduct} size="sm">
          <Plus className="w-4 h-4" />
          <span>Add Handcrafted Piece</span>
        </Button>
      )}
    </div>
  );
};
export default ProductEmptyState;
