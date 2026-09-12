import React from 'react';

interface ProductTableHeaderProps {
  onSelectAll?: (checked: boolean) => void;
  allSelected?: boolean;
}

export const ProductTableHeader: React.FC<ProductTableHeaderProps> = () => {
  return (
    <thead className="bg-anvi-linen/50 border-b border-anvi-sand/60 text-[11px] font-sans font-semibold uppercase tracking-wider text-anvi-muted">
      <tr>
        <th className="py-3.5 px-4 text-left">Product & Details</th>
        <th className="py-3.5 px-4 text-left">Category</th>
        <th className="py-3.5 px-4 text-left">Price (INR)</th>
        <th className="py-3.5 px-4 text-left">Inventory</th>
        <th className="py-3.5 px-4 text-left">Status</th>
        <th className="py-3.5 px-4 text-right">Actions</th>
      </tr>
    </thead>
  );
};
export default ProductTableHeader;
