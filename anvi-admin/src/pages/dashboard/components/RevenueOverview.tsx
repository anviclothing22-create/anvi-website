import React, { useState } from 'react';
import { TrendingUp } from 'lucide-react';
import { RevenueChart } from './RevenueChart';
import { RevenuePoint } from '@/types/dashboard';

interface RevenueOverviewProps {
  data: RevenuePoint[];
  totalRevenue: number;
}

export const RevenueOverview: React.FC<RevenueOverviewProps> = ({ data }) => {
  const [filterRange, setFilterRange] = useState<'30d' | '90d' | '1y'>('30d');

  return (
    <div className="bg-white rounded-2xl border border-anvi-sand/60 p-6 shadow-luxury-subtle">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-anvi-sand/30">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-serif font-bold text-anvi-charcoal tracking-tight">
              Revenue Dynamics
            </h3>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              <TrendingUp className="w-3 h-3" />
              +14.8% overall
            </span>
          </div>
          <p className="text-xs text-anvi-muted">
            Tracking performance parity between e-commerce orders and Coimbatore boutique walk-ins.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-anvi-linen p-1 rounded-xl border border-anvi-sand/50 text-xs">
            {(['30d', '90d', '1y'] as const).map((range) => (
              <button
                key={range}
                type="button"
                onClick={() => setFilterRange(range)}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  filterRange === range
                    ? 'bg-white text-anvi-charcoal shadow-sm font-semibold'
                    : 'text-anvi-muted hover:text-anvi-charcoal'
                }`}
              >
                {range === '30d' ? 'Last 30 Days' : range === '90d' ? 'Past Quarter' : 'Year to Date'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-6">
        <RevenueChart data={data} />
      </div>
    </div>
  );
};
export default RevenueOverview;
