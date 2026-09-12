import React from 'react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/Button';

export interface FormActionsProps {
  onCancel?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
}

export const FormActions: React.FC<FormActionsProps> = ({
  onCancel,
  submitLabel = 'Save Changes',
  cancelLabel = 'Cancel',
  isLoading = false,
  disabled = false,
  className,
}) => {
  return (
    <div className={cn('flex items-center justify-end gap-3 pt-4 border-t border-anvi-linen-border mt-6', className)}>
      {onCancel && (
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          {cancelLabel}
        </Button>
      )}
      <Button type="submit" variant="primary" isLoading={isLoading} disabled={disabled}>
        {submitLabel}
      </Button>
    </div>
  );
};
