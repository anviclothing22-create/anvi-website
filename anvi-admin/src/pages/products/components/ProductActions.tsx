import React from 'react';
import { Edit2, Trash2, ExternalLink } from 'lucide-react';
import { IconButton } from '@/components/ui/IconButton';
import { Product } from '@/types/product';
import { APP_CONFIG } from '@/config/constants';

interface ProductActionsProps {
  product: Product;
  onEdit: () => void;
  onDelete: () => void;
}

export const ProductActions: React.FC<ProductActionsProps> = ({
  product,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="flex items-center justify-end gap-1">
      <IconButton
        icon={ExternalLink}
        label="View in Storefront"
        onClick={() => window.open(`${APP_CONFIG.liveStoreUrl}/product/${product.slug}`, '_blank')}
        className="text-anvi-muted hover:text-anvi-charcoal"
      />
      <IconButton
        icon={Edit2}
        label="Edit Product"
        onClick={onEdit}
        className="text-anvi-muted hover:text-anvi-maroon"
      />
      <IconButton
        icon={Trash2}
        label="Delete Product"
        onClick={onDelete}
        className="text-anvi-muted hover:text-rose-600"
      />
    </div>
  );
};
export default ProductActions;
