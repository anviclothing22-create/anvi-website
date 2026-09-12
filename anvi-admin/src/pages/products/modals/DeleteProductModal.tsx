import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Product } from '@/types/product';

interface DeleteProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onConfirm: (id: string) => void;
  loading?: boolean;
}

export const DeleteProductModal: React.FC<DeleteProductModalProps> = ({
  isOpen,
  onClose,
  product,
  onConfirm,
  loading = false,
}) => {
  if (!product) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Archive & Remove Creation"
      size="md"
    >
      <div className="space-y-4">
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs text-rose-900">
            <p className="font-semibold">Irreversible Action Warning</p>
            <p className="leading-relaxed">
              Are you certain you wish to delete <span className="font-bold font-serif">{product.name}</span> ({product.sku})?
              This will remove the product from customer storefront searches and lookbooks.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-anvi-sand/40">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => onConfirm(product.id)}
            loading={loading}
          >
            Permanently Remove
          </Button>
        </div>
      </div>
    </Modal>
  );
};
export default DeleteProductModal;
