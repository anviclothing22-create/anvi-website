import React from 'react';
import { OrderItem } from '@/types/order';
import { formatCurrency } from '@/lib/formatCurrency';
import { ImagePreview } from '@/components/shared/ImagePreview';

interface OrderItemsProps {
  items: OrderItem[];
}

export const OrderItems: React.FC<OrderItemsProps> = ({ items }) => {
  return (
    <div className="bg-white rounded-2xl border border-anvi-sand/60 p-5 shadow-luxury-subtle space-y-4">
      <div className="flex items-center justify-between border-b border-anvi-sand/40 pb-3">
        <h4 className="text-xs uppercase tracking-wider font-semibold text-anvi-charcoal">
          Ordered Garments ({items.length})
        </h4>
      </div>

      <div className="divide-y divide-anvi-sand/20">
        {items.map((item) => {
          const name = item.productName || item.name;
          const image = item.productImage || item.image || '/assets/brand/anvi-logo.svg';
          const unitPrice = item.unitPrice ?? item.price ?? 0;
          const totalPrice = item.totalPrice ?? (unitPrice * item.quantity);
          const size = item.selectedSize || item.size;

          return (
            <div key={item.id} className="py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-14 rounded-lg overflow-hidden border border-anvi-sand/50 bg-stone-50 shrink-0">
                  <ImagePreview
                    src={image}
                    alt={name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-0.5 text-xs">
                  <p className="font-serif font-bold text-anvi-charcoal">{name}</p>
                  <p className="text-[11px] font-mono text-anvi-muted">SKU: {item.sku || 'ANVI-BESPOKE'}</p>
                  <div className="flex items-center gap-2 text-[11px] text-anvi-muted">
                    {size && <span>Size: {size}</span>}
                    {item.selectedColor && <span>• Color: {item.selectedColor}</span>}
                    <span>• Qty: {item.quantity}</span>
                  </div>
                </div>
              </div>

              <div className="text-right text-xs">
                <p className="font-serif font-bold text-anvi-charcoal">
                  {formatCurrency(totalPrice)}
                </p>
                <p className="text-[10px] text-anvi-muted">
                  {formatCurrency(unitPrice)} each
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default OrderItems;
