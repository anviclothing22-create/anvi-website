import React from 'react';
import { cn } from '../../lib/utils';
import { AlertCircle } from 'lucide-react';

export interface FormErrorProps {
  error?: string;
  className?: string;
}

export const FormError: React.FC<FormErrorProps> = ({ error, className }) => {
  if (!error) return null;

  return (
    <p className={cn('flex items-center gap-1 mt-1 text-xs text-rose-600 font-medium', className)}>
      <AlertCircle size={12} className="shrink-0" />
      <span>{error}</span>
    </p>
  );
};
