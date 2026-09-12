import React from 'react';
import { MapPin, Phone, Clock } from 'lucide-react';
import { StoreAmbience } from '@/types/ambience';

interface AmbienceHeroProps {
  ambience: StoreAmbience;
}

export const AmbienceHero: React.FC<AmbienceHeroProps> = ({ ambience }) => {
  return (
    <div className="relative rounded-2xl overflow-hidden border border-anvi-sand/60 bg-white">
      <div className="h-52 w-full relative bg-stone-900">
        <img
          src={ambience.heroImage}
          alt={ambience.storeName}
          className="w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="absolute bottom-5 left-6 right-6 text-white space-y-1">
          <span className="text-[10px] uppercase font-semibold text-anvi-gold tracking-widest">
            Flagship Experience
          </span>
          <h3 className="text-xl font-serif font-bold text-white">{ambience.storeName}</h3>
          <p className="text-xs text-white/80 line-clamp-1">{ambience.tagline}</p>
        </div>
      </div>

      <div className="p-4 bg-anvi-linen/50 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="flex items-start gap-2 text-anvi-charcoal">
          <MapPin className="w-3.5 h-3.5 text-anvi-maroon shrink-0 mt-0.5" />
          <span className="text-[11px] leading-relaxed text-anvi-muted">{ambience.address}</span>
        </div>
        <div className="flex items-center gap-2 text-anvi-charcoal">
          <Phone className="w-3.5 h-3.5 text-anvi-maroon shrink-0" />
          <span className="text-[11px] text-anvi-muted">{ambience.phone}</span>
        </div>
        <div className="flex items-center gap-2 text-anvi-charcoal">
          <Clock className="w-3.5 h-3.5 text-anvi-maroon shrink-0" />
          <span className="text-[11px] text-anvi-muted">{ambience.timings}</span>
        </div>
      </div>
    </div>
  );
};
export default AmbienceHero;
