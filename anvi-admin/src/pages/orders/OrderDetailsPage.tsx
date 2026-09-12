import React from 'react';
import { useRoute, useLocation } from 'wouter';
import { ArrowLeft, Printer, AlertCircle } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { OrderCustomer } from './components/OrderCustomer';
import { OrderItems } from './components/OrderItems';
import { OrderSummary } from './components/OrderSummary';
import { ShippingDetails } from './components/ShippingDetails';
import { OrderTimeline } from './components/OrderTimeline';
import { OrderStatusBadge } from './components/OrderStatusBadge';
import { useOrders } from '@/hooks/useOrders';
import { ROUTES } from '@/config/routes';
import { formatDate } from '@/lib/formatDate';

export const OrderDetailsPage: React.FC = () => {
  const [, params] = useRoute('/orders/:id');
  const [, setLocation] = useLocation();
  const { getOrderById, updateOrderStatus, updateShippingDetails } = useOrders();

  const orderId = params?.id;
  const order = orderId ? getOrderById(orderId) : undefined;

  if (!order) {
    return (
      <div className="py-20 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-base font-serif font-bold text-anvi-charcoal">Order Not Found</h3>
        <p className="text-xs text-anvi-muted">The requested order dossier does not exist or was archived.</p>
        <Button size="sm" onClick={() => setLocation(ROUTES.ORDERS)}>
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Orders</span>
        </Button>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const orderDate = order.createdAt || order.orderDate;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back Button */}
      <button
        type="button"
        onClick={() => setLocation(ROUTES.ORDERS)}
        className="inline-flex items-center gap-1.5 text-xs text-anvi-muted hover:text-anvi-charcoal transition-colors font-medium"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to All Orders</span>
      </button>

      <PageHeader
        title={`Order ${order.orderNumber}`}
        subtitle={`Placed on ${formatDate(orderDate)} • Via ${order.paymentMethod.toUpperCase()}`}
        actions={
          <div className="flex items-center gap-3">
            <OrderStatusBadge status={order.orderStatus} />
            <Button variant="outline" size="sm" onClick={handlePrint} className="text-xs">
              <Printer className="w-3.5 h-3.5" />
              <span>Print Invoice</span>
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Order Items & Timeline */}
        <div className="lg:col-span-2 space-y-6">
          <OrderItems items={order.items} />
          <OrderTimeline
            order={order}
            onUpdateStatus={(status) => updateOrderStatus(order.id, status)}
          />
        </div>

        {/* Right 1 Col: Customer, Shipping & Invoice Summary */}
        <div className="space-y-6">
          <OrderSummary order={order} />
          <ShippingDetails
            order={order}
            onUpdateTracking={(carrier, trackingNumber, trackingUrl) =>
              updateShippingDetails(order.id, carrier, trackingNumber, trackingUrl)
            }
          />
          <OrderCustomer order={order} />
        </div>
      </div>
    </div>
  );
};
export default OrderDetailsPage;
