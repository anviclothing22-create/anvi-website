import React from 'react';
import { Order, OrderStatus } from '@/types/order';
import { formatCurrency } from '@/lib/formatCurrency';
import { formatDate } from '@/lib/formatDate';
import { OrderStatusBadge } from './OrderStatusBadge';
import { PaymentStatusBadge } from './PaymentStatusBadge';
import { OrderActions } from './OrderActions';

interface OrderTableRowProps {
  order: Order;
  onView: (id: string) => void;
  onUpdateStatus: (id: string, status: OrderStatus) => void;
}

export const OrderTableRow: React.FC<OrderTableRowProps> = ({
  order,
  onView,
  onUpdateStatus,
}) => {
  const customerName = order.shippingAddress?.fullName || order.customer.name;
  const customerCity = order.shippingAddress?.city || order.customer.city;
  const customerState = order.shippingAddress?.state || order.customer.state;
  const customerEmail = order.customerEmail || order.customer.email;
  const orderDate = order.createdAt || order.orderDate;
  const total = order.totalAmount ?? order.total ?? 0;

  return (
    <tr className="border-b border-anvi-sand/30 hover:bg-anvi-linen/30 transition-colors group">
      {/* Order Number & Date */}
      <td className="py-3.5 px-4">
        <button
          type="button"
          onClick={() => onView(order.id)}
          className="text-left group-hover:text-anvi-maroon transition-colors"
        >
          <span className="font-mono font-bold text-xs text-anvi-charcoal block">
            {order.orderNumber}
          </span>
          <span className="text-[11px] text-anvi-muted">
            {formatDate(orderDate)}
          </span>
        </button>
      </td>

      {/* Customer Info */}
      <td className="py-3.5 px-4">
        <div className="space-y-0.5">
          <p className="font-serif font-bold text-xs text-anvi-charcoal">
            {customerName}
          </p>
          <p className="text-[11px] text-anvi-muted">
            {customerCity}, {customerState}
          </p>
          <p className="text-[10px] text-anvi-muted font-mono">{customerEmail}</p>
        </div>
      </td>

      {/* Items Summary */}
      <td className="py-3.5 px-4">
        <div className="text-xs space-y-1">
          <span className="font-medium text-anvi-charcoal">
            {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
          </span>
          <div className="text-[11px] text-anvi-muted line-clamp-1 max-w-xs">
            {order.items.map((it) => it.productName || it.name).join(', ')}
          </div>
        </div>
      </td>

      {/* Total Amount */}
      <td className="py-3.5 px-4">
        <div className="text-xs">
          <span className="font-serif font-bold text-anvi-charcoal">
            {formatCurrency(total)}
          </span>
          <div className="pt-0.5">
            <PaymentStatusBadge status={order.paymentStatus} />
          </div>
        </div>
      </td>

      {/* Order Status */}
      <td className="py-3.5 px-4">
        <OrderStatusBadge status={order.orderStatus} />
      </td>

      {/* Actions */}
      <td className="py-3.5 px-4 text-right">
        <OrderActions
          order={order}
          onView={() => onView(order.id)}
          onUpdateStatus={(st) => onUpdateStatus(order.id, st)}
        />
      </td>
    </tr>
  );
};
export default OrderTableRow;
