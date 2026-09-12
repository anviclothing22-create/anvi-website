import React from 'react';
import { OrderStatus } from '@/types/order';

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

export const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({ status }) => {
  const getBadgeStyle = () => {
    switch (status) {
      case 'delivered':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'shipped':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'processing':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'confirmed':
        return 'bg-indigo-50 text-indigo-800 border-indigo-200';
      case 'cancelled':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      case 'refunded':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'pending':
      default:
        return 'bg-stone-100 text-stone-700 border-stone-200';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border capitalize ${getBadgeStyle()}`}
    >
      {status}
    </span>
  );
};
export default OrderStatusBadge;
