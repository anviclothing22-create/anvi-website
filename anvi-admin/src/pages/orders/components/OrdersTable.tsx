import React from 'react';
import { Order, OrderStatus } from '@/types/order';
import { OrderTableRow } from './OrderTableRow';

interface OrdersTableProps {
  orders: Order[];
  onView: (id: string) => void;
  onUpdateStatus: (id: string, status: OrderStatus) => void;
}

export const OrdersTable: React.FC<OrdersTableProps> = ({
  orders,
  onView,
  onUpdateStatus,
}) => {
  if (orders.length === 0) {
    return (
      <div className="py-16 text-center text-xs text-anvi-muted">
        No client orders found matching the filter criteria.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-anvi-sand/60 shadow-luxury-subtle overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-anvi-linen/50 border-b border-anvi-sand/60 text-[11px] font-sans font-semibold uppercase tracking-wider text-anvi-muted">
            <tr>
              <th className="py-3.5 px-4 text-left">Order & Date</th>
              <th className="py-3.5 px-4 text-left">Customer & Destination</th>
              <th className="py-3.5 px-4 text-left">Purchased Ensembles</th>
              <th className="py-3.5 px-4 text-left">Total & Settlement</th>
              <th className="py-3.5 px-4 text-left">Fulfillment Status</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-anvi-sand/20">
            {orders.map((order) => (
              <OrderTableRow
                key={order.id}
                order={order}
                onView={onView}
                onUpdateStatus={onUpdateStatus}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default OrdersTable;
