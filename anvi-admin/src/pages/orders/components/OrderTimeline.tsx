import React from 'react';
import { CheckCircle2, Clock } from 'lucide-react';
import { Order, OrderStatus } from '@/types/order';

interface OrderTimelineProps {
  order: Order;
  onUpdateStatus: (status: OrderStatus) => void;
}

export const OrderTimeline: React.FC<OrderTimelineProps> = ({ order, onUpdateStatus }) => {
  const steps = [
    { key: 'pending', label: 'Order Received', desc: 'Client placed order online' },
    { key: 'confirmed', label: 'Payment Confirmed', desc: 'Funds cleared gateway' },
    { key: 'in_studio_preparation', label: 'Quality Check & Packing', desc: 'Garment inspected at boutique' },
    { key: 'dispatched', label: 'Handed to Courier', desc: 'AWB generated with partner' },
    { key: 'delivered', label: 'Delivered to Patron', desc: 'Package signed for' },
  ];

  const normalizedStatus = (order.orderStatus || '').toLowerCase().replace(/[\s_-]+/g, '_');
  const currentIdx = steps.findIndex(
    (s) =>
      s.key === normalizedStatus ||
      (normalizedStatus === 'processing' && s.key === 'in_studio_preparation') ||
      (normalizedStatus === 'shipped' && s.key === 'dispatched')
  );

  return (
    <div className="bg-white rounded-2xl border border-anvi-sand/60 p-5 shadow-luxury-subtle space-y-4">
      <div className="flex items-center justify-between border-b border-anvi-sand/40 pb-3">
        <h4 className="text-xs uppercase tracking-wider font-semibold text-anvi-charcoal">
          Fulfillment Lifecycle
        </h4>
        <span className="text-xs text-anvi-muted">
          Current State: <strong className="capitalize text-anvi-maroon">{order.orderStatus}</strong>
        </span>
      </div>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-anvi-sand/60">
        {steps.map((step, idx) => {
          const isDone = currentIdx >= idx && !normalizedStatus.includes('cancel');
          const isCurrent = currentIdx === idx;

          return (
            <div key={step.key} className="relative flex items-start justify-between gap-4">
              {/* Dot */}
              <div
                className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-xs transition-all ${
                  isDone
                    ? 'bg-anvi-maroon text-white ring-4 ring-anvi-maroon/20'
                    : 'bg-white border-2 border-anvi-sand text-anvi-muted'
                }`}
              >
                {isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3 h-3" />}
              </div>

              <div className="space-y-0.5 text-xs">
                <p className={`font-semibold ${isDone ? 'text-anvi-charcoal' : 'text-anvi-muted'}`}>
                  {step.label}
                </p>
                <p className="text-[11px] text-anvi-muted">{step.desc}</p>
              </div>

              {/* Status transition button */}
              {isCurrent && idx < steps.length - 1 && !normalizedStatus.includes('cancel') && (
                <button
                  type="button"
                  onClick={() => onUpdateStatus(steps[idx + 1].key as OrderStatus)}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-anvi-maroon text-white hover:bg-anvi-maroon-dark transition-all shadow-sm shrink-0"
                >
                  Advance to {steps[idx + 1].label}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default OrderTimeline;
