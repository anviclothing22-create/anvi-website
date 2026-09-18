import React from 'react';
import { LeadSource } from '@/types/lead';

interface LeadSourceBadgeProps {
  source: LeadSource;
}

export const LeadSourceBadge: React.FC<LeadSourceBadgeProps> = ({ source }) => {
  const getStyle = () => {
    switch (source) {
      case 'walk_in':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'fitting_booking':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'styling_consultation':
      case 'bridal_consultation':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      case 'whatsapp':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'phone_inquiry':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'website':
        return 'bg-amber-50 text-amber-900 border-amber-300';
      default:
        return 'bg-stone-100 text-stone-700 border-stone-200';
    }
  };

  const getLabel = () => {
    switch (source) {
      case 'walk_in':
        return 'Store Walk-In';
      case 'fitting_booking':
        return 'Fitting Session';
      case 'styling_consultation':
      case 'bridal_consultation':
        return 'Styling Consultation';
      case 'whatsapp':
        return 'WhatsApp';
      case 'phone_inquiry':
        return 'Phone Inquiry';
      case 'website':
        return 'Website Privilege';
      default:
        return 'Online Form';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getStyle()}`}
    >
      {getLabel()}
    </span>
  );
};
export default LeadSourceBadge;
