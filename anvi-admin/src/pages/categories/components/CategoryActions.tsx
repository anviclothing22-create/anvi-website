import { Edit2, Trash2, ExternalLink } from 'lucide-react';
import { IconButton } from '@/components/ui/IconButton';
import { Category } from '@/types/category';
import { APP_CONFIG } from '@/config/constants';

interface CategoryActionsProps {
  category: Category;
  onEdit: () => void;
  onDelete: () => void;
}

export const CategoryActions: React.FC<CategoryActionsProps> = ({
  category,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="flex items-center justify-end gap-1">
      <IconButton
        icon={ExternalLink}
        label="View in Storefront"
        onClick={() => window.open(`${APP_CONFIG.liveStoreUrl}/shop/${category.slug}`, '_blank')}
        className="text-anvi-muted hover:text-anvi-charcoal"
      />
      <IconButton
        icon={Edit2}
        label="Edit Category"
        onClick={onEdit}
        className="text-anvi-muted hover:text-anvi-maroon"
      />
      <IconButton
        icon={Trash2}
        label="Delete Category"
        onClick={onDelete}
        className="text-anvi-muted hover:text-rose-600"
      />
    </div>
  );
};
export default CategoryActions;
