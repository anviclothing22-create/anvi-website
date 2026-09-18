import React from 'react';
import { Eye, Truck, CheckCircle } from 'lucide-react';
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
  const normalized = (order.orderStatus || '').toLowerCase().replace(/[\s_-]+/g, '_');
  const canDispatch = Boolean(onUpdateStatus && (normalized === 'in_studio_preparation' || normalized === 'processing' || normalized === 'confirmed' || normalized === 'pending'));
  const canDeliver = Boolean(onUpdateStatus && (normalized === 'dispatched' || normalized === 'shipped'));

  return (
    <div className="flex items-center justify-end gap-1">
      <IconButton
        icon={Eye}
        label="View Order Dossier"
        onClick={onView}
        className="text-anvi-muted hover:text-anvi-maroon"
      />
      {canDispatch && (
        <IconButton
          icon={Truck}
          label="Mark as Dispatched"
          onClick={() => onUpdateStatus!('dispatched')}
          className="text-anvi-muted hover:text-blue-600"
        />
      )}
      {canDeliver && (
        <IconButton
          icon={CheckCircle}
          label="Mark as Delivered"
          onClick={() => onUpdateStatus!('delivered')}
          className="text-anvi-muted hover:text-emerald-600"
        />
      )}
    </div>
  );
};
export default OrderActions;
