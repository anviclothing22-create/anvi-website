import React, { useState } from 'react';
import { RevenuePoint } from '@/types/dashboard';
import { formatCurrency } from '@/lib/formatCurrency';

interface RevenueChartProps {
  data: RevenuePoint[];
}

export const RevenueChart: React.FC<RevenueChartProps> = ({ data }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!data || data.length === 0) return null;

  const maxVal = Math.max(...data.map((d) => Math.max(d.online, d.offline, d.total)));
  const height = 220;
  const width = 600;
  const paddingX = 40;
  const paddingY = 30;

  const getX = (index: number) => paddingX + (index * (width - paddingX * 2)) / (data.length - 1);
  const getY = (val: number) => height - paddingY - (val / (maxVal * 1.15)) * (height - paddingY * 2);

  // Path generators
  const generatePath = (key: 'online' | 'offline' | 'total') => {
    return data.reduce((acc, point, idx) => {
      const x = getX(idx);
      const y = getY(point[key]);
      return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
    }, '');
  };

  const generateArea = (key: 'online' | 'offline') => {
    const line = generatePath(key);
    const lastX = getX(data.length - 1);
    const firstX = getX(0);
    const baseline = height - paddingY;
    return `${line} L ${lastX} ${baseline} L ${firstX} ${baseline} Z`;
  };

  return (
    <div className="w-full space-y-4">
      {/* Legend & Summary */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-6 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-anvi-maroon shadow-sm" />
            <span className="font-medium text-anvi-charcoal">Online Storefront</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-anvi-gold shadow-sm" />
            <span className="font-medium text-anvi-charcoal">Tatabad Boutique (Offline)</span>
          </div>
        </div>

        {hoveredIndex !== null && (
          <div className="text-xs bg-anvi-linen px-3 py-1.5 rounded-lg border border-anvi-sand flex items-center gap-3 animate-fade-in">
            <span className="font-medium text-anvi-charcoal">{data[hoveredIndex].date}:</span>
            <span className="text-anvi-maroon font-semibold">Online: {formatCurrency(data[hoveredIndex].online)}</span>
            <span className="text-anvi-gold-dark font-semibold">Store: {formatCurrency(data[hoveredIndex].offline)}</span>
            <span className="text-anvi-charcoal font-bold">Total: {formatCurrency(data[hoveredIndex].total)}</span>
          </div>
        )}
      </div>

      {/* Responsive SVG Container */}
      <div className="relative w-full aspect-[2.6/1] min-h-[220px]">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="maroonGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#800020" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#800020" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#D4AF37" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = height - paddingY - ratio * (height - paddingY * 2);
            return (
              <g key={ratio}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={width - paddingX}
                  y2={y}
                  stroke="#E8E2D9"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
                <text
                  x={paddingX - 6}
                  y={y + 3}
                  textAnchor="end"
                  className="text-[9px] fill-anvi-muted font-mono"
                >
                  {Math.round((maxVal * ratio) / 1000)}k
                </text>
              </g>
            );
          })}

          {/* Shaded Areas */}
          <path d={generateArea('online')} fill="url(#maroonGrad)" />
          <path d={generateArea('offline')} fill="url(#goldGrad)" />

          {/* Lines */}
          <path
            d={generatePath('online')}
            fill="none"
            stroke="#800020"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d={generatePath('offline')}
            fill="none"
            stroke="#D4AF37"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Interactive Data Points */}
          {data.map((point, idx) => {
            const x = getX(idx);
            const yOnline = getY(point.online);
            const yOffline = getY(point.offline);
            const isHovered = hoveredIndex === idx;

            return (
              <g
                key={point.date}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Vertical hover line */}
                {isHovered && (
                  <line
                    x1={x}
                    y1={paddingY}
                    x2={x}
                    y2={height - paddingY}
                    stroke="#2C2825"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                    opacity="0.3"
                  />
                )}

                {/* Online Point */}
                <circle
                  cx={x}
                  cy={yOnline}
                  r={isHovered ? 5 : 3.5}
                  fill="#800020"
                  stroke="#FFFFFF"
                  strokeWidth={2}
                  className="transition-all"
                />

                {/* Offline Point */}
                <circle
                  cx={x}
                  cy={yOffline}
                  r={isHovered ? 4.5 : 3}
                  fill="#D4AF37"
                  stroke="#FFFFFF"
                  strokeWidth={1.5}
                  className="transition-all"
                />

                {/* X-axis date label */}
                <text
                  x={x}
                  y={height - 10}
                  textAnchor="middle"
                  className={`text-[10px] ${isHovered ? 'fill-anvi-charcoal font-semibold' : 'fill-anvi-muted'}`}
                >
                  {point.date}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};
export default RevenueChart;
