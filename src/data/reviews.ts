/**
 * ANVI CLOTHING — CUSTOMER REVIEWS DATA
 * Heading: LOVED BY WOMEN LIKE YOU.
 * Authentic customer experiences from the ANVI community.
 */

export interface CustomerReview {
  id: string;
  name: string;
  location?: string;
  rating: number;
  review: string;
  purchasedProduct?: string;
  verified: boolean;
  date?: string;
}

export interface ReviewSummary {
  rating: number;
  maxRating: number;
  totalReviews: number;
  recommendationPercentage: number;
}

export const reviewSummaryData: ReviewSummary = {
  rating: 4.9,
  maxRating: 5,
  totalReviews: 1280,
  recommendationPercentage: 98,
};

export const customerReviewsData: CustomerReview[] = [
  {
    id: 'review-1',
    name: 'Dr. Radhika Menon',
    location: 'Coimbatore, Tamil Nadu',
    rating: 5,
    review:
      'The drape is extraordinary. Finding sarees that feel this breathable in our South Indian climate while looking effortlessly regal for evening gatherings is rare. You can genuinely feel the authenticity of the handloom weave.',
    purchasedProduct: 'Handwoven Ajrakh Chanderi Saree',
    verified: true,
    date: 'August 2026',
  },
  {
    id: 'review-2',
    name: 'Pooja Sundaram',
    location: 'Bengaluru, Karnataka',
    rating: 5,
    review:
      'Wore the Indigo co-ord set to a gallery preview and received countless compliments. Structured enough for creative meetings, yet feels as soft as second skin. The unboxing experience felt like receiving a gift from an old friend.',
    purchasedProduct: 'Indigo Handloom Co-ord Set',
    verified: true,
    date: 'July 2026',
  },
  {
    id: 'review-3',
    name: 'Ananya Krishnan',
    location: 'Chennai, Tamil Nadu',
    rating: 5,
    review:
      'The antique gold zari has a quiet, dignified luster — not gaudy or overly glossy like commercial silks. My grandmother touched the pallu and immediately commended the weight and finishing.',
    purchasedProduct: 'Festive Kanjeevaram Silk Saree',
    verified: true,
    date: 'August 2026',
  },
  {
    id: 'review-4',
    name: 'Meera Varadarajan',
    location: 'Hyderabad, Telangana',
    rating: 5,
    review:
      'ANVI understands tailoring for real Indian women. The salwar falls gracefully without requiring endless boutique alterations. It has easily become my most cherished outfit for festive family dinners.',
    purchasedProduct: 'Bagru Printed Cotton Salwar Set',
    verified: true,
    date: 'June 2026',
  },
];
