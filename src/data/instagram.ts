/**
 * ANVI CLOTHING — INSTAGRAM DATA
 * Heading: @ANVICLOTHING
 * Supporting text: "A glimpse into the ANVI world."
 * Editorial portrait reels and posts showcasing couture drapes, craft provenance & studio life.
 */

export interface InstagramTaggedProduct {
  name: string;
  price: number;
  slug: string;
}

export interface InstagramPost {
  id: string;
  image: string;
  videoUrl?: string;
  alt: string;
  caption: string;
  url: string;
  isReel: boolean;
  views?: string;
  likes: string;
  audio: string;
  category: 'reels' | 'styling' | 'studio';
  taggedProduct: InstagramTaggedProduct;
}

export interface InstagramSectionData {
  handle: string;
  heading: string;
  subtext: string;
  followerCount: string;
  ctaText: string;
  ctaHref: string;
  reelsHref: string;
  /**
   * Elfsight Widget ID for live Instagram Reels stream from @anviclothing_coimbatore
   * Example: "e38a29b4-b631-419b-b605-e4142fbb1c28" or "elfsight-app-e38a29b4-..."
   * When populated, InstagramGrid automatically embeds your live Elfsight Reels widget!
   */
  elfsightWidgetId?: string;
  posts: InstagramPost[];
}

export const instagramData: InstagramSectionData = {
  handle: '@anviclothing_coimbatore',
  heading: '@ANVICLOTHING_COIMBATORE',
  subtext: 'Salwars · Sarees · Handlooms · Kids · Coimbatore',
  followerCount: '1.7K',
  ctaText: 'WATCH REELS ON @ANVICLOTHING_COIMBATORE',
  ctaHref: 'https://www.instagram.com/anviclothing_coimbatore/',
  reelsHref: 'https://www.instagram.com/anviclothing_coimbatore/reels/',
  elfsightWidgetId: '62af4cfa-a7a6-4f8b-8d97-06bc3d84aa54',
  posts: [
    {
      id: 'post-1',
      image: '/images/instagram/insta_1.jpg',
      videoUrl: '/videos/reels/weaving_swarnachari.webm',
      alt: 'Indigo handloom co-ord set styling at the studio',
      caption: 'Quiet confidence in handspun organic indigo. Pure weaves from Coimbatore.',
      url: 'https://www.instagram.com/anviclothing_coimbatore/reels/',
      isReel: true,
      views: '18.4K',
      likes: '1.8K',
      audio: 'Original Audio · anviclothing_coimbatore',
      category: 'styling',
      taggedProduct: {
        name: 'Indigo Kalamkari Co-ord Set',
        price: 2850,
        slug: 'indigo-kalamkari-co-ord-set',
      },
    },
    {
      id: 'post-2',
      image: '/images/instagram/insta_2.jpg',
      videoUrl: '/videos/reels/loom_craft.webm',
      alt: 'Festive silk drape with antique gold zari',
      caption: 'Evenings illuminated in heirloom gold zari drapes. Pure festive elegance.',
      url: 'https://www.instagram.com/anviclothing_coimbatore/reels/',
      isReel: true,
      views: '34.2K',
      likes: '3.4K',
      audio: 'Festive Shehnai · ANVI Coimbatore',
      category: 'reels',
      taggedProduct: {
        name: 'Kanjeevaram Antique Zari Saree',
        price: 12500,
        slug: 'kanjeevaram-antique-zari-silk-saree',
      },
    },
    {
      id: 'post-3',
      image: '/images/instagram/insta_3.jpg',
      videoUrl: '/videos/reels/weaving_swarnachari.webm',
      alt: 'Ajrakh handblock chanderi drape in natural light',
      caption: 'Centuries of Ajrakh mud-resist craft, reimagined for modern festivities.',
      url: 'https://www.instagram.com/anviclothing_coimbatore/reels/',
      isReel: true,
      views: '12.1K',
      likes: '1.2K',
      audio: 'Original Sound · anviclothing_coimbatore',
      category: 'studio',
      taggedProduct: {
        name: 'Ajrakh Chanderi Silk Saree',
        price: 4850,
        slug: 'ajrakh-chanderi-silk-saree',
      },
    },
    {
      id: 'post-4',
      image: '/images/instagram/insta_4.jpg',
      videoUrl: '/videos/reels/loom_craft.webm',
      alt: 'Everyday linen and cotton handloom comfort',
      caption: 'The art of daily dressing with effortless ease. Breathable textures for every hour.',
      url: 'https://www.instagram.com/anviclothing_coimbatore/reels/',
      isReel: true,
      views: '21.6K',
      likes: '2.5K',
      audio: 'Acoustic Raga · Coimbatore Studio',
      category: 'styling',
      taggedProduct: {
        name: 'Taamara Madder Red Bagru Set',
        price: 3450,
        slug: 'taamara-madder-red-bagru-set',
      },
    },
    {
      id: 'post-5',
      image: '/images/instagram/insta_5.jpg',
      videoUrl: '/videos/reels/weaving_swarnachari.webm',
      alt: 'Handcrafted artisanal silk kalidar ensemble',
      caption: 'Heirloom silken threads for milestone celebrations and unforgettable moments.',
      url: 'https://www.instagram.com/anviclothing_coimbatore/reels/',
      isReel: true,
      views: '48.9K',
      likes: '4.8K',
      audio: 'Classical Shehnai · Studio Melodies',
      category: 'reels',
      taggedProduct: {
        name: 'Ivory Zardozi Chanderi 3-Piece Set',
        price: 5400,
        slug: 'ivory-zardozi-chanderi-3-piece-set',
      },
    },
  ],
};
