import type { DashboardMetrics, DashboardStats, RevenueDataPoint } from '../types/dashboard';

export const initialDashboardMetrics: DashboardMetrics = {
  totalRevenue: 842650,
  revenueGrowthPercent: 18.2,
  onlineRevenue: 572900,
  offlineStoreRevenue: 269750,
  totalOrders: 184,
  ordersPendingDispatch: 12,
  averageOrderValue: 4580,
  totalPatrons: 1240,
  repeatPatronRate: 42,
};

export const mockDashboardStats: DashboardStats = {
  ...initialDashboardMetrics,
  revenueGrowth: 18.2,
  ordersGrowth: 12.4,
  leadsGrowth: 28.5,
  pendingOrders: 12,
  offlineStoreLeads: 46,
  repeatCustomerRate: 42,
};

export const revenueHistory: RevenueDataPoint[] = [
  { month: 'Apr', date: 'Apr', online: 340000, offline: 110000, total: 450000 },
  { month: 'May', date: 'May', online: 390000, offline: 145000, total: 535000 },
  { month: 'Jun', date: 'Jun', online: 420000, offline: 180000, total: 600000 },
  { month: 'Jul', date: 'Jul', online: 460000, offline: 215000, total: 675000 },
  { month: 'Aug', date: 'Aug', online: 510000, offline: 240000, total: 750000 },
  { month: 'Sep', date: 'Sep', online: 572900, offline: 269750, total: 842650 },
];

export const mockRevenueData = revenueHistory;
