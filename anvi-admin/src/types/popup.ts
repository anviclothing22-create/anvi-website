export interface PromoPopupConfig {
  id?: string;
  isEnabled?: boolean;
  isActive?: boolean;
  title: string;
  subtitle?: string;
  description?: string;
  discountBadge?: string;
  couponCode?: string;
  imageSrc?: string;
  imageUrl?: string;
  delaySeconds: number;
  showOnExitIntent?: boolean;
  ctaText?: string;
  ctaLink?: string;
}

export type PromoPopup = PromoPopupConfig;
