import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface AmbienceImageUploadProps {
  onAddImage: (url: string, caption: string) => void;
}

export const AmbienceImageUpload: React.FC<AmbienceImageUploadProps> = ({ onAddImage }) => {
  const [url, setUrl] = useState('');
  const [caption, setCaption] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    onAddImage(url.trim(), caption.trim() || 'Store interior');
    setUrl('');
    setCaption('');
  };

  return (
    <form onSubmit={handleAdd} className="p-4 rounded-xl bg-anvi-linen/40 border border-anvi-sand/60 flex flex-col sm:flex-row gap-3 items-end">
      <div className="flex-1 space-y-1 w-full">
        <label className="text-[11px] font-semibold text-anvi-muted uppercase tracking-wider">
          Add Ambience Photo URL
        </label>
        <Input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://images.unsplash.com/..."
          className="text-xs h-9"
          required
        />
      </div>

      <div className="w-full sm:w-56 space-y-1">
        <label className="text-[11px] font-semibold text-anvi-muted uppercase tracking-wider">
          Caption / Corner
        </label>
        <Input
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="e.g. Saree Lounge & Draping Mirror"
          className="text-xs h-9"
        />
      </div>

      <Button type="submit" size="sm" className="h-9 shrink-0">
        <Plus className="w-3.5 h-3.5" />
        <span>Add Photo</span>
      </Button>
    </form>
  );
};
export default AmbienceImageUpload;
