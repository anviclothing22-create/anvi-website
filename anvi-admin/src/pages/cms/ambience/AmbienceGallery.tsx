import React from 'react';
import { Trash2 } from 'lucide-react';
import { AmbienceImage } from '@/types/ambience';
import { ImagePreview } from '@/components/shared/ImagePreview';

interface AmbienceGalleryProps {
  images: AmbienceImage[];
  onRemove: (id: string) => void;
}

export const AmbienceGallery: React.FC<AmbienceGalleryProps> = ({ images, onRemove }) => {
  return (
    <div className="space-y-3">
      <h4 className="text-xs uppercase tracking-wider font-semibold text-anvi-muted">
        Boutique Gallery ({images.length} photos)
      </h4>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {images.map((img) => (
          <div
            key={img.id}
            className="group relative rounded-xl overflow-hidden border border-anvi-sand/60 bg-stone-50 aspect-video shadow-sm"
          >
            <ImagePreview
              src={img.url || img.imageUrl || ''}
              alt={img.caption || img.title || 'Store photo'}
              className="w-full h-full object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-between">
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => onRemove(img.id)}
                  className="p-1 rounded-md bg-white/90 text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {img.caption && (
                <p className="text-[10px] text-white font-medium line-clamp-1">
                  {img.caption}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default AmbienceGallery;
