import React from 'react';
import { Edit2, Trash2, ExternalLink } from 'lucide-react';
import { IconButton } from '@/components/ui/IconButton';
import { BlogPost } from '@/types/blog';
import { APP_CONFIG } from '@/config/constants';

interface BlogPostActionsProps {
  post: BlogPost;
  onEdit: () => void;
  onDelete: () => void;
}

export const BlogPostActions: React.FC<BlogPostActionsProps> = ({
  post,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="flex items-center justify-end gap-1">
      <IconButton
        icon={ExternalLink}
        label="View in Journal"
        onClick={() => window.open(`${APP_CONFIG.liveStoreUrl}/journal/${post.slug}`, '_blank')}
        className="text-anvi-muted hover:text-anvi-charcoal"
      />
      <IconButton
        icon={Edit2}
        label="Edit Article"
        onClick={onEdit}
        className="text-anvi-muted hover:text-anvi-maroon"
      />
      <IconButton
        icon={Trash2}
        label="Delete Article"
        onClick={onDelete}
        className="text-anvi-muted hover:text-rose-600"
      />
    </div>
  );
};
export default BlogPostActions;
