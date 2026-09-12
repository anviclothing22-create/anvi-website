import React from 'react';
import { Sparkles } from 'lucide-react';

export const SidebarBrand: React.FC = () => {
  return (
    <div className="px-5 py-5 border-b border-white/10 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <a href="/" className="inline-block group">
          <img
            src="/assets/brand/anvi-logo.png"
            alt="ANVI Clothing"
            className="h-9 w-auto object-contain brightness-110 drop-shadow-sm transition-transform group-hover:scale-105"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = '/assets/brand/anvi-logo.svg';
            }}
          />
        </a>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/10 text-[10px] font-semibold tracking-wider text-anvi-gold-light border border-anvi-gold/30">
          <Sparkles size={10} className="text-anvi-gold" />
          <span>ADMIN</span>
        </span>
      </div>
      <div className="flex items-center justify-between text-[11px] pt-0.5">
        <span className="text-white/70 font-sans tracking-wide">Boutique Operations</span>
        <span className="text-anvi-gold-light text-[10px] font-medium tracking-wider uppercase">Coimbatore</span>
      </div>
    </div>
  );
};
