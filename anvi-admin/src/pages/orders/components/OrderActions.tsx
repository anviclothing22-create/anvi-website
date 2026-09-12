import React from 'react';
import { Eye, Truck, CheckCircle, XCircle } from 'lucide-react';
import { IconButton } from '@/components/ui/IconButton';
import { Order, OrderStatus } from '@/types/order';

interface OrderActionsProps {
  order: Order;
  onView: () => void;
  onUpdateStatus?: (status: OrderStatus) => void;
}

export const OrderActions: React.FC<OrderActionsProps> = ({
  order,
  onView,
  onUpdateStatus,
}) => {
  return (
    <div className="flex items-center justify-end gap-1">
      <IconButton
        icon={Eye}
        label="View Order Dossier"
        onClick={onView}
        className="text-anvi-muted hover:text-anvi-maroon"
      />
      {onUpdateStatus && order.orderStatus === 'processing' && (
        <IconButton
          icon={Truck}
          label="Mark as Shipped"
          onClick={() => onUpdateStatus('shipped')}
          className="text-anvi-muted hover:text-blue-600"
        />
      )}
      {onUpdateStatus && order.orderStatus === 'shipped' && (
        <IconButton
          icon={CheckCircle}
          label="Mark as Delivered"
          onClick={() => onUpdateStatus('delivered')}
          className="text-anvi-muted hover:text-emerald-600"
        />
      )}
    </div>
  );
};
export default OrderActions;
