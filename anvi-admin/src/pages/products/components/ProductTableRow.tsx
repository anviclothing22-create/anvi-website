import React from 'react';
import { Product } from '@/types/product';
import { formatCurrency } from '@/lib/formatCurrency';
import { ProductActions } from './ProductActions';
import { ImagePreview } from '@/components/shared/ImagePreview';

interface ProductTableRowProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onToggleStatus: (id: string, currentStatus?: boolean) => void;
}

export const ProductTableRow: React.FC<ProductTableRowProps> = ({
  product,
  onEdit,
  onDelete,
  onToggleStatus,
}) => {
  const stockUnits = product.stockQuantity ?? product.stock ?? 0;
  const isOutOfStock = stockUnits === 0;
  const isLowStock = stockUnits > 0 && stockUnits < 10;
  const firstImage = typeof product.images[0] === 'string'
    ? product.images[0]
    : product.images[0]?.url || '/assets/brand/anvi-logo.svg';
  const categoryLabel = product.category || (product.categorySlug ? product.categorySlug.replace('-', ' ') : 'Curation');
  const activeStatus = product.isActive ?? true;

  return (
    <tr className="border-b border-anvi-sand/30 hover:bg-anvi-linen/30 transition-colors group">
      {/* Product & Details */}
      <td className="py-3.5 px-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-14 rounded-lg overflow-hidden border border-anvi-sand/50 bg-stone-50 shrink-0">
            <ImagePreview
              src={firstImage}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="space-y-0.5">
            <p className="font-serif font-bold text-sm text-anvi-charcoal group-hover:text-anvi-maroon transition-colors line-clamp-1">
              {product.name}
            </p>
            <p className="text-[11px] font-mono text-anvi-muted">SKU: {product.sku}</p>
            <div className="flex items-center gap-1.5 pt-0.5">
              {product.isBestseller && (
                <span className="text-[9px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.2 rounded">
                  Bestseller
                </span>
              )}
              {product.isNewArrival && (
                <span className="text-[9px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.2 rounded">
                  New Arrival
                </span>
              )}
              {product.sizes && product.sizes.length > 0 && (
                <span className="text-[9px] text-anvi-muted">
                  {product.sizes.join(', ')}
                </span>
              )}
            </div>
          </div>
        </div>
      </td>

      {/* Category */}
      <td className="py-3.5 px-4 text-xs capitalize text-anvi-charcoal font-medium">
        {categoryLabel}
      </td>

      {/* Price */}
      <td className="py-3.5 px-4">
        <div className="text-xs">
          <span className="font-serif font-bold text-anvi-charcoal">
            {formatCurrency(product.price)}
          </span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="block text-[11px] text-anvi-muted line-through">
              {formatCurrency(product.originalPrice)}
            </span>
          )}
        </div>
      </td>

      {/* Inventory */}
      <td className="py-3.5 px-4">
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full shrink-0 ${
              isOutOfStock
                ? 'bg-rose-500'
                : isLowStock
                ? 'bg-amber-500'
                : 'bg-emerald-500'
            }`}
          />
          <span className="text-xs font-mono font-medium text-anvi-charcoal">
            {stockUnits} units
          </span>
        </div>
        {isLowStock && (
          <span className="text-[10px] text-amber-700 font-medium">Low Stock</span>
        )}
        {isOutOfStock && (
          <span className="text-[10px] text-rose-700 font-medium">Out of Stock</span>
        )}
      </td>

      {/* Status */}
      <td className="py-3.5 px-4">
        <button
          type="button"
          onClick={() => onToggleStatus(product.id, activeStatus)}
          className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium transition-all ${
            activeStatus
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
              : 'bg-stone-100 text-stone-600 border border-stone-200 hover:bg-stone-200'
          }`}
        >
          {activeStatus ? 'Active' : 'Draft / Off'}
        </button>
      </td>

      {/* Actions */}
      <td className="py-3.5 px-4 text-right">
        <ProductActions
          product={product}
          onEdit={() => onEdit(product)}
          onDelete={() => onDelete(product)}
        />
      </td>
    </tr>
  );
};
export default ProductTableRow;
