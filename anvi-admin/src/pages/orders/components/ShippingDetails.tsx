import React, { useState } from 'react';
import { Truck, ExternalLink, Edit3, Check } from 'lucide-react';
import { Order } from '@/types/order';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface ShippingDetailsProps {
  order: Order;
  onUpdateTracking?: (carrier: string, trackingNumber: string, trackingUrl?: string) => void;
}

export const ShippingDetails: React.FC<ShippingDetailsProps> = ({
  order,
  onUpdateTracking,
}) => {
  const currentCarrier = order.shippingCarrier || order.courier || 'BlueDart Express';
  const currentTrackingNumber = order.trackingNumber || '';
  const currentTrackingUrl = order.trackingUrl || (order.trackingNumber ? `https://www.bluedart.com/tracking/${order.trackingNumber}` : undefined);

  const [editing, setEditing] = useState(false);
  const [carrier, setCarrier] = useState(currentCarrier);
  const [trackingNumber, setTrackingNumber] = useState(currentTrackingNumber);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateTracking) {
      onUpdateTracking(carrier, trackingNumber, `https://www.bluedart.com/tracking/${trackingNumber}`);
    }
    setEditing(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-anvi-sand/60 p-5 shadow-luxury-subtle space-y-4">
      <div className="flex items-center justify-between border-b border-anvi-sand/40 pb-3">
        <div className="flex items-center gap-2">
          <Truck className="w-4 h-4 text-anvi-maroon" />
          <h4 className="text-xs uppercase tracking-wider font-semibold text-anvi-charcoal">
            Logistics & Courier Dispatch
          </h4>
        </div>
        {!editing && onUpdateTracking && (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-xs text-anvi-maroon hover:underline flex items-center gap-1"
          >
            <Edit3 className="w-3 h-3" />
            <span>Update Tracking</span>
          </button>
        )}
      </div>

      {!editing ? (
        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-anvi-muted">Courier Partner</span>
            <span className="font-semibold text-anvi-charcoal">{currentCarrier}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-anvi-muted">AWB Tracking #</span>
            <span className="font-mono font-bold text-anvi-charcoal">
              {currentTrackingNumber || 'Pending pickup generation'}
            </span>
          </div>

          {currentTrackingUrl && (
            <div className="pt-2">
              <a
                href={currentTrackingUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-anvi-maroon hover:text-anvi-maroon-dark font-medium"
              >
                <span>Track Courier Live</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-3">
          <Input
            value={carrier}
            onChange={(e) => setCarrier(e.target.value)}
            placeholder="Courier Name (e.g. BlueDart)"
            className="text-xs"
            required
          />
          <Input
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            placeholder="Tracking Waybill Number"
            className="text-xs"
            required
          />
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="outline" size="xs" type="button" onClick={() => setEditing(false)}>
              Cancel
            </Button>
            <Button size="xs" type="submit">
              <Check className="w-3 h-3" />
              Save Details
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};
export default ShippingDetails;
