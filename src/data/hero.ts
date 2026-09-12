export interface HeroSlide {
  id: string;
  badge: string;
  headlineWord1: string;
  headlineWord2: string;
  tagline?: string;
  primaryCtaText: string;
  primaryCtaHref: string;
  secondaryCtaText: string;
  secondaryCtaHref: string;
  imageSrc: string;
}

export const heroSlidesData: HeroSlide[] = [
  {
    id: 'sarees',
    badge: 'HANDPICKED FAVOURITES',
    headlineWord1: 'Timeless,',
    headlineWord2: 'handpicked.',
    tagline: 'Sarees Chosen with Care by Nivetha',
    primaryCtaText: 'DISCOVER SAREES',
    primaryCtaHref: '/shop/sarees',
    secondaryCtaText: 'NEW ARRIVALS',
    secondaryCtaHref: '/collections/new-arrivals',
    imageSrc: '/images/hero/anvi_saree_hero.jpg',
  },
  {
    id: 'festive',
    badge: 'HANDPICKED WITH LOVE',
    headlineWord1: 'Effortless,',
    headlineWord2: 'elegance.',
    tagline: 'Beautiful, Comfortable & Truly Wearable',
    primaryCtaText: 'EXPLORE FESTIVE',
    primaryCtaHref: '/collections/festive',
    secondaryCtaText: 'OUR STORY',
    secondaryCtaHref: '/our-story',
    imageSrc: '/images/hero/hero_desktop.jpg',
  },
  {
    id: 'everyday',
    badge: 'EVERYDAY FAVOURITES',
    headlineWord1: 'Style &',
    headlineWord2: 'comfort.',
    tagline: 'Quality & Affordability for Daily Grace',
    primaryCtaText: 'SHOP EVERYDAY',
    primaryCtaHref: '/occasions/everyday',
    secondaryCtaText: 'COLLECTIONS',
    secondaryCtaHref: '/collections',
    imageSrc: '/images/hero/hero_primary.webp',
  },
];

