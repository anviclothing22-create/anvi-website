import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Category } from '@/types/category';

interface DeleteCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: Category | null;
  onConfirm: (id: string) => void;
  loading?: boolean;
}

export const DeleteCategoryModal: React.FC<DeleteCategoryModalProps> = ({
  isOpen,
  onClose,
  category,
  onConfirm,
  loading = false,
}) => {
  if (!category) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Collection Category"
      size="md"
    >
      <div className="space-y-4">
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs text-rose-900">
            <p className="font-semibold">Confirm Removal</p>
            <p className="leading-relaxed">
              Are you certain you want to remove <span className="font-bold">{category.name}</span>?
              Products assigned to this category will become uncategorized.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-anvi-sand/40">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => onConfirm(category.id)}
            loading={loading}
          >
            Delete Category
          </Button>
        </div>
      </div>
    </Modal>
  );
};
export default DeleteCategoryModal;
