import React, { useState } from 'react';
import { Upload, Plus, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface ProductImageUploadProps {
  onAddImage: (url: string, alt?: string) => void;
}

export const ProductImageUpload: React.FC<ProductImageUploadProps> = ({ onAddImage }) => {
  const [urlInput, setUrlInput] = useState('');
  const [altInput, setAltInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    onAddImage(urlInput.trim(), altInput.trim() || 'ANVI garment');
    setUrlInput('');
    setAltInput('');
    setShowUrlInput(false);
  };

  const handleFileSimulate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In web app without s3, we create an object URL or simulated path
      const fakeUrl = URL.createObjectURL(file);
      onAddImage(fakeUrl, file.name);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <label className="flex-1 cursor-pointer flex items-center justify-center gap-2 border-2 border-dashed border-anvi-sand rounded-xl p-4 hover:border-anvi-gold transition-colors bg-anvi-linen/30 hover:bg-anvi-linen/60">
          <Upload className="w-4 h-4 text-anvi-maroon" />
          <span className="text-xs font-medium text-anvi-charcoal">
            Upload from device (PNG, JPG, WebP)
          </span>
          <input
            type="file"
            accept="image/*"
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
