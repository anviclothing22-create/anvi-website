import React, { useState } from 'react';
import { Upload, Plus, Link as LinkIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { supabase } from '@/lib/supabase';

interface ProductImageUploadProps {
  onAddImage: (url: string, alt?: string) => void;
}

export const ProductImageUpload: React.FC<ProductImageUploadProps> = ({ onAddImage }) => {
  const [urlInput, setUrlInput] = useState('');
  const [altInput, setAltInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    onAddImage(urlInput.trim(), altInput.trim() || 'ANVI garment');
    setUrlInput('');
    setAltInput('');
    setShowUrlInput(false);
  };

  const handleFileSimulate = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'webp';
      const cleanName = `prod-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${ext}`;
      const contentType = file.type || 'image/jpeg';

      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(cleanName, file, {
          contentType,
          upsert: true,
        });

      if (error) {
        console.warn('Storage upload error, using local data URL fallback:', error);
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            onAddImage(reader.result, file.name.replace(/\.[^/.]+$/, ''));
          }
        };
        reader.readAsDataURL(file);
      } else {
        const { data: publicUrlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(data.path);

        onAddImage(publicUrlData.publicUrl, file.name.replace(/\.[^/.]+$/, ''));
      }
    } catch (err: any) {
      console.warn('Error during product image selection:', err);
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          onAddImage(reader.result, file.name.replace(/\.[^/.]+$/, ''));
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploading(false);
      // Reset input value so same file can be picked again if desired
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <label className={`flex-1 cursor-pointer flex items-center justify-center gap-2 border-2 border-dashed border-anvi-sand rounded-xl p-4 transition-colors ${
          isUploading ? 'opacity-70 bg-anvi-linen/50 cursor-wait' : 'hover:border-anvi-gold bg-anvi-linen/30 hover:bg-anvi-linen/60'
        }`}>
          {isUploading ? (
            <>
              <Loader2 className="w-4 h-4 text-anvi-maroon animate-spin" />
              <span className="text-xs font-medium text-anvi-charcoal">
                Uploading photo from device...
              </span>
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 text-anvi-maroon" />
              <span className="text-xs font-medium text-anvi-charcoal">
                Upload from device (PNG, JPG, WebP)
              </span>
            </>
          )}
          <input
            type="file"
            accept="image/*"
            disabled={isUploading}
            onChange={handleFileSimulate}
            className="hidden"
          />
        </label>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="h-full py-4 text-xs"
        >
          <LinkIcon className="w-3.5 h-3.5" />
          <span>Image URL</span>
        </Button>
      </div>

      {showUrlInput && (
        <form onSubmit={handleUrlSubmit} className="p-3 bg-anvi-linen/50 rounded-xl border border-anvi-sand flex gap-2">
          <Input
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://example.com/dress.jpg"
            className="text-xs h-9"
          />
          <Input
            value={altInput}
            onChange={(e) => setAltInput(e.target.value)}
            placeholder="Alt label"
            className="text-xs h-9 w-36"
          />
          <Button type="submit" size="sm" className="h-9">
            Add
          </Button>
        </form>
      )}
    </div>
  );
};
export default ProductImageUpload;
