import React from 'react';
import { Megaphone, Image, MessageSquare, BookOpen, Store, Star } from 'lucide-react';

const InstagramIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

export type CMSTabId = 'announcements' | 'hero' | 'popup' | 'blog' | 'ambience' | 'instagram' | 'reviews';

interface CMSTabsProps {
  activeTab: CMSTabId;
  onChange: (tab: CMSTabId) => void;
}

export const CMSTabs: React.FC<CMSTabsProps> = ({ activeTab, onChange }) => {
  const tabs = [
    { id: 'announcements', label: 'Announcement Ticker', icon: Megaphone },
    { id: 'hero', label: 'Hero Editorial Banners', icon: Image },
    { id: 'reviews', label: 'Customer Reviews (Loved by Women)', icon: Star },
    { id: 'popup', label: 'Promotional Welcome Modal', icon: MessageSquare },
    { id: 'blog', label: 'Journal & Stories', icon: BookOpen },
    { id: 'ambience', label: 'Store Ambience (Tatabad Boutique)', icon: Store },
    { id: 'instagram', label: 'Instagram Reels (Elfsight)', icon: InstagramIcon },
  ] as const;

  return (
    <div className="flex flex-wrap gap-2 p-1.5 bg-white rounded-2xl border border-anvi-sand/60 shadow-luxury-subtle">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id as CMSTabId)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium transition-all ${
              isActive
                ? 'bg-anvi-maroon text-white shadow-sm font-semibold'
                : 'text-anvi-muted hover:text-anvi-charcoal hover:bg-anvi-linen/50'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};
export default CMSTabs;
