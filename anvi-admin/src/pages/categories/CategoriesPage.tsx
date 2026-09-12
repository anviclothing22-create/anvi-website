import React, { useState } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { CategoryTable } from './components/CategoryTable';
import { AddCategoryModal } from './modals/AddCategoryModal';
import { EditCategoryModal } from './modals/EditCategoryModal';
import { DeleteCategoryModal } from './modals/DeleteCategoryModal';
import { useCategories } from '@/hooks/useCategories';
import { Category, CategoryFormData } from '@/types/category';

export const CategoriesPage: React.FC = () => {
  const {
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    toggleCategoryStatus,
    refreshCategories,
  } = useCategories();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const handleAddSubmit = (data: CategoryFormData) => {
    setActionLoading(true);
    setTimeout(() => {
      addCategory(data);
      setActionLoading(false);
      setIsAddOpen(false);
    }, 400);
  };

  const handleEditSubmit = (id: string, data: Partial<CategoryFormData>) => {
    setActionLoading(true);
    setTimeout(() => {
      updateCategory(id, data);
      setActionLoading(false);
      setEditingCategory(null);
    }, 400);
  };

  const handleDeleteSubmit = (id: string) => {
    setActionLoading(true);
    setTimeout(() => {
      deleteCategory(id);
      setActionLoading(false);
      setDeletingCategory(null);
    }, 400);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Boutique Taxonomy & Categories"
        subtitle="Organize ANVI collections into clear, elegant shopping departments."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={refreshCategories}
              className="text-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Sync</span>
            </Button>
            <Button
              size="sm"
              onClick={() => setIsAddOpen(true)}
              className="text-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Category</span>
            </Button>
          </div>
        }
      />

      <CategoryTable
        categories={categories}
        onEdit={(cat) => setEditingCategory(cat)}
        onDelete={(cat) => setDeletingCategory(cat)}
        onToggleStatus={toggleCategoryStatus}
        onAddCategory={() => setIsAddOpen(true)}
      />

      <AddCategoryModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onAdd={handleAddSubmit}
        loading={actionLoading}
      />

      <EditCategoryModal
        isOpen={!!editingCategory}
        onClose={() => setEditingCategory(null)}
        category={editingCategory}
        onUpdate={handleEditSubmit}
        loading={actionLoading}
      />

      <DeleteCategoryModal
        isOpen={!!deletingCategory}
        onClose={() => setDeletingCategory(null)}
        category={deletingCategory}
        onConfirm={handleDeleteSubmit}
        loading={actionLoading}
      />
    </div>
  );
};
export default CategoriesPage;
