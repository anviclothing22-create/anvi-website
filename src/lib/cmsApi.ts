import { getSupabase } from './supabaseClient';
import { heroSlidesData, type HeroSlide } from '../data/hero';
import { announcementConfig, type AnnouncementConfig } from '../data/announcement';
import { journalArticles, type JournalArticle } from '../data/journal';
import { instagramData, type InstagramSectionData } from '../data/instagram';
import { STORAGE_KEYS, getStoredItem, subscribeToStoreUpdates } from './storeSync';

const TTL = 5 * 60 * 1000;
const cache = new Map<string, { at: number; data: unknown }>();
// Single-flight: concurrent mounts (hero + announcement + journal on one page)
// must not fire duplicate identical PostgREST queries.
const cmsInflight = new Map<string, Promise<unknown>>();

function cmsDeduped<T>(key: string, run: () => Promise<T>): Promise<T> {
  const existing = cmsInflight.get(key);
  if (existing) return existing as Promise<T>;
  const p = run().finally(() => {
    if (cmsInflight.get(key) === p) cmsInflight.delete(key);
  });
  cmsInflight.set(key, p);
  return p;
}

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry || Date.now() - entry.at > TTL) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
}

function setCached(key: string, data: unknown): void {
  cache.set(key, { at: Date.now(), data });
}

export function invalidateCmsCache(key?: string): void {
  if (key) cache.delete(key);
  else cache.clear();
}

function inWindow(start: string | null, end: string | null): boolean {
  const now = new Date().toISOString();
  if (start && start > now) return false;
  if (end && end <= now) return false;
  return true;
}

export async function getHeroBanners(): Promise<HeroSlide[]> {
  return cmsDeduped('hero', getHeroBannersUncached);
}

async function getHeroBannersUncached(): Promise<HeroSlide[]> {
  // Check live synchronized store CMS from Admin first
  const stored = getStoredItem<any>(STORAGE_KEYS.CMS, null);
  if (stored?.heroBanners && Array.isArray(stored.heroBanners) && stored.heroBanners.length > 0) {
    return stored.heroBanners.map((b: any, idx: number) => {
      const parts = (b.title || '').trim().split(/\s+/);
      const w1 = b.headlineWord1 || parts[0] || 'HAUTE';
      const w2 = b.headlineWord2 || parts.slice(1).join(' ') || 'COUTURE';
      return {
        id: String(b.id || `hero-${idx}`),
        badge: b.subtitle || b.badge || 'Curated with Care',
        headlineWord1: w1,
        headlineWord2: w2,
        tagline: b.description || b.tagline || '',
        primaryCtaText: b.ctaText || b.primaryCtaText || 'Explore Collection',
        primaryCtaHref: b.ctaLink || b.primaryCtaHref || '/shop',
        secondaryCtaText: b.secondaryCtaText || '',
        secondaryCtaHref: b.secondaryCtaHref || '',
        imageSrc: b.imageUrl || b.imageSrc || '/images/hero/hero_primary.webp',
      };
    });
  }

  const hit = getCached<HeroSlide[]>('hero');
  if (hit) return hit;
  const sb = getSupabase();
  if (!sb) return heroSlidesData;
  try {
    const { data, error } = await sb.from('hero_banners').select('*').eq('is_active', true).order('display_order').limit(10);
    if (error || !data || data.length === 0) throw error ?? new Error('empty');
    const rows = data as Record<string, string | null>[];
    const mapped: HeroSlide[] = rows
      .filter((r) => inWindow((r['starts_at'] as string | null) ?? null, (r['ends_at'] as string | null) ?? null))
      .map((r) => ({
        id: String(r['id']),
        badge: (r['badge'] as string) ?? '',
        headlineWord1: (r['headline_word1'] as string) ?? '',
        headlineWord2: (r['headline_word2'] as string) ?? '',
        tagline: (r['tagline'] as string) ?? '',
        primaryCtaText: (r['primary_cta_text'] as string) ?? 'Shop Now',
        primaryCtaHref: (r['primary_cta_href'] as string) ?? '/shop',
        secondaryCtaText: (r['secondary_cta_text'] as string) ?? '',
        secondaryCtaHref: (r['secondary_cta_href'] as string) ?? '',
        imageSrc: (r['image_url'] as string) ?? '',
      }));
    if (mapped.length === 0) return heroSlidesData;
    setCached('hero', mapped);
    return mapped;
  } catch {
    return heroSlidesData;
  }
}

export async function getAnnouncements(): Promise<AnnouncementConfig> {
  return cmsDeduped('ann', getAnnouncementsUncached);
}

