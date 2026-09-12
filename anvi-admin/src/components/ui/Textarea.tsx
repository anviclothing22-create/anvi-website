import React, { forwardRef } from 'react';
import { cn } from '../../lib/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  hasError?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, hasError, disabled, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        disabled={disabled}
        className={cn(
          'w-full rounded-md border border-anvi-linen-border bg-white px-3.5 py-2 text-sm text-anvi-charcoal-text placeholder:text-anvi-charcoal-muted/60 transition-colors focus:outline-none focus:ring-2 focus:ring-anvi-maroon/20 focus:border-anvi-maroon disabled:bg-anvi-linen-subtle disabled:cursor-not-allowed',
          hasError && 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20',
          className
        )}
        {...props}
      />
    );
  }
);

Textarea.displayName = 'Textarea';
