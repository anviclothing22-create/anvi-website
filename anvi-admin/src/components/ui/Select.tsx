import React, { forwardRef } from 'react';
import { cn } from '../../lib/utils';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options?: SelectOption[];
  hasError?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, options, children, hasError, disabled, ...props }, ref) => {
    return (
      <div className="relative flex items-center w-full">
        <select
          ref={ref}
          disabled={disabled}
          className={cn(
            'w-full appearance-none rounded-xl border border-anvi-sand/80 bg-white px-3.5 py-2 pr-9 text-xs text-anvi-charcoal transition-colors focus:outline-none focus:ring-2 focus:ring-anvi-gold/40 focus:border-anvi-gold disabled:bg-anvi-linen disabled:cursor-not-allowed',
            hasError && 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20',
            className
          )}
          {...props}
        >
          {children}
          {options &&
            options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
        </select>
        <div className="absolute right-3 text-anvi-muted pointer-events-none">
          <ChevronDown size={14} />
        </div>
      </div>
    );
  }
);

Select.displayName = 'Select';
