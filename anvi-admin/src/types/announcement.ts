export interface Announcement {
  id: string;
  text?: string;
  message?: string;
  link?: string;
  linkText?: string;
  linkHref?: string;
  order?: number;
  priority?: number;
  isActive: boolean;
}

export type AnnouncementItem = Announcement;
