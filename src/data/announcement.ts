export interface AnnouncementConfig {
  message: string;
  linkText?: string;
  linkUrl?: string;
  isActive: boolean;
}

/**
 * Single source of truth for the ANVI store-wide announcement.
 * Modify this configuration to update the message across the entire store.
 */
export const announcementConfig: AnnouncementConfig = {
  message: "Complimentary Insured Delivery on all orders across India",
  linkText: "Learn More",
  linkUrl: "/shipping",
  isActive: true,
};
