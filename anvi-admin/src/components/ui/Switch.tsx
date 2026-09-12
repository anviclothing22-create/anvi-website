import React from 'react';
import { cn } from '../../lib/utils';

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  className?: string;
}

export const Switch: React.FC<SwitchProps> = ({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  className,
}) => {
  return (
    <label
      className={cn(
        'inline-flex items-center gap-3 cursor-pointer select-none',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      <div
        className={cn(
          'w-9 h-5 rounded-full transition-colors relative p-0.5 shrink-0',
          checked ? 'bg-anvi-maroon' : 'bg-anvi-sand'
        )}
        onClick={() => !disabled && onChange(!checked)}
      >
        <div
          className={cn(
            'w-4 h-4 rounded-full bg-white shadow-sm transition-transform',
            checked ? 'translate-x-4' : 'translate-x-0'
          )}
        />
      </div>
      {(label || description) && (
        <div className="space-y-0.5">
          {label && <span className="text-xs font-medium text-anvi-charcoal block">{label}</span>}
          {description && <span className="text-[11px] text-anvi-muted block">{description}</span>}
        </div>
      )}
    </label>
  );
};
