import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { CMSSection } from '../components/CMSSection';
import { BlogTable } from './BlogTable';
import { BlogPostForm } from './BlogPostForm';
import { Modal } from '@/components/ui/Modal';
import { BlogPost } from '@/types/blog';

interface BlogManagerProps {
  posts: BlogPost[];
  onAdd: (data: Omit<BlogPost, 'id'>) => void;
  onUpdate: (id: string, data: Partial<BlogPost>) => void;
  onDelete: (id: string) => void;
}

export const BlogManager: React.FC<BlogManagerProps> = ({
  posts,
  onAdd,
  onUpdate,
  onDelete,
}) => {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BlogPost | null>(null);

  return (
    <CMSSection
      title="ANVI Journal & Editorial Articles"
      description="Publish thought pieces, textile craftsmanship stories, and styling masterclasses."
      action={
        <Button size="sm" onClick={() => setIsAddOpen(true)} className="text-xs">
          <Plus className="w-3.5 h-3.5" />
          <span>New Journal Article</span>
        </Button>
      }
    >
      <BlogTable
        posts={posts}
        onEdit={(p) => setEditingItem(p)}
        onDelete={onDelete}
        onToggleStatus={(id, pub) => onUpdate(id, { isPublished: !pub })}
      />

      {/* Add Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Draft New Journal Article"
        size="lg"
      >
        <BlogPostForm
          onSubmit={(data) => {
            onAdd(data);
            setIsAddOpen(false);
          }}
          onCancel={() => setIsAddOpen(false)}
          submitLabel="Publish to Journal"
        />
      </Modal>

      {/* Edit Modal */}
      {editingItem && (
        <Modal
          isOpen={!!editingItem}
          onClose={() => setEditingItem(null)}
          title={`Edit: ${editingItem.title}`}
          size="lg"
        >
          <BlogPostForm
            initialData={editingItem}
            onSubmit={(data) => {
              onUpdate(editingItem.id, data);
              setEditingItem(null);
            }}
            onCancel={() => setEditingItem(null)}
            submitLabel="Update Article"
          />
        </Modal>
      )}
    </CMSSection>
  );
};
export default BlogManager;
