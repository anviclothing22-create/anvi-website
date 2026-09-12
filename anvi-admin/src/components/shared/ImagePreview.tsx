import React from 'react';
import { cn } from '../../lib/utils';
import { X, Image as ImageIcon } from 'lucide-react';

export interface ImagePreviewProps {
  src: string;
  alt?: string;
  onRemove?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({
  src,
  alt = 'Preview',
  onRemove,
  className,
  size = 'md',
}) => {
  const sizeMap = {
    sm: 'w-12 h-12',
    md: 'w-20 h-20',
    lg: 'w-32 h-32',
  };

  return (
    <div
      className={cn(
        'relative rounded-md border border-anvi-linen-border overflow-hidden bg-[#FAF8F5] group shrink-0',
        sizeMap[size],
        className
      )}
    >
      {src ? (
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-anvi-charcoal-muted">
          <ImageIcon size={20} />
        </div>
      )}

      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="absolute top-1 right-1 p-1 bg-anvi-charcoal/70 hover:bg-anvi-maroon text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Remove image"
        >
          <X size={12} />
        </button>
      )}
    </div>
  );
};
