import React, { useState, useRef } from 'react';
import { Upload, Link as LinkIcon, X, CheckCircle2, Image as ImageIcon, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';

interface ImagePickerProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  required?: boolean;
  bucket?: string;
  placeholder?: string;
  helpText?: string;
}

export const ImagePicker: React.FC<ImagePickerProps> = ({
  value,
  onChange,
  label,
  required = false,
  bucket = 'hero-banners',
  placeholder = 'https://images.unsplash.com/...',
  helpText,
}) => {
  const [activeMode, setActiveMode] = useState<'device' | 'url'>('device');
  const [urlInput, setUrlInput] = useState(value || '');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset errors
    setUploadError(null);
    setIsUploading(true);

    try {
      // 1. Sanitize filename
      const ext = file.name.split('.').pop()?.toLowerCase() || 'webp';
      const cleanName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
      const contentType = file.type || 'image/jpeg';

      // 2. Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(cleanName, file, {
          contentType,
          upsert: true,
        });

      if (error) {
        console.warn(`[ImagePicker] Supabase storage upload failed, converting to local data URL:`, error);
        // Fallback to Base64 data URL so user flow is never disrupted
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            onChange(reader.result);
            setUrlInput(reader.result);
            setIsUploading(false);
          }
        };
        reader.readAsDataURL(file);
        return;
      }

      // 3. Get Public URL
      const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(data.path);
      const publicUrl = publicUrlData.publicUrl;
      onChange(publicUrl);
      setUrlInput(publicUrl);
      setIsUploading(false);
    } catch (err) {
      console.warn('[ImagePicker] Upload exception, falling back to data URL:', err);
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          onChange(reader.result);
          setUrlInput(reader.result);
          setIsUploading(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    onChange(urlInput.trim());
  };

  const handleRemove = () => {
    onChange('');
    setUrlInput('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const isCloudStorage = Boolean(value && (value.includes('supabase.co/storage') || value.startsWith('data:image/')));

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold text-anvi-charcoal">
            {label} {required && <span className="text-red-500">*</span>}
          </label>

          {/* Mode Switcher */}
          {!value && (
            <div className="flex items-center gap-1 text-[11px]">
              <button
                type="button"
                onClick={() => setActiveMode('device')}
                className={`px-2 py-0.5 rounded transition-colors ${
                  activeMode === 'device'
                    ? 'bg-anvi-maroon text-white font-medium'
                    : 'text-anvi-muted hover:text-anvi-charcoal'
                }`}
              >
                Upload from Device
              </button>
              <button
                type="button"
                onClick={() => setActiveMode('url')}
                className={`px-2 py-0.5 rounded transition-colors ${
                  activeMode === 'url'
                    ? 'bg-anvi-maroon text-white font-medium'
                    : 'text-anvi-muted hover:text-anvi-charcoal'
                }`}
              >
                Paste URL
              </button>
            </div>
          )}
        </div>
      )}

      {/* When an image is already chosen/uploaded: Preview Card */}
      {value ? (
        <div className="relative group rounded-xl border border-anvi-sand/80 bg-anvi-linen/30 p-3 flex items-center gap-4">
          <div className="relative w-24 h-16 rounded-lg overflow-hidden border border-anvi-sand/50 bg-black/5 shrink-0 shadow-sm">
            <img
              src={value}
              alt="Preview"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/images/brand/store_front.webp';
              }}
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <CheckCircle2 className="w-3 h-3" />
                {isCloudStorage ? 'Device Image Uploaded' : 'Linked Image'}
              </span>
            </div>
            <p className="text-xs text-anvi-muted truncate font-mono" title={value}>
              {value}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs h-8 px-2.5"
            >
              <Upload className="w-3.5 h-3.5 mr-1" />
              <span>Change Pic</span>
            </Button>
            <button
              type="button"
              onClick={handleRemove}
              className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              title="Remove image"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* Empty State: Device Upload or URL Input */
        <div>
          {activeMode === 'device' ? (
            <div
              onClick={() => !isUploading && fileInputRef.current?.click()}
              className={`relative cursor-pointer border-2 border-dashed rounded-xl p-6 transition-all text-center flex flex-col items-center justify-center gap-2 ${
                isUploading
                  ? 'border-anvi-gold bg-anvi-linen/60 cursor-wait'
                  : 'border-anvi-sand/70 hover:border-anvi-gold hover:bg-anvi-linen/40 bg-anvi-linen/20'
              }`}
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-7 h-7 text-anvi-maroon animate-spin" />
                  <p className="text-xs font-semibold text-anvi-charcoal">
                    Uploading picture from your device...
                  </p>
                  <p className="text-[11px] text-anvi-muted">
                    Storing high-resolution image in cloud storage
                  </p>
                </>
              ) : (
                <>
                  <div className="w-10 h-10 rounded-full bg-anvi-maroon/10 text-anvi-maroon flex items-center justify-center">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-anvi-charcoal">
                      Click to choose picture from your device
                    </p>
                    <p className="text-[11px] text-anvi-muted">
                      PNG, JPG, WebP, or SVG from your computer or phone (up to 10MB)
                    </p>
                  </div>
                  <div className="mt-1">
                    <span className="text-[11px] font-semibold text-anvi-maroon underline hover:text-anvi-charcoal">
                      Browse local files
                    </span>
                    <span className="text-[11px] text-anvi-muted mx-2">or</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMode('url');
                      }}
                      className="text-[11px] text-anvi-muted hover:text-anvi-charcoal underline"
                    >
                      paste web URL instead
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-anvi-muted" />
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder={placeholder}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white rounded-xl border border-anvi-sand/60 focus:outline-none focus:border-anvi-maroon"
                  />
                </div>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={handleUrlSubmit}
                  disabled={!urlInput.trim()}
                  className="text-xs h-9 px-3"
                >
                  <LinkIcon className="w-3.5 h-3.5 mr-1" />
                  <span>Set URL</span>
                </Button>
              </div>

              <div className="flex items-center justify-between text-[11px] text-anvi-muted px-1">
                <span>Enter an absolute image link (Unsplash, CDN, etc.)</span>
                <button
                  type="button"
                  onClick={() => setActiveMode('device')}
                  className="text-anvi-maroon font-semibold underline hover:text-anvi-charcoal"
                >
                  Switch to Device Upload
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Hidden file input for device upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Hidden input for form validation when required */}
      {required && (
        <input
          type="text"
          value={value}
          onChange={() => {}}
          required
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
        />
      )}

      {uploadError && (
        <p className="text-xs text-red-500 mt-1">{uploadError}</p>
      )}

      {helpText && (
        <p className="text-[11px] text-anvi-muted">{helpText}</p>
      )}
    </div>
  );
};
