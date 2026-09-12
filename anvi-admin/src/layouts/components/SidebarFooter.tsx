import React from 'react';
import { ViewLiveStoreButton } from './ViewLiveStoreButton';
import { LogoutButton } from './LogoutButton';
import { APP_CONFIG } from '../../config/constants';
import { Sparkles, MapPin } from 'lucide-react';

export const SidebarFooter: React.FC = () => {
  return (
    <div className="p-3.5 border-t border-white/10 space-y-2.5">
      <ViewLiveStoreButton />

      {/* Curator & Boutique Info Card */}
      <div className="p-3 bg-white/10 rounded-xl border border-white/10 space-y-1.5 backdrop-blur-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-anvi-gold to-amber-600 text-white font-serif font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
            N
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <p className="text-xs font-serif font-bold text-white truncate">{APP_CONFIG.curatorName}</p>
              <Sparkles size={10} className="text-anvi-gold" />
            </div>
            <p className="text-[10px] text-white/70 truncate">{APP_CONFIG.curatorRole}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-anvi-gold-light/90 pt-1 border-t border-white/10">
          <MapPin size={10} className="shrink-0" />
          <span className="truncate">Tatabad · Coimbatore</span>
        </div>
      </div>

      <LogoutButton />
    </div>
  );
};
