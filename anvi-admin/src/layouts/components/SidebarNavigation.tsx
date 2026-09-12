import React from 'react';
import { useLocation, Link } from 'wouter';
import { NAV_ITEMS } from '../../config/navigation';
import { cn } from '../../lib/utils';

export const SidebarNavigation: React.FC = () => {
  const [location] = useLocation();

  return (
    <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto" aria-label="Admin Navigation">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive =
          item.href === '/' ? location === '/' : location.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'group flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
              isActive
                ? 'bg-white/15 text-white font-semibold shadow-sm border-l-2 border-anvi-gold pl-3'
                : 'text-white/80 hover:bg-white/10 hover:text-white'
            )}
          >
            <div className="flex items-center gap-3 min-w-0">
              <Icon
                size={18}
                className={cn(
                  'shrink-0 transition-transform group-hover:scale-110',
                  isActive ? 'text-anvi-gold' : 'text-white/70'
                )}
              />
              <span className="truncate">{item.label}</span>
            </div>

            {item.badge && (
              <span
                className={cn(
                  'text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider',
                  isActive
                    ? 'bg-anvi-gold text-[#380B15]'
                    : 'bg-white/15 text-anvi-gold-light border border-anvi-gold/30'
                )}
              >
                {item.badge}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
};
