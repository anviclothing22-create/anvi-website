import React from 'react';
import { PaymentStatus } from '@/types/order';

interface PaymentStatusBadgeProps {
  status: PaymentStatus;
}

export const PaymentStatusBadge: React.FC<PaymentStatusBadgeProps> = ({ status }) => {
  const norm = (status || 'Pending').toLowerCase();

  const getBadgeStyle = () => {
    switch (norm) {
      case 'paid':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'refunded':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'failed':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      case 'pending':
      default:
        return 'bg-amber-50 text-amber-800 border-amber-200';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border uppercase tracking-wider ${getBadgeStyle()}`}
    >
      {status}
    </span>
  );
};
export default PaymentStatusBadge;
