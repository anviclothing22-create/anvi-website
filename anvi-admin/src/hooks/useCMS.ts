import { useState, useCallback, useEffect } from 'react';
import { initialMockCMS } from '../data/mockCMS';
import type { CMSData } from '../types/cms';
import type { Announcement } from '../types/announcement';
import type { HeroBanner } from '../types/hero';
import type { PromoPopup } from '../types/popup';
import type { BlogPost } from '../types/blog';
import type { StoreAmbience } from '../types/ambience';
import { generateId } from '../lib/utils';
import { STORAGE_KEYS, getStoredItem, setStoredItem, subscribeToStoreUpdates } from '../lib/storeSync';
import { supabase } from '../lib/supabase';

const normalizeCMS = (data: any): CMSData => {
  const announcements = (data.announcements || []).map((a: any) => ({
    ...a,
    text: a.text || a.message || '',
    message: a.message || a.text || '',
    link: a.link || a.linkHref || '',
    order: a.order ?? a.priority ?? 1,
    priority: a.priority ?? a.order ?? 1,
  }));

  const heroBanners = (data.heroBanners || []).map((b: any) => ({
    ...b,
    title: b.title || `${b.headlineWord1 || ''} ${b.headlineWord2 || ''}`.trim() || 'ANVI Curation',
    subtitle: b.subtitle || b.badge || 'Curated with Care',
    description: b.description || b.tagline || '',
    imageUrl: b.imageUrl || b.imageSrc || '/images/hero/hero_primary.webp',
    ctaText: b.ctaText || b.primaryCtaText || 'Explore Collection',
    ctaLink: b.ctaLink || b.primaryCtaHref || '/shop',
  }));

  const popup = {
    ...data.popup,
    description: data.popup?.description || data.popup?.subtitle || 'Enjoy 10% privilege discount on your first order.',
    imageUrl: data.popup?.imageUrl || data.popup?.imageSrc || '',
    ctaText: data.popup?.ctaText || 'Claim Invitation',
    ctaLink: data.popup?.ctaLink || '/shop',
    isActive: data.popup?.isActive ?? data.popup?.isEnabled ?? true,
  };

  const blogPosts = (data.blogPosts || []).map((p: any) => ({
    ...p,
    publishedAt: p.publishedAt || p.publishedDate || new Date().toISOString(),
    publishedDate: p.publishedDate || p.publishedAt || 'Sep 2026',
    tags: p.tags || ['craftsmanship', 'heritage'],
  }));

  const ambience = {
    ...data.storeAmbience,
    address: data.storeAmbience?.address || `${data.storeAmbience?.addressLine1 || ''}, ${data.storeAmbience?.addressLine2 || ''}, ${data.storeAmbience?.city || ''}`.trim(),
    timings: data.storeAmbience?.timings || data.storeAmbience?.visitingHours || 'Mon – Sat: 10am – 8pm',
    heroImage: data.storeAmbience?.heroImage || data.storeAmbience?.photos?.[0]?.imageUrl || '/images/brand/store_front.webp',
    description: data.storeAmbience?.description || data.storeAmbience?.headline || 'Experience our curated garments in person at Coimbatore.',
    galleryImages: data.storeAmbience?.galleryImages || (data.storeAmbience?.photos || []).map((ph: any) => ({
      id: ph.id,
      url: ph.imageUrl || ph.url,
      caption: ph.caption || ph.title || '',
      order: ph.displayOrder ?? ph.order ?? 1,
    })),
  };

  return {
    announcements,
    heroBanners,
    popup,
    blogPosts,
    storeAmbience: ambience,
    elfsightWidgetId: data.elfsightWidgetId || '',
    instagramHandle: data.instagramHandle || 'anviclothing_coimbatore',
  };
};

