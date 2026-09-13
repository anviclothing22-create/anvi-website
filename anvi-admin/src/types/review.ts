export interface AdminReview {
  id: string;
  reviewerName: string;
  reviewerLocation?: string;
  rating: number;
  title?: string;
  body: string;
  purchasedProductName?: string;
  isVerified: boolean;
  isApproved: boolean;
  helpfulCount?: number;
  createdAt?: string;
}
