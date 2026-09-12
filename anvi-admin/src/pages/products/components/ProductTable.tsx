import React from 'react';
import { Product } from '@/types/product';
import { ProductTableHeader } from './ProductTableHeader';
import { ProductTableRow } from './ProductTableRow';
import { ProductEmptyState } from './ProductEmptyState';

interface ProductTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onToggleStatus: (id: string, currentStatus?: boolean) => void;
  onAddProduct: () => void;
  isFiltered?: boolean;
}

export const ProductTable: React.FC<ProductTableProps> = ({
  products,
  onEdit,
  onDelete,
  onToggleStatus,
  onAddProduct,
  isFiltered,
}) => {
  if (products.length === 0) {
    return <ProductEmptyState onAddProduct={onAddProduct} isFiltered={isFiltered} />;
  }

  return (
    <div className="bg-white rounded-2xl border border-anvi-sand/60 shadow-luxury-subtle overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <ProductTableHeader />
          <tbody className="divide-y divide-anvi-sand/20">
            {products.map((product) => (
              <ProductTableRow
                key={product.id}
                product={product}
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
export default ProductTable;