async function getAnnouncementsUncached(): Promise<AnnouncementConfig> {
  // Check live synchronized store CMS from Admin first
  const stored = getStoredItem<any>(STORAGE_KEYS.CMS, null);
  if (stored?.announcements && Array.isArray(stored.announcements) && stored.announcements.length > 0) {
    const activeList = stored.announcements
      .filter((a: any) => a.isActive !== false && (a.text || a.message))
      .map((a: any, idx: number) => ({
        id: String(a.id || `ann-${idx}`),
        message: a.text || a.message,
        linkText: a.linkText || '',
        linkUrl: a.link || a.linkHref || '',
      }));
    if (activeList.length > 0) {
      return {
        message: activeList[0].message,
        linkText: activeList[0].linkText || announcementConfig.linkText,
        linkUrl: activeList[0].linkUrl || announcementConfig.linkUrl,
        isActive: true,
        items: activeList,
      };
    }
  }

  const hit = getCached<AnnouncementConfig>('ann');
  if (hit) return hit;
  const sb = getSupabase();
  if (!sb) return announcementConfig;
  try {
    const { data, error } = await sb.from('announcements').select('*').eq('is_active', true).order('display_order');
    if (error || !data || data.length === 0) throw error ?? new Error('empty');
    const rows = data as Record<string, string | null>[];
    const items = rows
      .map((r, idx) => ({
        id: String(r['id'] || `ann-${idx}`),
        message: (r['message'] as string) || '',
        linkText: (r['link_text'] as string) || '',
        linkUrl: (r['link_href'] as string) || '',
      }))
      .filter((it) => !!it.message);
    const value: AnnouncementConfig = {
      message: items[0]?.message ?? announcementConfig.message,
      linkText: items[0]?.linkText ?? announcementConfig.linkText,
      linkUrl: items[0]?.linkUrl ?? announcementConfig.linkUrl,
      isActive: true,
      items: items.length > 0 ? items : announcementConfig.items,
    };
    setCached('ann', value);
    return value;
  } catch {
    return announcementConfig;
  }
}

export interface BlogPostRow {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  category: JournalArticle['category'];
  excerpt: string;
  content_markdown: string | null;
  content_json: {
    intro?: string;
    paragraphs?: string[];
    pullQuote?: string;
    pullQuoteAuthor?: string;
    takeaways?: string[];
  } | null;
  cover_image_url: string | null;
  author_name: string;
  author_role: string | null;
  author_avatar_url: string | null;
  read_time: string | null;
  issue: string | null;
  published_at: string | null;
  tagged_product_id: string | null;
  // Joined product (via tagged_product_id -> products). Populated when
  // getBlogPosts selects the join; null when no product is tagged.
  tagged_product?: {
    name: string;
    slug: string;
    price_int: number;
    product_images?: { url: string; is_primary: boolean; display_order: number }[];
  } | null;
  // Legacy alias kept for backwards-compat with cached rows.
  tagged_product_legacy?: { name: string; price: number; slug: string; image: string } | null;
}

