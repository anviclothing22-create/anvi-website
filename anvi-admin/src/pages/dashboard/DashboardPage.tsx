import React from 'react';
import { useLocation } from 'wouter';
import {
  PackagePlus,
  ArrowRight,
  ExternalLink,
  AlertTriangle
} from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { DashboardStats } from './components/DashboardStats';
import { RevenueOverview } from './components/RevenueOverview';
import { useOrders } from '@/hooks/useOrders';
import { useProducts } from '@/hooks/useProducts';
import { useLeads } from '@/hooks/useLeads';
import { mockDashboardStats, mockRevenueData } from '@/data/mockDashboard';
import { formatCurrency } from '@/lib/formatCurrency';
import { formatDate } from '@/lib/formatDate';
import { ROUTES } from '@/config/routes';
import { APP_CONFIG } from '@/config/constants';

export const DashboardPage: React.FC = () => {
  const [, setLocation] = useLocation();
  const { orders } = useOrders();
  const { products } = useProducts();
  const { leads } = useLeads();

  const lowStockProducts = products.filter((p) => (p.stockQuantity ?? p.stock ?? 0) < 10);
  const recentOrders = orders.slice(0, 5);
  const recentLeads = leads.slice(0, 4);

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        title="Executive Overview"
        subtitle="Real-time control center for ANVI digital sales and Coimbatore boutique operations."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(APP_CONFIG.liveStoreUrl, '_blank')}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Preview Customer Store</span>
            </Button>
            <Button
              size="sm"
              onClick={() => setLocation(ROUTES.PRODUCTS)}
            >
              <PackagePlus className="w-3.5 h-3.5" />
              <span>Add New Creation</span>
            </Button>
          </div>
        }
      />

      {/* KPI Stats Bar */}
      <DashboardStats stats={mockDashboardStats} lowStockCount={lowStockProducts.length} />

      {/* Revenue Graph Overview */}
      <RevenueOverview
        data={mockRevenueData}
        totalRevenue={mockDashboardStats.totalRevenue}
      />

      {/* Middle Grid: Recent Orders & Boutique Inquiries */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders (2 Columns) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-anvi-sand/60 p-6 shadow-luxury-subtle space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-serif font-bold text-anvi-charcoal">
                Latest Client Dispatches
              </h3>
              <p className="text-xs text-anvi-muted">Orders requiring fulfillment or tracking updates.</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation(ROUTES.ORDERS)}
              className="text-xs text-anvi-maroon hover:text-anvi-maroon-dark font-medium"
            >
              <span>View All ({orders.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-anvi-sand/40 text-anvi-muted font-sans uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-2.5 font-semibold">Order</th>
                  <th className="py-2.5 font-semibold">Customer</th>
                  <th className="py-2.5 font-semibold">Total</th>
                  <th className="py-2.5 font-semibold">Status</th>
                  <th className="py-2.5 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-anvi-sand/20">
                {recentOrders.map((order) => {
                  const customerName = order.shippingAddress?.fullName || order.customer.name;
                  const customerCity = order.shippingAddress?.city || order.customer.city;
                  const customerState = order.shippingAddress?.state || order.customer.state;
                  const total = order.totalAmount ?? order.total ?? 0;
                  const orderDate = order.createdAt || order.orderDate;

                  return (
                    <tr key={order.id} className="hover:bg-anvi-linen/40 transition-colors">
                      <td className="py-3 font-mono font-medium text-anvi-charcoal">
                        {order.orderNumber}
                        <span className="block text-[10px] font-sans text-anvi-muted">
                          {formatDate(orderDate)}
                        </span>
                      </td>
                      <td className="py-3">
                        <p className="font-medium text-anvi-charcoal">{customerName}</p>
                        <p className="text-[11px] text-anvi-muted">{customerCity}, {customerState}</p>
                      </td>
                      <td className="py-3 font-semibold text-anvi-charcoal font-serif">
                        {formatCurrency(total)}
                      </td>
                      <td className="py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium capitalize ${
                            order.orderStatus === 'delivered' || order.orderStatus === 'Delivered'
                              ? 'bg-emerald-50 text-emerald-700'
                              : order.orderStatus === 'shipped' || order.orderStatus === 'Dispatched'
                              ? 'bg-blue-50 text-blue-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {order.orderStatus}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <Button
                          variant="outline"
                          size="xs"
                          onClick={() => setLocation(ROUTES.ORDER_DETAILS(order.id))}
                        >
                          Inspect
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Boutique Walk-ins & Styling Leads */}
        <div className="bg-white rounded-2xl border border-anvi-sand/60 p-6 shadow-luxury-subtle space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-serif font-bold text-anvi-charcoal">
                Storefront Leads
              </h3>
              <p className="text-xs text-anvi-muted">Tatabad boutique visits & custom styling inquiries.</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation(ROUTES.LEADS)}
              className="text-xs text-anvi-maroon hover:text-anvi-maroon-dark font-medium"
            >
              <span>All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>

          <div className="space-y-3">
            {recentLeads.map((lead) => {
              const leadName = lead.fullName || lead.name || 'Patron Client';
              const leadInterest = lead.interestCategory || (lead.interests ? lead.interests.join(', ') : 'Sarees');

              return (
                <div
                  key={lead.id}
                  className="p-3 rounded-xl border border-anvi-sand/50 bg-anvi-linen/30 hover:bg-anvi-linen/70 transition-colors space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-anvi-charcoal">{leadName}</span>
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-white text-anvi-maroon border border-anvi-sand/60">
                      {lead.source}
                    </span>
                  </div>
                  <p className="text-[11px] text-anvi-muted line-clamp-1">{leadInterest} - {lead.notes || 'Inquiry logged'}</p>
                  <div className="flex items-center justify-between text-[10px] text-anvi-muted pt-1 border-t border-anvi-sand/30">
                    <span>{lead.phone}</span>
                    <span>{formatDate(lead.createdAt)}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick alert if stock is low */}
          {lowStockProducts.length > 0 && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-xs text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Low Stock Alert:</span>
                <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                  {lowStockProducts.length} items (e.g. {lowStockProducts[0].name}) have fallen below 10 units.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default DashboardPage;
