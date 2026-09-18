import { useState, useCallback, useMemo, useEffect } from 'react';
import { initialMockOrders } from '../data/mockOrders';
import type { Order, OrderStatus, OrderItem, OrderTimelineEvent } from '../types/order';
import { STORAGE_KEYS, getStoredItem, setStoredItem, subscribeToStoreUpdates } from '../lib/storeSync';
import { supabase, requireAdmin } from '../lib/supabase';

const normalizeDbOrder = (raw: any): Order => {
  const snap = raw.shipping_snapshot || raw.shippingAddress || {};
  const customer = {
    name: raw.customer_name || snap.name || snap.fullName || raw.customer?.name || 'Valued Patron',
    email: raw.customer_email || snap.email || raw.customerEmail || raw.customer?.email || 'patron@example.com',
    phone: raw.customer_phone || snap.phone || snap.phoneNumber || raw.customer?.phone || '+91 99948 37459',
    city: snap.city || raw.customer?.city || 'Coimbatore',
    state: snap.state || raw.customer?.state || 'Tamil Nadu',
    street: snap.street || snap.addressLine1 || snap.address || raw.customer?.street || '146, Raju Naidu St, Tatabad',
    pincode: snap.pincode || snap.postalCode || raw.customer?.pincode || '641012',
  };

  const shippingAddress = {
    fullName: customer.name,
    phoneNumber: customer.phone,
    addressLine1: customer.street,
    addressLine2: snap.addressLine2,
    city: customer.city,
    state: customer.state,
    postalCode: customer.pincode,
    country: snap.country || 'India',
  };

  const normalizedItems: OrderItem[] = (raw.order_items || raw.items || []).map((item: any) => ({
    id: item.id || `item-${Math.random().toString(36).slice(2, 7)}`,
    productId: item.product_id || item.productId,
    name: item.product_name || item.name || item.productName || 'Handcrafted Garment',
    productName: item.product_name || item.name || item.productName || 'Handcrafted Garment',
    image: item.image_url || item.image || item.productImage || '/images/products/saree_ajrakh_1.jpg',
    productImage: item.image_url || item.image || item.productImage || '/images/products/saree_ajrakh_1.jpg',
    price: item.unit_price_int ?? item.price ?? item.unitPrice ?? 0,
    unitPrice: item.unit_price_int ?? item.unitPrice ?? item.price ?? 0,
    totalPrice: item.total_price_int ?? item.totalPrice ?? ((item.price ?? 0) * (item.quantity ?? 1)),
    quantity: item.quantity ?? 1,
    size: item.size_label || item.size || item.selectedSize || 'Free Size',
    selectedSize: item.size_label || item.selectedSize || item.size || 'Free Size',
    selectedColor: item.color || item.selectedColor,
    sku: item.sku || 'ANV-SKU',
  }));

  const orderStatus = (raw.order_status || raw.orderStatus || raw.status || 'in_studio_preparation') as OrderStatus;
  const courier = raw.courier || raw.shippingCarrier || 'BlueDart Express';
  const trackingNumber = raw.tracking_number || raw.trackingNumber || '';

  const rawTimeline = raw.order_timeline || raw.timeline || [];
  const timeline: OrderTimelineEvent[] =
    rawTimeline.length > 0
      ? rawTimeline.map((t: any) => ({
          title: t.title || 'Event',
          description: t.description || '',
          timestamp: t.event_at || t.timestamp || 'Recorded',
          completed: t.is_completed ?? t.completed ?? true,
        }))
      : [
          {
            title: 'Order Placed & Verified',
            description: `Payment recorded (${raw.payment_method || raw.paymentMethod || 'UPI'}). Preparation started.`,
            timestamp: raw.placed_at || raw.date || raw.orderDate || 'Today',
            completed: true,
          },
          {
            title: 'In Preparation',
            description: 'Garments undergoing hand-steaming and signature packaging.',
            timestamp: 'In Progress',
            completed: true,
          },
        ];

  return {
    id: raw.id || `ANVI-${Math.floor(100000 + Math.random() * 900000)}`,
    orderNumber: raw.order_number || raw.orderNumber || raw.id,
    orderStatus,
    status: orderStatus,
    paymentStatus: raw.payment_status || raw.paymentStatus || 'Paid',
    paymentMethod: raw.payment_method || raw.paymentMethod || 'UPI (Instant Verification)',
    channel: raw.channel || 'Online Store',
    subtotal: raw.subtotal_int ?? raw.subtotal ?? (raw.total ? Math.round(raw.total * 0.95) : 0),
    discount: raw.discount_int ?? raw.discount ?? raw.discountAmount ?? 0,
    discountAmount: raw.discount_int ?? raw.discountAmount ?? raw.discount ?? 0,
    couponCode: raw.coupon_code || raw.couponCode,
    shippingFee: raw.shipping_fee_int ?? raw.shippingFee ?? raw.shippingCost ?? 0,
    shippingCost: raw.shipping_fee_int ?? raw.shippingCost ?? raw.shippingFee ?? 0,
    taxAmount: raw.tax_amount_int ?? raw.taxAmount ?? 0,
    total: raw.total_int ?? raw.total ?? raw.totalAmount ?? 0,
    totalAmount: raw.total_int ?? raw.totalAmount ?? raw.total ?? 0,
    courier,
    shippingCarrier: courier,
    trackingNumber,
    trackingUrl: raw.tracking_url || raw.trackingUrl || (trackingNumber ? `https://www.bluedart.com/tracking/${trackingNumber}` : undefined),
    customer,
    customerEmail: customer.email,
    shippingAddress,
    items: normalizedItems,
    orderDate: raw.placed_at || raw.orderDate || raw.date || raw.createdAt || new Date().toISOString(),
    createdAt: raw.created_at || raw.createdAt || raw.placed_at || new Date().toISOString(),
    timeline,
    notes: raw.notes,
  };
};

