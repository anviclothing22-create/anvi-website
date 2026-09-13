import { useState, useCallback, useEffect } from 'react';
import { initialMockCMS } from '../data/mockCMS';
import type { CMSData } from '../types/cms';
import type { Announcement } from '../types/announcement';
import type { HeroBanner } from '../types/hero';
import type { PromoPopup } from '../types/popup';
import type { BlogPost } from '../types/blog';
import type { StoreAmbience } from '../types/ambience';
import type { AdminReview } from '../types/review';
import { generateId, generateUUID, isUUID } from '../lib/utils';
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

  const reviews: AdminReview[] = (data.reviews || initialMockCMS.reviews || []).map((r: any) => ({
    id: r.id,
    reviewerName: r.reviewerName || r.reviewer_name || r.name || 'ANVI Patron',
    reviewerLocation: r.reviewerLocation || r.reviewer_location || r.location || '',
    rating: Number(r.rating) || 5,
    title: r.title || '',
    body: r.body || r.review || '',
    purchasedProductName: r.purchasedProductName || r.purchased_product_name || r.purchasedProduct || '',
    isVerified: Boolean(r.isVerified ?? r.is_verified ?? true),
    isApproved: Boolean(r.isApproved ?? r.is_approved ?? true),
    helpfulCount: Number(r.helpfulCount ?? r.helpful_count ?? 0),
    createdAt: r.createdAt || r.created_at || new Date().toISOString(),
  }));

  return {
    announcements,
    heroBanners,
    popup,
    blogPosts,
    storeAmbience: ambience,
    elfsightWidgetId: data.elfsightWidgetId || '',
    instagramHandle: data.instagramHandle || 'anviclothing_coimbatore',
    reviews,
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

  // Reviews CRUD
  const addReview = useCallback((rev: Omit<AdminReview, 'id' | 'createdAt'>) => {
    const newId = generateUUID();
    const newRev: AdminReview = {
      ...rev,
      id: newId,
      createdAt: new Date().toISOString(),
    };
    const updated: CMSData = {
      ...cmsData,
      reviews: [newRev, ...cmsData.reviews],
    };
    saveToStorage(updated);
    setStoredItem(STORAGE_KEYS.REVIEWS, updated.reviews, 'REVIEWS_UPDATED');

    try {
      void supabase.from('reviews').insert([{
        id: newId,
        reviewer_name: newRev.reviewerName,
        reviewer_location: newRev.reviewerLocation || null,
        rating: newRev.rating,
        title: newRev.title || null,
        body: newRev.body,
        purchased_product_name: newRev.purchasedProductName || null,
        is_verified: newRev.isVerified,
        is_approved: newRev.isApproved,
      }]).then(({ error }) => {
        if (error) console.error('[useCMS] Supabase review insert error:', error);
      });
    } catch (err) {
      console.warn('[useCMS] Supabase review insert exception:', err);
    }
  }, [cmsData]);

  const updateReview = useCallback((id: string, updates: Partial<AdminReview>) => {
    const updatedReviews = cmsData.reviews.map((r) => (r.id === id ? { ...r, ...updates } : r));
    const updated: CMSData = {
      ...cmsData,
      reviews: updatedReviews,
    };
    saveToStorage(updated);
    setStoredItem(STORAGE_KEYS.REVIEWS, updatedReviews, 'REVIEWS_UPDATED');

    try {
      const row: any = {};
      if (updates.reviewerName !== undefined) row.reviewer_name = updates.reviewerName;
      if (updates.reviewerLocation !== undefined) row.reviewer_location = updates.reviewerLocation;
      if (updates.rating !== undefined) row.rating = updates.rating;
      if (updates.title !== undefined) row.title = updates.title;
      if (updates.body !== undefined) row.body = updates.body;
      if (updates.purchasedProductName !== undefined) row.purchased_product_name = updates.purchasedProductName;
      if (updates.isVerified !== undefined) row.is_verified = updates.isVerified;
      if (updates.isApproved !== undefined) row.is_approved = updates.isApproved;

      void supabase.from('reviews').update(row).eq('id', id).then(({ error }) => {
        if (error) console.error('[useCMS] Supabase review update error:', error);
      });
    } catch (err) {
      console.warn('[useCMS] Supabase review update exception:', err);
    }
  }, [cmsData]);

  const deleteReview = useCallback((id: string) => {
    const updatedReviews = cmsData.reviews.filter((r) => r.id !== id);
    const updated: CMSData = {
      ...cmsData,
      reviews: updatedReviews,
    };
    saveToStorage(updated);
    setStoredItem(STORAGE_KEYS.REVIEWS, updatedReviews, 'REVIEWS_UPDATED');

    try {
      void supabase.from('reviews').delete().eq('id', id).then(({ error }) => {
        if (error) console.error('[useCMS] Supabase review delete error:', error);
      });
    } catch (err) {
      console.warn('[useCMS] Supabase review delete exception:', err);
    }
  }, [cmsData]);

  const toggleReviewApproval = useCallback((id: string) => {
    const target = cmsData.reviews.find((r) => r.id === id);
    if (!target) return;
    updateReview(id, { isApproved: !target.isApproved });
  }, [cmsData.reviews, updateReview]);

  useEffect(() => {
    let cancelled = false;
    async function loadLiveCMS() {
      try {
        const [annRes, heroRes, confRes, revRes] = await Promise.all([
          supabase.from('announcements').select('*').order('display_order'),
          supabase.from('hero_banners').select('*').order('display_order'),
          supabase.from('site_config').select('*').eq('id', 'main').maybeSingle(),
          supabase.from('reviews').select('*').order('created_at', { ascending: false }),
        ]);

        if (!cancelled) {
          setCmsData((prev) => {
            const next = { ...prev };
            if (annRes.data && annRes.data.length > 0) {
              next.announcements = annRes.data.map((a: any) => ({
                id: a.id,
                text: a.message,
                message: a.message,
                link: a.link_href || '',
                linkText: a.link_text || 'Shop Collection',
                isActive: a.is_active ?? true,
                order: a.display_order ?? 1,
                priority: a.display_order ?? 1,
              }));
            }
            if (heroRes.data && heroRes.data.length > 0) {
              next.heroBanners = heroRes.data.map((b: any) => ({
                id: b.id,
                title: `${b.headline_word1 || ''} ${b.headline_word2 || ''}`.trim() || 'ANVI Curation',
                subtitle: b.badge || 'Curated with Care',
                badge: b.badge || 'Curated with Care',
                headlineWord1: b.headline_word1 || 'HAUTE',
                headlineWord2: b.headline_word2 || 'COUTURE',
                description: b.tagline || '',
                tagline: b.tagline || '',
                imageUrl: b.image_url || '/images/hero/hero_primary.webp',
                ctaText: b.primary_cta_text || 'Explore Collection',
                ctaLink: b.primary_cta_href || '/shop',
                order: b.display_order ?? 1,
                isActive: b.is_active ?? true,
              }));
            }
            if (confRes.data?.instagram_handle) {
              next.instagramHandle = confRes.data.instagram_handle;
            }
            if (revRes.data && revRes.data.length > 0) {
              next.reviews = revRes.data.map((r: any) => ({
                id: r.id,
                reviewerName: r.reviewer_name,
                reviewerLocation: r.reviewer_location || '',
                rating: r.rating || 5,
                title: r.title || '',
                body: r.body,
                purchasedProductName: r.purchased_product_name || '',
                isVerified: r.is_verified ?? true,
                isApproved: r.is_approved ?? true,
                helpfulCount: r.helpful_count ?? 0,
                createdAt: r.created_at,
              }));
              setStoredItem(STORAGE_KEYS.REVIEWS, next.reviews, 'REVIEWS_UPDATED');
            }
            setStoredItem(STORAGE_KEYS.CMS, next, 'CMS_UPDATED');
            return next;
          });
        }
      } catch (err) {
        console.warn('[useCMS] Live CMS load error:', err);
      }
    }
    loadLiveCMS();
    return () => {
      cancelled = true;
    };
  }, []);

  const saveChanges = useCallback(() => {
    setStoredItem(STORAGE_KEYS.CMS, cmsData, 'CMS_UPDATED');
    setStoredItem(STORAGE_KEYS.REVIEWS, cmsData.reviews, 'REVIEWS_UPDATED');
    setHasUnsavedChanges(false);

    // Replicate to Supabase
    try {
      if (cmsData.announcements && cmsData.announcements.length > 0) {
        const rows = cmsData.announcements.map((a, idx) => ({
          ...(isUUID(a.id) ? { id: a.id } : {}),
          message: a.text || a.message || '',
          link_text: a.linkText || 'Shop Collection',
          link_href: a.link || a.linkHref || '/shop',
          is_active: a.isActive ?? true,
          display_order: idx + 1,
        }));
        void supabase.from('announcements').upsert(rows).then(({ error }) => {
          if (error) console.error('[useCMS] Supabase announcements upsert error:', error);
        });
      }

      if (cmsData.heroBanners && cmsData.heroBanners.length > 0) {
        const rows = cmsData.heroBanners.map((b, idx) => {
          const parts = (b.title || '').trim().split(/\s+/);
          return {
            ...(isUUID(b.id) ? { id: b.id } : {}),
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
        void supabase.from('hero_banners').upsert(rows).then(({ error }) => {
          if (error) console.error('[useCMS] Supabase hero_banners upsert error:', error);
        });
      }

      if (cmsData.instagramHandle) {
        void supabase.from('site_config').upsert({
          id: 'main',
          instagram_handle: cmsData.instagramHandle,
        }).then(({ error }) => {
          if (error) console.error('[useCMS] Supabase site_config upsert error:', error);
        });
      }

      if (cmsData.reviews && cmsData.reviews.length > 0) {
        const revRows = cmsData.reviews.map((r) => ({
          ...(isUUID(r.id) ? { id: r.id } : {}),
          reviewer_name: r.reviewerName,
          reviewer_location: r.reviewerLocation || null,
          rating: r.rating,
          title: r.title || null,
          body: r.body,
          purchased_product_name: r.purchasedProductName || null,
          is_verified: r.isVerified,
          is_approved: r.isApproved,
        }));
        void supabase.from('reviews').upsert(revRows).then(({ error }) => {
          if (error) console.error('[useCMS] Supabase reviews upsert error:', error);
        });
      }
    } catch (err) {
      console.warn('[useCMS] Supabase CMS save exception:', err);
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
    reviews: cmsData.reviews,
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
    addReview,
    updateReview,
    deleteReview,
    toggleReviewApproval,
    saveChanges,
    discardChanges,
  };
}
