import {
  LayoutDashboard,
  Shirt,
  Tags,
  ShoppingBag,
  TicketPercent,
  Users,
  Palette,
} from 'lucide-react';
import { ROUTES } from './routes';

export interface NavItem {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
  badge?: string | number;
}

export const NAV_ITEMS: NavItem[] = [
  {
    label: 'Overview',
    href: ROUTES.DASHBOARD,
    icon: LayoutDashboard,
  },
  {
    label: 'Products',
    href: ROUTES.PRODUCTS,
    icon: Shirt,
  },
  {
    label: 'Categories',
    href: ROUTES.CATEGORIES,
    icon: Tags,
  },
  {
    label: 'Orders',
    href: ROUTES.ORDERS,
    icon: ShoppingBag,
    // Badge counts are rendered dynamically in SidebarNavigation via useOrders/useLeads.
  },
  {
    label: 'Coupons',
    href: ROUTES.COUPONS,
    icon: TicketPercent,
  },
  {
    label: 'Patron Leads',
    href: ROUTES.LEADS,
    icon: Users,
  },
  {
    label: 'Store CMS',
    href: ROUTES.CMS,
    icon: Palette,
  },
];