const loadInitialOrders = (): Order[] => {
  const cached = getStoredItem<any[]>(STORAGE_KEYS.ORDERS, []);
  if (cached && cached.length > 0) return cached.map(normalizeDbOrder);
  return initialMockOrders.map(normalizeDbOrder);
};

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>(loadInitialOrders);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [channelFilter, setChannelFilter] = useState<string>('All');

  const fetchLiveOrders = useCallback(async () => {
    try {
      try {
        await requireAdmin();
      } catch {
        // Continue to attempt read
      }

      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*), order_timeline(*)')
        .order('created_at', { ascending: false });

      if (!error && data) {
        const liveMapped = data.map(normalizeDbOrder);
        // Combine live orders with any local orders not yet synced, or initial mocks if brand new store
        const seenNumbers = new Set<string>();
        const merged: Order[] = [];

        for (const ord of liveMapped) {
          if (!seenNumbers.has(ord.orderNumber)) {
            seenNumbers.add(ord.orderNumber);
            merged.push(ord);
          }
        }

        // Merge any locally placed test orders from this browser session
        const local = getStoredItem<any[]>(STORAGE_KEYS.ORDERS, []);
        for (const ord of local) {
          const norm = normalizeDbOrder(ord);
          if (!seenNumbers.has(norm.orderNumber)) {
            seenNumbers.add(norm.orderNumber);
            merged.push(norm);
          }
        }

        const finalOrders = merged.length > 0 ? merged : initialMockOrders.map(normalizeDbOrder);
        setOrders(finalOrders);
        setStoredItem(STORAGE_KEYS.ORDERS, finalOrders, 'ORDER_UPDATED');
      }
    } catch (err) {
      console.warn('[useOrders] Live orders fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchLiveOrders();

    // Realtime channel for live customer orders
    const channel = supabase
      .channel('admin-live-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        void fetchLiveOrders();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'order_items' }, () => {
        void fetchLiveOrders();
      })
      .subscribe();

    const unsubscribe = subscribeToStoreUpdates((event) => {
      if (event.type === 'ORDER_PLACED' || event.type === 'ORDER_UPDATED') {
        void fetchLiveOrders();
      }
    });

    return () => {
      supabase.removeChannel(channel);
      unsubscribe();
    };
  }, [fetchLiveOrders]);

  const saveOrdersLocally = useCallback((updated: Order[]) => {
    setOrders(updated);
    setStoredItem(STORAGE_KEYS.ORDERS, updated, 'ORDER_UPDATED');
  }, []);

  const updateOrderStatus = useCallback(
    async (orderId: string, newStatus: OrderStatus, courier?: string, trackingNumber?: string) => {
      const normalizedStatus = (newStatus || '').toLowerCase().replace(/[\s_-]+/g, '_');
      const dbStatus =
        normalizedStatus === 'processing' ? 'in_studio_preparation' :
        normalizedStatus === 'shipped' ? 'dispatched' : normalizedStatus;

      // Optimistic local state update
      const updated = orders.map((order) => {
        if (order.id === orderId || order.orderNumber === orderId) {
          const newTimeline = [...(order.timeline || [])];
          newTimeline.push({
            title: `Status: ${newStatus}`,
            description: `Order moved to ${newStatus}`,
            timestamp: new Date().toLocaleDateString('en-IN', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            }),
            completed: true,
          });

          return {
            ...order,
            orderStatus: dbStatus as OrderStatus,
            status: dbStatus as OrderStatus,
            courier: courier || order.courier,
            shippingCarrier: courier || order.shippingCarrier,
            trackingNumber: trackingNumber || order.trackingNumber,
            timeline: newTimeline,
          };
        }
        return order;
      });

      saveOrdersLocally(updated);

      // Persist to Supabase database
      try {
        await requireAdmin();
        await supabase
          .from('orders')
          .update({
            order_status: dbStatus,
            courier: courier || undefined,
            tracking_number: trackingNumber || undefined,
            updated_at: new Date().toISOString(),
          })
          .eq('id', orderId);

        await supabase.from('order_timeline').insert({
          order_id: orderId,
          title: `Status: ${newStatus}`,
          description: `Order moved to ${newStatus}`,
          to_status: dbStatus,
          is_completed: true,
        });
      } catch (err) {
        console.warn('[useOrders] Live order update error:', err);
      }
    },
    [orders, saveOrdersLocally]
  );

  const updateShippingDetails = useCallback(
    async (orderId: string, carrier: string, trackingNumber: string, trackingUrl?: string) => {
      const url = trackingUrl || (trackingNumber ? `https://www.bluedart.com/tracking/${trackingNumber}` : undefined);

      // Optimistic local update
      const updated = orders.map((order) => {
        if (order.id === orderId || order.orderNumber === orderId) {
          return {
            ...order,
            courier: carrier,
            shippingCarrier: carrier,
            trackingNumber,
            trackingUrl: url,
          };
        }
        return order;
      });
      saveOrdersLocally(updated);

      // Persist to Supabase
      try {
        await requireAdmin();
        await supabase
          .from('orders')
          .update({
            courier: carrier,
            tracking_number: trackingNumber,
            tracking_url: url,
            updated_at: new Date().toISOString(),
          })
          .eq('id', orderId);
      } catch (err) {
        console.warn('[useOrders] Live shipping update error:', err);
      }
    },
    [orders, saveOrdersLocally]
  );

  const getOrderById = useCallback(
    (id: string) => {
      const q = String(id).toLowerCase();
      return orders.find((o) => o.id.toLowerCase() === q || o.orderNumber.toLowerCase() === q);
    },
    [orders]
  );

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customer.phone.includes(searchQuery);

      if (!matchesSearch) return false;

      if (statusFilter !== 'all' && statusFilter !== 'All') {
        const orderSt = (order.orderStatus || '').toLowerCase().replace(/[\s_-]+/g, '_');
        const filterSt = statusFilter.toLowerCase().replace(/[\s_-]+/g, '_');
        const isMatch =
          orderSt === filterSt ||
          (filterSt === 'processing' && (orderSt === 'in_studio_preparation' || orderSt === 'processing')) ||
          (filterSt === 'in_studio_preparation' && (orderSt === 'in_studio_preparation' || orderSt === 'processing')) ||
          (filterSt === 'shipped' && (orderSt === 'dispatched' || orderSt === 'shipped')) ||
          (filterSt === 'dispatched' && (orderSt === 'dispatched' || orderSt === 'shipped'));
        if (!isMatch) return false;
      }

      if (channelFilter !== 'All') {
        if (order.channel !== channelFilter) return false;
      }

      return true;
    });
  }, [orders, searchQuery, statusFilter, channelFilter]);

  return {
    orders,
    loading,
    filteredOrders,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    channelFilter,
    setChannelFilter,
    updateOrderStatus,
    updateShippingDetails,
    getOrderById,
    refreshOrders: fetchLiveOrders,
  };
}