export function useCMS() {
  const [cmsData, setCmsData] = useState<CMSData>(() => {
    const raw = getStoredItem<any>(STORAGE_KEYS.CMS, initialMockCMS);
    return normalizeCMS(raw);
  });

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToStoreUpdates((event) => {
      if (event.type === 'CMS_UPDATED') {
        const raw = getStoredItem<any>(STORAGE_KEYS.CMS, initialMockCMS);
        setCmsData(normalizeCMS(raw));
      }
    });
    return unsubscribe;
  }, []);

  const saveToStorage = (updated: CMSData) => {
    setCmsData(updated);
    setStoredItem(STORAGE_KEYS.CMS, updated, 'CMS_UPDATED');
    setHasUnsavedChanges(true);
  };

  // Announcements
  const addAnnouncement = useCallback((ann: Omit<Announcement, 'id'>) => {
    const newItem: Announcement = {
      ...ann,
      id: generateId('ann'),
      text: ann.text || ann.message || '',
      message: ann.message || ann.text || '',
    };
    const updated: CMSData = {
      ...cmsData,
      announcements: [newItem, ...cmsData.announcements],
    };
    saveToStorage(updated);
  }, [cmsData]);

  const updateAnnouncement = useCallback((id: string, data: Partial<Announcement>) => {
    const updated: CMSData = {
      ...cmsData,
      announcements: cmsData.announcements.map((a) =>
        a.id === id ? { ...a, ...data } : a
      ),
    };
    saveToStorage(updated);
  }, [cmsData]);

  const deleteAnnouncement = useCallback((id: string) => {
    const updated: CMSData = {
      ...cmsData,
      announcements: cmsData.announcements.filter((a) => a.id !== id),
    };
    saveToStorage(updated);
  }, [cmsData]);

  // Hero Banners
  const addHeroBanner = useCallback((banner: Omit<HeroBanner, 'id'>) => {
    const newBanner: HeroBanner = {
      ...banner,
      id: generateId('hero'),
    };
    const updated: CMSData = {
      ...cmsData,
      heroBanners: [...cmsData.heroBanners, newBanner],
    };
    saveToStorage(updated);
  }, [cmsData]);

  const updateHeroBanner = useCallback((id: string, data: Partial<HeroBanner>) => {
    const updated: CMSData = {
      ...cmsData,
      heroBanners: cmsData.heroBanners.map((b) =>
        b.id === id ? { ...b, ...data } : b
      ),
    };
    saveToStorage(updated);
  }, [cmsData]);

  const deleteHeroBanner = useCallback((id: string) => {
    const updated: CMSData = {
      ...cmsData,
      heroBanners: cmsData.heroBanners.filter((b) => b.id !== id),
    };
    saveToStorage(updated);
  }, [cmsData]);

  // Popup Config
  const updatePopup = useCallback((config: Partial<PromoPopup>) => {
    const updated: CMSData = {
      ...cmsData,
      popup: { ...cmsData.popup, ...config },
    };
    saveToStorage(updated);
  }, [cmsData]);

  // Blog Posts
  const addBlogPost = useCallback((post: Omit<BlogPost, 'id'>) => {
    const newPost: BlogPost = {
      ...post,
      id: generateId('post'),
      publishedAt: post.publishedAt || new Date().toISOString(),
    };
    const updated: CMSData = {
      ...cmsData,
      blogPosts: [newPost, ...cmsData.blogPosts],
    };
    saveToStorage(updated);
  }, [cmsData]);

  const updateBlogPost = useCallback((id: string, data: Partial<BlogPost>) => {
    const updated: CMSData = {
      ...cmsData,
      blogPosts: cmsData.blogPosts.map((p) =>
        p.id === id ? { ...p, ...data } : p
      ),
    };
    saveToStorage(updated);
  }, [cmsData]);

  const deleteBlogPost = useCallback((id: string) => {
    const updated: CMSData = {
      ...cmsData,
      blogPosts: cmsData.blogPosts.filter((p) => p.id !== id),
    };
    saveToStorage(updated);
  }, [cmsData]);

  // Ambience
  const updateAmbience = useCallback((config: Partial<StoreAmbience>) => {
    const updated: CMSData = {
      ...cmsData,
      storeAmbience: { ...cmsData.storeAmbience, ...config },
    };
    saveToStorage(updated);
  }, [cmsData]);

  // Instagram & Elfsight
  const updateElfsightConfig = useCallback((widgetId: string, handle?: string) => {
    const updated: CMSData = {
      ...cmsData,
      elfsightWidgetId: widgetId.trim(),
      instagramHandle: handle || cmsData.instagramHandle || 'anviclothing_coimbatore',
    };
    saveToStorage(updated);
  }, [cmsData]);

  const saveChanges = useCallback(() => {
    setStoredItem(STORAGE_KEYS.CMS, cmsData, 'CMS_UPDATED');
    setHasUnsavedChanges(false);

    // Replicate to Supabase
    try {
      if (cmsData.announcements && cmsData.announcements.length > 0) {
        const rows = cmsData.announcements.map((a, idx) => ({
          id: a.id,
          message: a.text || a.message || '',
          link_text: a.linkText || 'Shop Collection',
          link_href: a.link || a.linkHref || '/shop',
          is_active: a.isActive ?? true,
          display_order: idx + 1,
        }));
        void supabase.from('announcements').upsert(rows);
      }

      if (cmsData.heroBanners && cmsData.heroBanners.length > 0) {
        const rows = cmsData.heroBanners.map((b, idx) => {
          const parts = (b.title || '').trim().split(/\s+/);
          return {
            id: b.id,
            badge: b.subtitle || b.badge || '',
            headline_word1: b.headlineWord1 || parts[0] || 'HAUTE',
            headline_word2: b.headlineWord2 || parts.slice(1).join(' ') || 'COUTURE',
            tagline: b.description || b.tagline || '',
            primary_cta_text: b.ctaText || b.primaryCtaText || 'Explore Collection',
            primary_cta_href: b.ctaLink || b.primaryCtaHref || '/shop',
            image_url: b.imageUrl || b.imageSrc || '',
            display_order: idx + 1,
            is_active: true,
          };
        });
        void supabase.from('hero_banners').upsert(rows);
      }

      if (cmsData.instagramHandle) {
        void supabase.from('site_config').upsert({
          id: 'main',
          instagram_handle: cmsData.instagramHandle,
        });
      }
    } catch {
      // offline/fallback handled by storeSync
    }
  }, [cmsData]);

  const discardChanges = useCallback(() => {
    const raw = getStoredItem<any>(STORAGE_KEYS.CMS, initialMockCMS);
    setCmsData(normalizeCMS(raw));
    setHasUnsavedChanges(false);
  }, []);

  return {
    cmsData,
    announcements: cmsData.announcements,
    heroBanners: cmsData.heroBanners,
    promoPopup: cmsData.popup,
    blogPosts: cmsData.blogPosts,
    storeAmbience: cmsData.storeAmbience,
    elfsightWidgetId: cmsData.elfsightWidgetId || '',
    instagramHandle: cmsData.instagramHandle || 'anviclothing_coimbatore',
    hasUnsavedChanges,
    setHasUnsavedChanges,
    addAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    addHeroBanner,
    updateHeroBanner,
    deleteHeroBanner,
    updatePopup,
    addBlogPost,
    updateBlogPost,
    deleteBlogPost,
    updateAmbience,
    updateElfsightConfig,
    saveChanges,
    discardChanges,
  };
}
