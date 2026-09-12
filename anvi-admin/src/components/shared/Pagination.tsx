import React from 'react';
import { cn } from '../../lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  pageSize?: number;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  pageSize,
  className,
}) => {
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * (pageSize || 10) + 1;
  const endItem = Math.min(currentPage * (pageSize || 10), totalItems || 0);

  return (
    <div className={cn('flex items-center justify-between px-4 py-3 border-t border-anvi-linen-border bg-white text-xs', className)}>
      <div className="text-anvi-charcoal-muted">
        {totalItems ? (
          <span>
            Showing <strong className="text-anvi-charcoal-text">{startItem}</strong> to{' '}
            <strong className="text-anvi-charcoal-text">{endItem}</strong> of{' '}
            <strong className="text-anvi-charcoal-text">{totalItems}</strong> entries
          </span>
        ) : (
          <span>
            Page {currentPage} of {totalPages}
          </span>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-1.5 rounded border border-anvi-linen-border text-anvi-charcoal-text hover:bg-anvi-linen-subtle disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous page"
        >
          <ChevronLeft size={16} />
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            className={cn(
              'w-7 h-7 rounded text-xs font-semibold transition-colors',
              currentPage === page
                ? 'bg-anvi-maroon text-white'
                : 'hover:bg-anvi-linen-subtle text-anvi-charcoal-text border border-transparent'
            )}
          >
            {page}
          </button>
        ))}

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-1.5 rounded border border-anvi-linen-border text-anvi-charcoal-text hover:bg-anvi-linen-subtle disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Next page"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};
