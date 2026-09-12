import React from 'react';
import { cn } from '../../lib/utils';
import { LucideIcon } from 'lucide-react';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  ariaLabel?: string;
  label?: string;
  icon?: LucideIcon | React.ComponentType<{ className?: string }>;
}

export const IconButton: React.FC<IconButtonProps> = ({
  children,
  className,
  variant = 'ghost',
  size = 'md',
  ariaLabel,
  label,
  icon: Icon,
  ...props
}) => {
  const accessibleLabel = label || ariaLabel || 'Action';

  const baseStyles =
    'inline-flex items-center justify-center rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50';

  const variants = {
    primary: 'bg-anvi-maroon hover:bg-anvi-maroon-dark text-white',
    secondary: 'bg-anvi-gold hover:bg-anvi-gold-dark text-white',
    outline: 'border border-anvi-sand/80 bg-white hover:bg-anvi-linen/50 text-anvi-charcoal',
    ghost: 'bg-transparent hover:bg-anvi-linen/60 text-anvi-charcoal hover:text-anvi-maroon',
    danger: 'bg-rose-50 text-rose-700 hover:bg-rose-100',
  };

  const sizes = {
    sm: 'w-7 h-7 p-1',
    md: 'w-8 h-8 p-1.5',
    lg: 'w-10 h-10 p-2',
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      aria-label={accessibleLabel}
      title={accessibleLabel}
      {...props}
    >
      {Icon && <Icon className="w-4 h-4 shrink-0" />}
      {children}
    </button>
  );
};
