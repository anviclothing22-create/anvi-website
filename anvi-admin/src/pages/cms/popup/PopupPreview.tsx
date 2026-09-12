import React from 'react';
import { X, Sparkles } from 'lucide-react';
import { PromoPopup } from '@/types/popup';
import { Button } from '@/components/ui/Button';

interface PopupPreviewProps {
  popup: PromoPopup;
}

export const PopupPreview: React.FC<PopupPreviewProps> = ({ popup }) => {
  return (
    <div className="bg-anvi-linen/40 p-6 rounded-2xl border border-anvi-sand/60 flex items-center justify-center">
      <div className="w-full max-w-sm bg-white rounded-2xl border border-anvi-sand/80 shadow-2xl overflow-hidden relative animate-scale-up">
        {/* Close Button mockup */}
        <div className="absolute top-3 right-3 p-1 rounded-full bg-stone-100 text-stone-500 hover:text-stone-800">
          <X className="w-3.5 h-3.5" />
        </div>

        {popup.imageUrl && (
          <div className="w-full h-36 bg-stone-100 overflow-hidden">
            <img src={popup.imageUrl} alt="Popup" className="w-full h-full object-cover" />
          </div>
        )}

        <div className="p-5 text-center space-y-3">
          <div className="w-8 h-8 rounded-full bg-anvi-linen text-anvi-gold-dark flex items-center justify-center mx-auto">
            <Sparkles className="w-4 h-4" />
          </div>

          <div className="space-y-1">
            <h4 className="font-serif font-bold text-base text-anvi-charcoal">{popup.title}</h4>
            <p className="text-xs text-anvi-muted leading-relaxed">{popup.description}</p>
          </div>

          {popup.couponCode && (
            <div className="py-2 px-3 bg-anvi-linen rounded-xl border border-dashed border-anvi-gold text-center">
              <span className="text-[10px] uppercase text-anvi-muted tracking-wider block">Privilege Code</span>
              <span className="font-mono font-bold text-xs text-anvi-maroon">{popup.couponCode}</span>
            </div>
          )}

          <Button size="sm" className="w-full justify-center text-xs">
            {popup.ctaText || 'Claim Invitation'}
          </Button>
        </div>
      </div>
    </div>
  );
};
export default PopupPreview;
