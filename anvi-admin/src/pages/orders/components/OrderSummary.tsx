import React from 'react';
import { Order } from '@/types/order';
import { formatCurrency } from '@/lib/formatCurrency';
import { PaymentStatusBadge } from './PaymentStatusBadge';

interface OrderSummaryProps {
  order: Order;
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({ order }) => {
  const discountAmount = order.discountAmount ?? order.discount ?? 0;
  const shippingCost = order.shippingCost ?? order.shippingFee ?? 0;
  const taxAmount = order.taxAmount ?? Math.round(order.subtotal * 0.05);
  const totalAmount = order.totalAmount ?? order.total ?? 0;

  return (
    <div className="bg-white rounded-2xl border border-anvi-sand/60 p-5 shadow-luxury-subtle space-y-4">
      <div className="flex items-center justify-between border-b border-anvi-sand/40 pb-3">
        <h4 className="text-xs uppercase tracking-wider font-semibold text-anvi-charcoal">
          Invoice & Settlement Summary
        </h4>
        <PaymentStatusBadge status={order.paymentStatus} />
      </div>

      <div className="space-y-2 text-xs">
        <div className="flex items-center justify-between text-anvi-muted">
          <span>Subtotal</span>
          <span className="font-mono text-anvi-charcoal">{formatCurrency(order.subtotal)}</span>
        </div>

        {discountAmount > 0 && (
          <div className="flex items-center justify-between text-emerald-700">
            <span>Privilege Discount {order.couponCode ? `(${order.couponCode})` : ''}</span>
            <span className="font-mono">- {formatCurrency(discountAmount)}</span>
          </div>
        )}

        <div className="flex items-center justify-between text-anvi-muted">
          <span>Shipping & Insurance</span>
          <span className="font-mono text-anvi-charcoal">
            {shippingCost === 0 ? 'Complimentary' : formatCurrency(shippingCost)}
          </span>
        </div>

        <div className="flex items-center justify-between text-anvi-muted">
          <span>GST (Handloom / Apparel)</span>
          <span className="font-mono text-anvi-charcoal">{formatCurrency(taxAmount)}</span>
        </div>

        <div className="pt-3 border-t border-anvi-sand/40 flex items-center justify-between text-sm font-bold">
          <span className="text-anvi-charcoal font-serif">Total Charged</span>
          <span className="font-serif text-base text-anvi-maroon">
            {formatCurrency(totalAmount)}
          </span>
        </div>

        <div className="pt-2 text-[11px] text-anvi-muted flex items-center justify-between">
          <span>Payment Gateway</span>
          <span className="font-medium text-anvi-charcoal uppercase">{order.paymentMethod}</span>
        </div>
      </div>
    </div>
  );
};
export default OrderSummary;
