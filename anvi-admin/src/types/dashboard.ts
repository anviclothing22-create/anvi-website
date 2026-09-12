export interface DashboardMetrics {
  totalRevenue: number;
  revenueGrowthPercent: number;
  onlineRevenue: number;
  offlineStoreRevenue: number;
  totalOrders: number;
  ordersPendingDispatch: number;
  averageOrderValue: number;
  totalPatrons: number;
  repeatPatronRate: number;
}

export interface DashboardStats extends DashboardMetrics {
  revenueGrowth?: number;
  ordersGrowth?: number;
  leadsGrowth?: number;
  pendingOrders?: number;
  offlineStoreLeads?: number;
  repeatCustomerRate?: number;
}

export interface RevenueDataPoint {
  month?: string;
  date?: string;
  online: number;
  offline: number;
  total: number;
}

export type RevenuePoint = RevenueDataPoint;
