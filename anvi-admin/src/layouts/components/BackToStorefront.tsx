import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { APP_CONFIG } from '../../config/constants';

export const BackToStorefront: React.FC = () => {
  return (
    <a
      href={APP_CONFIG.liveStoreUrl}
      className="inline-flex items-center gap-2 text-xs font-semibold text-anvi-charcoal-muted hover:text-anvi-maroon transition-colors"
    >
      <ArrowLeft size={14} />
      <span>Back to Storefront</span>
    </a>
  );
};
