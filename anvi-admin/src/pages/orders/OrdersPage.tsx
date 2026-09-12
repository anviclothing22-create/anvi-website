import React, { useState, useMemo } from 'react';
import { useLocation } from 'wouter';
import { Search, RefreshCw, X } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { OrdersTable } from './components/OrdersTable';
import { useOrders } from '@/hooks/useOrders';
import { ROUTES } from '@/config/routes';
import { Pagination } from '@/components/shared/Pagination';

export const OrdersPage: React.FC = () => {
  const [, setLocation] = useLocation();
  const { orders, updateOrderStatus, refreshOrders } = useOrders();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const customerName = o.shippingAddress?.fullName || o.customer.name;
      const customerEmail = o.customerEmail || o.customer.email;
      const customerCity = o.shippingAddress?.city || o.customer.city;

      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchNum = o.orderNumber.toLowerCase().includes(q);
        const matchName = customerName.toLowerCase().includes(q);
        const matchEmail = customerEmail.toLowerCase().includes(q);
        const matchCity = customerCity.toLowerCase().includes(q);
        if (!matchNum && !matchName && !matchEmail && !matchCity) return false;
      }

      if (statusFilter !== 'all' && o.orderStatus.toLowerCase() !== statusFilter.toLowerCase()) {
        return false;
      }

      return true;
    });
  }, [orders, searchQuery, statusFilter]);

  const totalPages = Math.ceil(filteredOrders.length / pageSize) || 1;
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredOrders.slice(start, start + pageSize);
  }, [filteredOrders, currentPage, pageSize]);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Patron Orders & Dispatches"
        subtitle={`Tracking ${orders.length} orders across online storefront and bespoke customer inquiries.`}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={refreshOrders}
              className="text-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Sync Orders</span>
            </Button>
          </div>
        }
      />

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-anvi-sand/60 shadow-luxury-subtle flex flex-col md:flex-row items-stretch md:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-anvi-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            placeholder="Search by order #, customer name, email, or city..."
            className="pl-9 h-10 text-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-anvi-muted hover:text-anvi-charcoal"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="w-full md:w-48">
          <Select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="h-10 text-xs"
          >
            <option value="all">All Order Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">In Studio Preparation</option>
            <option value="shipped">Dispatched</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </Select>
        </div>

        {(searchQuery || statusFilter !== 'all') && (
          <button
            type="button"
            onClick={() => { setSearchQuery(''); setStatusFilter('all'); setCurrentPage(1); }}
            className="inline-flex items-center justify-center gap-1 px-3 py-2 text-xs text-anvi-maroon hover:bg-anvi-maroon/5 rounded-xl border border-anvi-sand/60 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        )}
      </div>

      <OrdersTable
        orders={paginatedOrders}
        onView={(id) => setLocation(ROUTES.ORDER_DETAILS(id))}
        onUpdateStatus={updateOrderStatus}
      />

      {filteredOrders.length > pageSize && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
};
export default OrdersPage;
