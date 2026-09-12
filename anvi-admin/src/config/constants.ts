export const APP_CONFIG = {
  name: 'ANVI Command',
  subtitle: 'Boutique & Store Operations',
  curatorName: 'Nivetha',
  curatorRole: 'Founder & Curator',
  location: 'Coimbatore, Tamil Nadu',
  // Production storefront URL — set VITE_APP_URL in hosting env. Falls back to local dev.
  liveStoreUrl:
    (import.meta.env.VITE_APP_URL as string | undefined)?.replace(/\/$/, '') || 'http://localhost:5173',
  supportEmail: 'anviclothing22@gmail.com',
  supportPhone: '+91 99948 37459',
};

export const OCCASIONS = [
  { slug: 'everyday', name: 'Everyday Luxury' },
  { slug: 'office', name: 'Workwear & Office' },
  { slug: 'festive', name: 'Festive Celebrations' },
  { slug: 'wedding', name: 'Weddings & Reception' },
] as const;

export const COLLECTIONS = [
  { slug: 'new-arrivals', name: 'New Seasonal Arrivals' },
  { slug: 'bestsellers', name: 'Patron Bestsellers' },
  { slug: 'anvi-edit', name: 'The ANVI Signature Edit' },
  { slug: 'heirloom', name: 'Heirloom Handlooms' },
  { slug: 'festive-edit', name: 'Festive Splendour' },
] as const;

export const AVAILABLE_SIZES = ['Free Size', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '2-3Y', '4-5Y', '6-7Y', '8-9Y'];
