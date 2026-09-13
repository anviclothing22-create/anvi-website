import type { AnnouncementItem } from './announcement';
import type { HeroBanner } from './hero';
import type { PromoPopupConfig } from './popup';
import type { BlogPost } from './blog';
import type { StoreAmbienceConfig } from './ambience';
import type { AdminReview } from './review';

export interface CMSData {
  announcements: AnnouncementItem[];
  heroBanners: HeroBanner[];
  popup: PromoPopupConfig;
  blogPosts: BlogPost[];
  storeAmbience: StoreAmbienceConfig;
  elfsightWidgetId?: string;
  instagramHandle?: string;
  reviews: AdminReview[];
}
