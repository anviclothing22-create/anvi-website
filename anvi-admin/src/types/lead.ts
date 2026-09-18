export type LeadSource =
  | 'Offline Store Walk-in'
  | 'WhatsApp Concierge'
  | 'Website Newsletter'
  | 'Boutique Fitting Appointment'
  | 'walk_in'
  | 'fitting_booking'
  | 'styling_consultation'
  | 'bridal_consultation'
  | 'whatsapp'
  | 'phone_inquiry'
  | 'website';

export type LeadStatus =
  | 'New'
  | 'Contacted'
  | 'Converted'
  | 'Closed'
  | 'new'
  | 'contacted'
  | 'scheduled'
  | 'converted'
  | 'closed';

export interface Lead {
  id: string;
  name?: string;
  fullName?: string;
  email?: string;
  phone: string;
  city?: string;
  source: LeadSource;
  interests?: string[];
  interestCategory?: string;
  notes?: string;
  status: LeadStatus;
  preferredDate?: string;
  createdAt: string;
}
