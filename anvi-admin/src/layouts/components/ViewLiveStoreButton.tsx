import React from 'react';
import { ExternalLink, Sparkles } from 'lucide-react';
import { APP_CONFIG } from '../../config/constants';

export const ViewLiveStoreButton: React.FC = () => {
  return (
    <a
      href={APP_CONFIG.liveStoreUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center justify-between w-full px-3 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-anvi-gold/30 via-anvi-gold/20 to-transparent hover:from-anvi-gold/45 hover:to-anvi-gold/15 rounded-xl border border-anvi-gold/40 hover:border-anvi-gold transition-all shadow-sm"
      title="Open live customer storefront (port 5173)"
    >
      <div className="flex items-center gap-2">
        <Sparkles size={13} className="text-anvi-gold" />
        <span className="tracking-wide">View Live Storefront</span>
      </div>
      <ExternalLink size={13} className="text-anvi-gold transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
    </a>
  );
};
