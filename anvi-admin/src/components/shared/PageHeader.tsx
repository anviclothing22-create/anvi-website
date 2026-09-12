import React from 'react';
import { cn } from '../../lib/utils';

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  breadcrumbs?: { label: string; href?: string }[];
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  badge,
  actions,
  breadcrumbs,
  className,
}) => {
  return (
    <header className={cn('mb-6 sm:mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4', className)}>
      <div>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="mb-2">
            <ol className="flex items-center gap-1.5 text-xs text-anvi-charcoal-muted">
              {breadcrumbs.map((crumb, idx) => (
                <li key={idx} className="flex items-center gap-1.5">
                  {idx > 0 && <span className="opacity-50">/</span>}
                  {crumb.href ? (
                    <a href={crumb.href} className="hover:text-anvi-maroon transition-colors">
                      {crumb.label}
                    </a>
                  ) : (
                    <span className="font-semibold text-anvi-charcoal-text">{crumb.label}</span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}
        <div className="flex items-center gap-3">
          <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-anvi-charcoal-text tracking-tight">
            {title}
          </h1>
          {badge}
        </div>
        {subtitle && (
          <p className="mt-1 text-xs sm:text-sm text-anvi-charcoal-muted leading-relaxed max-w-2xl">
            {subtitle}
          </p>
        )}
      </div>

      {actions && <div className="flex items-center gap-2.5 shrink-0">{actions}</div>}
    </header>
  );
};
