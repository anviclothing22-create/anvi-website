import React from 'react';
import { Button } from '@/components/ui/Button';

interface ProductFormActionsProps {
  onCancel: () => void;
  loading?: boolean;
  submitLabel?: string;
}

export const ProductFormActions: React.FC<ProductFormActionsProps> = ({
  onCancel,
  loading = false,
  submitLabel = 'Save Product',
}) => {
  return (
    <div className="flex items-center justify-end gap-3 pt-6 border-t border-anvi-sand/60">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        disabled={loading}
      >
        Discard
      </Button>
      <Button
        type="submit"
        loading={loading}
      >
        {submitLabel}
      </Button>
    </div>
  );
};
export default ProductFormActions;
