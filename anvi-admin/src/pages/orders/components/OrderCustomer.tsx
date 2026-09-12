import React from 'react';
import { User, Mail, Phone, MapPin } from 'lucide-react';
import { Order } from '@/types/order';

interface OrderCustomerProps {
  order: Order;
}

export const OrderCustomer: React.FC<OrderCustomerProps> = ({ order }) => {
  const addr = order.shippingAddress || {
    fullName: order.customer.name,
    phoneNumber: order.customer.phone,
    addressLine1: order.customer.street,
    addressLine2: '',
    city: order.customer.city,
    state: order.customer.state,
    postalCode: order.customer.pincode,
    country: 'India',
  };

  const email = order.customerEmail || order.customer.email;

  return (
    <div className="bg-white rounded-2xl border border-anvi-sand/60 p-5 shadow-luxury-subtle space-y-4">
      <div className="flex items-center gap-2 border-b border-anvi-sand/40 pb-3">
        <User className="w-4 h-4 text-anvi-maroon" />
        <h4 className="text-xs uppercase tracking-wider font-semibold text-anvi-charcoal">
          Customer Profile & Contact
        </h4>
      </div>

      <div className="space-y-3 text-xs">
        <div>
          <span className="text-anvi-muted block text-[11px]">Recipient Name</span>
          <p className="font-serif font-bold text-sm text-anvi-charcoal">{addr.fullName}</p>
        </div>

        <div className="flex items-center gap-2 text-anvi-charcoal">
          <Mail className="w-3.5 h-3.5 text-anvi-muted" />
          <a href={`mailto:${email}`} className="hover:text-anvi-maroon underline font-mono text-[11px]">
            {email}
          </a>
        </div>

        <div className="flex items-center gap-2 text-anvi-charcoal">
          <Phone className="w-3.5 h-3.5 text-anvi-muted" />
          <a href={`tel:${addr.phoneNumber}`} className="hover:text-anvi-maroon font-mono text-[11px]">
            {addr.phoneNumber}
          </a>
        </div>

        <div className="pt-2 border-t border-anvi-sand/30">
          <div className="flex items-start gap-2 text-anvi-charcoal">
            <MapPin className="w-3.5 h-3.5 text-anvi-muted shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed text-anvi-muted">
              {addr.addressLine1}
              {addr.addressLine2 ? `, ${addr.addressLine2}` : ''}
              <br />
              {addr.city}, {addr.state} - <span className="font-mono font-medium text-anvi-charcoal">{addr.postalCode}</span>
              <br />
              {addr.country}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default OrderCustomer;
