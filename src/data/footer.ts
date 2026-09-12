/**
 * ANVI CLOTHING — FOOTER CONFIGURATION DATA
 * Structure:
 * SHOP, COLLECTIONS, DISCOVER, ABOUT, HELP + Legal Navigation & Social Links
 */

export interface FooterLink {
  label: string;
  href: string;
  isExternal?: boolean;
}

export interface FooterGroup {
  id: string;
  title: string;
  links: FooterLink[];
}

export interface FooterData {
  brand: {
    name: string;
    tagline: string;
    location: string;
    logoSrc: string;
  };
  groups: FooterGroup[];
  legalLinks: FooterLink[];
  copyright: string;
}

export const footerData: FooterData = {
  brand: {
    name: 'ANVI',
    tagline: 'Handpicked favourites chosen with love. Curated with care by Nivetha. 🤍✨',
    location: 'Coimbatore, Tamil Nadu, India',
    logoSrc: '/images/brand/anvi_logo.png',
  },
  groups: [
    {
      id: 'group-shop',
      title: 'Shop',
      links: [
        { label: 'Women', href: '/shop' },
        { label: 'Sarees', href: '/shop/sarees' },
        { label: 'Salwars', href: '/shop/salwars' },
        { label: 'Co-ord Sets', href: '/shop/co-ord-sets' },
        { label: '3-Piece Sets', href: '/shop/3-piece-sets' },
        { label: 'Kidswear', href: '/shop/kidswear' },
      ],
    },
    {
      id: 'group-collections',
      title: 'Collections',
      links: [
        { label: 'New Arrivals', href: '/collections/new-arrivals' },
        { label: 'Bestsellers', href: '/collections/bestsellers' },
        { label: 'The ANVI Edit', href: '/collections/the-anvi-edit' },
        { label: 'Festive Edit', href: '/collections/festive' },
        { label: 'Premium', href: '/collections/premium' },
      ],
    },
    {
      id: 'group-discover',
      title: 'Occasions',
      links: [
        { label: 'Everyday', href: '/occasions/everyday' },
        { label: 'Office', href: '/occasions/office' },
        { label: 'Festive', href: '/occasions/festive' },
      ],
    },
    {
      id: 'group-about',
      title: 'About',
      links: [
        { label: 'Our Story', href: '/our-story' },
        { label: 'Journal', href: '/journal' },
        { label: 'Visit ANVI', href: '/visit-us' },
        { label: 'Instagram', href: 'https://www.instagram.com/anviclothing_coimbatore/', isExternal: true },
        { label: 'WhatsApp', href: 'https://wa.me/919994837459', isExternal: true },
      ],
    },
    {
      id: 'group-help',
      title: 'Help',
      links: [
        { label: 'Delivery & Shipping', href: '/shipping' },
        { label: 'Exchanges & Returns', href: '/returns' },
        { label: 'FAQs', href: '/faqs' },
        { label: 'Contact', href: '/contact' },
      ],
    },
  ],
  legalLinks: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms', href: '/terms' },
    { label: 'Shipping Policy', href: '/shipping' },
    { label: 'Exchange Policy', href: '/returns' },
    // Admin link is dev-only — rendered only when VITE_ADMIN_URL is set (see Footer.tsx).
  ],
  copyright: '© 2026 ANVI Clothing. All rights reserved. Handcrafted in India.',
};
