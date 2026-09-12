import { Edit2, Trash2 } from 'lucide-react';
import { HeroBanner } from '@/types/hero';
import { IconButton } from '@/components/ui/IconButton';
import { Switch } from '@/components/ui/Switch';
import { ImagePreview } from '@/components/shared/ImagePreview';

interface HeroBannerCardProps {
  banner: HeroBanner;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: (isActive: boolean) => void;
}

export const HeroBannerCard: React.FC<HeroBannerCardProps> = ({
  banner,
  onEdit,
  onDelete,
  onToggle,
}) => {
  return (
    <div className="rounded-2xl border border-anvi-sand/60 bg-white overflow-hidden shadow-luxury-subtle flex flex-col md:flex-row items-stretch">
      {/* Banner Preview image */}
      <div className="w-full md:w-56 h-40 md:h-auto relative bg-stone-100 shrink-0">
        <ImagePreview
          src={banner.imageUrl || banner.imageSrc || ''}
          alt={banner.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/60 text-white font-mono text-[10px]">
          #{banner.order}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between gap-3">
        <div className="space-y-1">
          {banner.subtitle && (
            <span className="text-[10px] uppercase font-semibold text-anvi-gold-dark tracking-wider">
              {banner.subtitle}
            </span>
          )}
          <h4 className="font-serif font-bold text-sm text-anvi-charcoal">{banner.title}</h4>
          {banner.description && (
            <p className="text-xs text-anvi-muted line-clamp-2">{banner.description}</p>
          )}
          <div className="flex items-center gap-2 pt-1 text-xs font-medium text-anvi-maroon">
            <span>CTA: "{banner.ctaText}"</span>
            <span>→</span>
            <span className="text-anvi-muted font-mono text-[11px]">{banner.ctaLink}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-anvi-sand/30">
          <Switch
            checked={banner.isActive}
            onChange={onToggle}
            label={banner.isActive ? 'Active on Homepage' : 'Hidden'}
          />

          <div className="flex items-center gap-1">
            <IconButton icon={Edit2} label="Edit Banner" onClick={onEdit} className="text-anvi-muted hover:text-anvi-maroon" />
            <IconButton icon={Trash2} label="Delete Banner" onClick={onDelete} className="text-anvi-muted hover:text-rose-600" />
          </div>
        </div>
      </div>
    </div>
  );
};
export default HeroBannerCard;
