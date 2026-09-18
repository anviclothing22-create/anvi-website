import React from 'react';
import { Users } from 'lucide-react';

export const LeadsEmptyState: React.FC = () => {
  return (
    <div className="py-16 text-center space-y-4 max-w-sm mx-auto">
      <div className="w-14 h-14 rounded-2xl bg-anvi-linen border border-anvi-sand flex items-center justify-center mx-auto text-anvi-muted">
        <Users className="w-7 h-7" />
      </div>
      <div className="space-y-1">
        <h3 className="text-base font-serif font-bold text-anvi-charcoal">
          No styling inquiries logged
        </h3>
        <p className="text-xs text-anvi-muted leading-relaxed">
          Walk-in patrons, WhatsApp consultations, and styling appointment bookings will appear here.
        </p>
      </div>
    </div>
  );
};
export default LeadsEmptyState;
