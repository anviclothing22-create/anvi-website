import React from 'react';
import { cn } from '../../lib/utils';
import { Spinner } from './Spinner';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  loading = false,
  leftIcon,
  rightIcon,
  disabled,
  ...props
}) => {
  const isBusy = isLoading || loading;

  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary:
      'bg-anvi-maroon hover:bg-anvi-maroon-dark text-white shadow-sm focus:ring-anvi-maroon/40',
    secondary:
      'bg-anvi-gold hover:bg-anvi-gold-dark text-white shadow-sm focus:ring-anvi-gold/40',
    outline:
      'border border-anvi-sand/80 bg-white hover:bg-anvi-linen/50 text-anvi-charcoal focus:ring-anvi-sand',
    ghost:
      'bg-transparent hover:bg-anvi-linen text-anvi-charcoal focus:ring-anvi-sand',
    danger:
      'bg-rose-600 hover:bg-rose-700 text-white shadow-sm focus:ring-rose-400',
  };

  const sizes = {
    xs: 'text-[11px] px-2.5 py-1 gap-1',
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-xs sm:text-sm px-4 py-2 gap-2',
    lg: 'text-base px-5 py-2.5 gap-2.5',
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || isBusy}
      {...props}
    >
      {isBusy && <Spinner size="sm" className="mr-1 text-current" />}
      {!isBusy && leftIcon && <span className="shrink-0">{leftIcon}</span>}
      {children}
      {!isBusy && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
};
