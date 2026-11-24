export interface AnnouncementItemConfig {
  id?: string;
  message: string;
  linkText?: string;
  linkUrl?: string;
}

export interface AnnouncementConfig {
  message: string;
  linkText?: string;
  linkUrl?: string;
  isActive: boolean;
  items?: AnnouncementItemConfig[];
  speed?: number;
}

/**
 * Single source of truth for the ANVI store-wide announcement.
 * Supports single message or multi-message continuous running bar (marquee).
 */
export const announcementConfig: AnnouncementConfig = {
  message: "Complimentary Insured Delivery on all orders across India",
  linkText: "Learn More",
  linkUrl: "/shipping",
  isActive: true,
  items: [
    {
      id: "ann-1",
      message: "Complimentary Insured Delivery on all orders across India",
      linkText: "Learn More",
      linkUrl: "/shipping",
    },
    {
      id: "ann-2",
      message: "Handpicked Pure Silk & Festive Saree Collections by Nivetha",
      linkText: "Explore Collection",
      linkUrl: "/shop",
    },
    {
      id: "ann-3",
      message: "Visit Our Coimbatore Boutique Store in Tatabad",
      linkText: "Store Details",
      linkUrl: "/contact",
    },
    {
      id: "ann-4",
      message: "New Festive & Everyday Arrivals Now Available",
      linkText: "Shop New",
      linkUrl: "/collections",
    },
  ],
};
