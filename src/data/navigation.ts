export interface NavItem {
  id: string;
  label: string;
  href: string;
  subItems?: { label: string; href: string }[];
}

export const mainNavItems: NavItem[] = [
  { id: 'shop', label: 'Shop', href: '/shop' },
  { id: 'collections', label: 'Collections', href: '/collections' },
  { id: 'occasions', label: 'Occasions', href: '/occasions' },
  { id: 'story', label: 'Our Story', href: '/our-story' },
  { id: 'journal', label: 'Journal', href: '/journal' },
];