function toJournalArticle(row: BlogPostRow): JournalArticle {
  const content = row.content_json ?? {};
  const paragraphs =
    content.paragraphs && content.paragraphs.length > 0
      ? content.paragraphs
      : row.content_markdown
        ? [row.content_markdown]
        : [];
  // Prefer joined tagged_product (price_int + primary image). Fall back to legacy cached shape.
  const jp = row.tagged_product;
  const primaryImg =
    jp?.product_images && jp.product_images.length > 0
      ? [...jp.product_images].sort(
          (a, b) => Number(b.is_primary) - Number(a.is_primary) || a.display_order - b.display_order,
        )[0].url
      : '';
  const tagged = jp
    ? {
        name: jp.name,
        price: jp.price_int,
        slug: jp.slug,
        image: primaryImg,
      }
    : (row.tagged_product_legacy ?? undefined);
  return {
    id: String(row.id),
    slug: String(row.slug),
    title: row.title,
    subtitle: row.subtitle ?? '',
    category: row.category,
    readTime: row.read_time ?? '4 min read',
    date: row.published_at
      ? new Date(row.published_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
      : '',
    issue: row.issue ?? '',
    author: { name: row.author_name, role: row.author_role ?? '', avatar: row.author_avatar_url ?? undefined },
    image: row.cover_image_url ?? '',
    alt: row.title,
    excerpt: row.excerpt,
    content: {
      intro: content.intro ?? '',
      paragraphs,
      pullQuote: content.pullQuote,
      pullQuoteAuthor: content.pullQuoteAuthor,
      takeaways: content.takeaways,
    },
    featuredProduct: tagged,
  };
}

export async function getBlogPosts(): Promise<JournalArticle[]> {
  return cmsDeduped('blog', getBlogPostsUncached);
}

async function getBlogPostsUncached(): Promise<JournalArticle[]> {
  const hit = getCached<JournalArticle[]>('blog');
  if (hit) return hit;
  const sb = getSupabase();
  if (!sb) return journalArticles;
  try {
    // Join tagged product so "shop the story" links resolve to real slugs.
    const { data, error } = await sb
      .from('blog_posts')
      .select('*, tagged_product:products!blog_posts_tagged_product_id_fkey(name,slug,price_int,product_images(url,is_primary,display_order))')
      .eq('is_published', true)
      .order('published_at', { ascending: false })
      .limit(20);
    if (error || !data || data.length === 0) throw error ?? new Error('empty');
    const mapped = (data as BlogPostRow[]).map(toJournalArticle);
    setCached('blog', mapped);
    return mapped;
  } catch {
    return journalArticles;
  }
}

export async function getInstagram(): Promise<InstagramSectionData> {
  return cmsDeduped('ig', getInstagramUncached);
}

async function getInstagramUncached(): Promise<InstagramSectionData> {
  const hit = getCached<InstagramSectionData>('ig');
  if (hit) return hit;
  const sb = getSupabase();
  if (!sb) return instagramData;
  try {
    const [cfgRes, postsRes] = await Promise.all([
      sb.from('site_config').select('*').eq('id', 'main').maybeSingle(),
      sb
        .from('instagram_posts')
        .select('*, tagged_product:products!instagram_posts_tagged_product_id_fkey(name,slug,price_int)')
        .eq('is_active', true)
        .order('display_order')
        .limit(6),
    ]);
    if (postsRes.error || !postsRes.data || postsRes.data.length === 0) throw postsRes.error ?? new Error('empty');
    const cfg = (cfgRes.data ?? {}) as Record<string, string>;
    const rows = postsRes.data as Record<string, unknown>[];
    const posts = rows.map((r, idx) => {
      const fallback = instagramData.posts[idx % instagramData.posts.length];
      const tp = r['tagged_product'] as { name?: string; slug?: string; price_int?: number } | null;
      return {
        id: String(r['id'] ?? fallback.id),
        image: (r['image_url'] as string) ?? fallback.image,
        videoUrl: (r['video_url'] as string | null) ?? fallback.videoUrl,
        alt: (r['alt'] as string | null) ?? fallback.alt,
        caption: (r['caption'] as string | null) ?? fallback.caption,
        url: (r['post_url'] as string | null) ?? fallback.url,
        isReel: (r['is_reel'] as boolean | null) ?? fallback.isReel,
        views: (r['views_label'] as string | null) ?? fallback.views,
        likes: (r['likes_label'] as string | null) ?? fallback.likes,
        audio: (r['audio_label'] as string | null) ?? fallback.audio,
        category: ((r['category'] as string) ?? fallback.category) as 'reels' | 'styling' | 'studio',
        taggedProduct: {
          name: tp?.name ?? fallback.taggedProduct.name,
          price: tp?.price_int ?? fallback.taggedProduct.price,
          slug: tp?.slug ?? fallback.taggedProduct.slug,
        },
      };
    });
    const value: InstagramSectionData = {
      ...instagramData,
      handle: cfg['instagram_handle'] ?? instagramData.handle,
      ctaHref: cfg['instagram_cta_href'] ?? instagramData.ctaHref,
      reelsHref: cfg['instagram_cta_href'] ?? instagramData.reelsHref,
      followerCount: cfg['follower_count'] ?? instagramData.followerCount,
      elfsightWidgetId: cfg['elfsight_widget_id'] ?? instagramData.elfsightWidgetId,
      posts,
    };
    setCached('ig', value);
    return value;
  } catch {
    return instagramData;
  }
}

let cmsChannel: ReturnType<NonNullable<ReturnType<typeof getSupabase>>['channel']> | null = null;
const cmsListeners = new Set<() => void>();

export function subscribeCmsInvalidation(cb: () => void): () => void {
  cmsListeners.add(cb);
  const sb = getSupabase();

  if (sb && !cmsChannel) {
    try {
      // Stable channel name: reconnect cycles reuse the same logical channel
      // instead of leaking uniquely-named ones server-side.
      cmsChannel = sb
        .channel('cms-changes-v1')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'hero_banners' }, () => {
          invalidateCmsCache('hero');
          cmsListeners.forEach((fn) => {
            try { fn(); } catch { /* ignore */ }
          });
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'announcements' }, () => {
          invalidateCmsCache('ann');
          cmsListeners.forEach((fn) => {
            try { fn(); } catch { /* ignore */ }
          });
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'blog_posts' }, () => {
          invalidateCmsCache('blog');
          cmsListeners.forEach((fn) => {
            try { fn(); } catch { /* ignore */ }
          });
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'instagram_posts' }, () => {
          invalidateCmsCache('ig');
          cmsListeners.forEach((fn) => {
            try { fn(); } catch { /* ignore */ }
          });
        });

      cmsChannel.subscribe();
    } catch (err) {
      console.warn('[cmsApi] Realtime CMS subscription error (fallback active):', err);
      cmsChannel = null;
    }
  }

  // Cross-port sync with Admin Command (:5174)
  const unsubStoreSync = subscribeToStoreUpdates((event) => {
    if (event.type === 'CMS_UPDATED') {
      invalidateCmsCache();
      cmsListeners.forEach((fn) => {
        try { fn(); } catch { /* ignore */ }
      });
    }
  });

  return () => {
    unsubStoreSync();
    cmsListeners.delete(cb);
    if (cmsListeners.size === 0 && cmsChannel && sb) {
      try {
        void sb.removeChannel(cmsChannel);
      } catch {
        // ignore cleanup error
      }
      cmsChannel = null;
    }
  };
}
