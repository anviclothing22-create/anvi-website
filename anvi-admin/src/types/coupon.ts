export interface Coupon {
  id: string;
  code: string;
  type?: 'percentage' | 'fixed';
  discountType?: 'percentage' | 'fixed';
  value?: number;
  discountValue?: number;
  minSpend?: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  maxDiscountAmount?: number;
  usageCount?: number;
  usedCount?: number;
  usageLimit?: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  applicableCategory?: string;
  description?: string;
}

export type CouponFormData = {
  code: string;
  type?: 'percentage' | 'fixed';
  discountType?: 'percentage' | 'fixed';
  value?: number;
  discountValue?: number;
  minSpend?: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  applicableCategory?: string;
  description?: string;
};
