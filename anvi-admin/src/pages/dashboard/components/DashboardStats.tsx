import React from 'react';
import { IndianRupee, ShoppingBag, Users, Store, Award, AlertCircle } from 'lucide-react';
import { StatCard } from './StatCard';
import { formatCurrency } from '@/lib/formatCurrency';
import { DashboardStats as DashboardStatsType } from '@/types/dashboard';

interface DashboardStatsProps {
  stats: DashboardStatsType;
  lowStockCount: number;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ stats, lowStockCount }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      <StatCard
        label="Total Gross"
        value={formatCurrency(stats.totalRevenue)}
        change={stats.revenueGrowth}
        icon={IndianRupee}
        subtext="Online + Store"
        iconColor="text-anvi-maroon"
      />
      <StatCard
        label="Total Orders"
        value={stats.totalOrders}
        change={stats.ordersGrowth}
        icon={ShoppingBag}
        subtext={`${stats.pendingOrders ?? stats.ordersPendingDispatch ?? 0} pending`}
        iconColor="text-anvi-gold-dark"
      />
      <StatCard
        label="Avg Order Value"
        value={formatCurrency(stats.averageOrderValue)}
        change={4.2}
        icon={Award}
        subtext="Healthy margins"
        iconColor="text-emerald-700"
      />
      <StatCard
        label="Offline Walk-ins"
        value={stats.offlineStoreLeads ?? 46}
        change={stats.leadsGrowth}
        icon={Store}
        subtext="Tatabad Boutique"
        iconColor="text-indigo-700"
      />
      <StatCard
        label="Repeat Patrons"
        value={`${stats.repeatCustomerRate ?? stats.repeatPatronRate ?? 42}%`}
        change={2.1}
        icon={Users}
        subtext="Brand loyalty"
        iconColor="text-amber-700"
      />
      <StatCard
        label="Stock Attention"
        value={lowStockCount}
        icon={AlertCircle}
        subtext={lowStockCount > 0 ? 'Replenish soon' : 'Optimal inventory'}
        iconColor={lowStockCount > 0 ? 'text-amber-600' : 'text-emerald-600'}
      />
    </div>
  );
};
export default DashboardStats;
