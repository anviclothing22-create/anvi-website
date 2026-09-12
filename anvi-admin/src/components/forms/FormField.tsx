import React from 'react';
import { cn } from '../../lib/utils';
import { FormLabel } from './FormLabel';
import { FormError } from './FormError';

export interface FormFieldProps {
  label?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  children: React.ReactNode;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  required,
  error,
  helperText,
  children,
  className,
}) => {
  return (
    <div className={cn('w-full mb-4', className)}>
      {label && <FormLabel required={required}>{label}</FormLabel>}
      {children}
      {helperText && !error && (
        <p className="mt-1 text-[11px] text-anvi-charcoal-muted leading-tight">{helperText}</p>
      )}
      <FormError error={error} />
    </div>
  );
};
