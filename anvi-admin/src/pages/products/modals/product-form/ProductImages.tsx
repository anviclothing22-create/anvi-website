import React from 'react';
import { Trash2, Star } from 'lucide-react';
import { ProductImage, ProductFormData } from '@/types/product';
import { ProductImageUpload } from './ProductImageUpload';
import { ImagePreview } from '@/components/shared/ImagePreview';

interface ProductImagesProps {
  formData: ProductFormData;
  onChange: (field: keyof ProductFormData, value: any) => void;
  errors?: Record<string, string>;
}

const toProductImage = (img: string | ProductImage, idx: number): ProductImage => {
  if (typeof img === 'string') {
    return {
      id: `img_${idx}`,
      url: img,
      alt: 'Garment preview',
      isPrimary: idx === 0,
      order: idx,
    };
  }
  return img;
};

export const ProductImages: React.FC<ProductImagesProps> = ({
  formData,
  onChange,
  errors = {},
}) => {
  const rawImages = formData.images || [];
  const images: ProductImage[] = rawImages.map((im, idx) => toProductImage(im, idx));

  const handleAddImage = (url: string, alt?: string) => {
    const newImg: ProductImage = {
      id: `img_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      url,
      alt: alt || formData.name || 'ANVI garment',
      isPrimary: images.length === 0,
      order: images.length,
    };
    onChange('images', [...images, newImg]);
  };

  const handleRemoveImage = (id: string) => {
    const updated = images.filter((img) => img.id !== id);
    if (updated.length > 0 && !updated.some((img) => img.isPrimary)) {
      updated[0].isPrimary = true;
    }
    onChange('images', updated);
  };

  const handleSetPrimary = (id: string) => {
    const updated = images.map((img) => ({
      ...img,
      isPrimary: img.id === id,
    }));
    onChange('images', updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-anvi-sand/40 pb-2">
        <h4 className="text-xs uppercase tracking-wider font-semibold text-anvi-muted">
          Imagery & Lookbook Photos ({images.length})
        </h4>
        {errors.images && (
          <span className="text-xs text-rose-600 font-medium">{errors.images}</span>
        )}
      </div>

      <ProductImageUpload onAddImage={handleAddImage} />

      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-2">
          {images.map((img) => (
            <div
              key={img.id}
              className={`group relative rounded-xl overflow-hidden border ${
                img.isPrimary
                  ? 'border-anvi-maroon ring-2 ring-anvi-maroon/20'
                  : 'border-anvi-sand/70'
              } bg-stone-50 aspect-[3/4]`}
            >
              <ImagePreview
                src={img.url}
                alt={img.alt || 'Garment preview'}
                className="w-full h-full object-cover"
              />

              {/* Badges & Actions overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-between">
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(img.id)}
                    className="p-1.5 rounded-lg bg-white/90 text-rose-600 hover:bg-rose-50 transition-colors shadow-sm"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => handleSetPrimary(img.id)}
                    className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-md transition-all ${
                      img.isPrimary
                        ? 'bg-anvi-maroon text-white shadow-sm'
                        : 'bg-white/90 text-anvi-charcoal hover:bg-white'
                    }`}
                  >
                    <Star className="w-3 h-3" fill={img.isPrimary ? 'currentColor' : 'none'} />
                    {img.isPrimary ? 'Primary' : 'Make Cover'}
                  </button>
                </div>
              </div>

              {img.isPrimary && (
                <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-anvi-maroon text-white text-[9px] font-semibold tracking-wider uppercase shadow-sm">
                  Cover
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default ProductImages;
