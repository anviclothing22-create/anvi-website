import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface StatCardProps {
  label: string;
  value: string | number;
  change?: number;
  icon: LucideIcon;
  subtext?: string;
  iconColor?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  change,
  icon: Icon,
  subtext,
  iconColor = 'text-anvi-maroon',
}) => {
  const isPositive = change !== undefined && change >= 0;

  return (
    <div className="bg-white rounded-2xl border border-anvi-sand/60 p-5 shadow-luxury-subtle transition-all duration-200 hover:shadow-luxury hover:border-anvi-gold/30 relative overflow-hidden group">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-wider text-anvi-muted font-medium font-sans">
            {label}
          </p>
          <p className="text-2xl font-serif font-bold text-anvi-charcoal tracking-tight">
            {value}
          </p>
        </div>
        <div className={cn('p-2.5 rounded-xl bg-anvi-linen/70 border border-anvi-sand/40', iconColor)}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-anvi-sand/30 flex items-center justify-between text-xs">
        {change !== undefined ? (
          <div className="flex items-center gap-1">
            <span
              className={cn(
                'inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md font-medium text-[11px]',
                isPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
              )}
            >
              {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {Math.abs(change)}%
            </span>
            <span className="text-anvi-muted text-[11px]">vs last month</span>
          </div>
        ) : (
          <span className="text-anvi-muted text-[11px]">{subtext || 'Active status'}</span>
        )}
        {subtext && change !== undefined && (
          <span className="text-[11px] text-anvi-muted">{subtext}</span>
        )}
      </div>
    </div>
  );
};
export default StatCard;
