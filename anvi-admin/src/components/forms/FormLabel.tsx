import React from 'react';
import { cn } from '../../lib/utils';

export interface FormLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export const FormLabel: React.FC<FormLabelProps> = ({
  children,
  className,
  required,
  ...props
}) => {
  return (
    <label
      className={cn('block text-xs font-semibold text-anvi-charcoal-text uppercase tracking-wider mb-1.5', className)}
      {...props}
    >
      {children}
      {required && <span className="text-rose-600 ml-1 font-bold">*</span>}
    </label>
  );
};
