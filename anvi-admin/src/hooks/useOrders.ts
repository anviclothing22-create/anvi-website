import { useState, useCallback, useMemo, useEffect } from 'react';
import { initialMockOrders } from '../data/mockOrders';
import type { Order, OrderStatus } from '../types/order';
import { STORAGE_KEYS, getStoredItem, setStoredItem, subscribeToStoreUpdates } from '../lib/storeSync';

const normalizeOrder = (raw: any): Order => {
  const customer = raw.customer || {
    name: raw.shippingAddress?.name || raw.shippingAddress?.fullName || 'Valued Patron',
    email: raw.customerEmail || 'patron@example.com',
    phone: raw.shippingAddress?.phone || raw.shippingAddress?.phoneNumber || '+91 99948 37459',
    city: raw.shippingAddress?.city || 'Coimbatore',
    state: raw.shippingAddress?.state || 'Tamil Nadu',
    street: raw.shippingAddress?.street || raw.shippingAddress?.addressLine1 || '146, Raju Naidu St, Tatabad',
    pincode: raw.shippingAddress?.pincode || raw.shippingAddress?.postalCode || '641012',
  };

  const shippingAddress = raw.shippingAddress || {
    fullName: customer.name,
    phoneNumber: customer.phone,
    addressLine1: customer.street,
    city: customer.city,
    state: customer.state,
    postalCode: customer.pincode,
    country: 'India',
  };

  const normalizedItems = (raw.items || []).map((item: any) => ({
    id: item.id || `item-${Math.random().toString(36).slice(2, 7)}`,
    name: item.name || item.productName || 'Handcrafted Garment',
    productName: item.productName || item.name || 'Handcrafted Garment',
    productImage: item.productImage || item.image || '/images/products/saree_ajrakh_1.jpg',
    image: item.image || item.productImage || '/images/products/saree_ajrakh_1.jpg',
    price: item.price ?? item.unitPrice ?? 0,
    unitPrice: item.unitPrice ?? item.price ?? 0,
    totalPrice: item.totalPrice ?? ((item.price ?? 0) * (item.quantity ?? 1)),
    quantity: item.quantity ?? 1,
    size: item.size || item.selectedSize || 'Free Size',
    selectedSize: item.selectedSize || item.size || 'Free Size',
    sku: item.sku || 'ANV-SKU',
  }));

  const orderStatus = (raw.orderStatus || raw.status || 'In Studio Preparation') as OrderStatus;
  const courier = raw.courier || raw.shippingCarrier || 'BlueDart Express';
  const trackingNumber = raw.trackingNumber || '';

  const defaultTimeline = [
    {
      title: 'Order Placed & Verified',
      description: `Payment captured via ${raw.paymentMethod || 'UPI'}. Studio queue initiated.`,
      timestamp: raw.date || raw.orderDate || 'Today',
      completed: true,
    },
    {
      title: 'In Studio Preparation',
      description: 'Garments undergoing hand-steaming and signature keepsake box packing.',
      timestamp: 'In Progress',
      completed: orderStatus === 'In Studio Preparation' || orderStatus === 'Dispatched' || orderStatus === 'Delivered',
    },
    ...(orderStatus === 'Dispatched' || orderStatus === 'Delivered'
      ? [
          {
            title: 'Dispatched via Air Courier',
            description: `${courier} assigned. Tracking: ${trackingNumber || 'Active'}`,
            timestamp: 'Shipped',
            completed: true,
          },
        ]
      : []),
    ...(orderStatus === 'Delivered'
      ? [
          {
            title: 'Delivered to Patron',
            description: 'Package successfully delivered and signed for.',
            timestamp: 'Delivered',
            completed: true,
          },
        ]
      : []),
  ];

  return {
    ...raw,
    id: raw.id || `ANVI-${Math.floor(100000 + Math.random() * 900000)}`,
    orderNumber: raw.orderNumber || raw.id,
    orderStatus,
    status: orderStatus,
    paymentStatus: raw.paymentStatus || 'Paid',
    paymentMethod: raw.paymentMethod || 'UPI (Instant Verification)',
    channel: raw.channel || 'Online Store',
    subtotal: raw.subtotal ?? (raw.total ? Math.round(raw.total * 0.95) : 0),
    discount: raw.discount ?? raw.discountAmount ?? 0,
    discountAmount: raw.discountAmount ?? raw.discount ?? 0,
    shippingFee: raw.shippingFee ?? raw.shippingCost ?? raw.shipping ?? 0,
    shippingCost: raw.shippingCost ?? raw.shippingFee ?? raw.shipping ?? 0,
    taxAmount: raw.taxAmount ?? 0,
    total: raw.total ?? raw.totalAmount ?? 0,
    totalAmount: raw.totalAmount ?? raw.total ?? 0,
    courier,
    shippingCarrier: courier,
    trackingNumber,
    trackingUrl: raw.trackingUrl || (trackingNumber ? `https://www.bluedart.com/tracking/${trackingNumber}` : undefined),
    customer,
    customerEmail: raw.customerEmail || customer.email,
    shippingAddress,
    items: normalizedItems,
    orderDate: raw.orderDate || raw.date || raw.createdAt || new Date().toISOString(),
    createdAt: raw.createdAt || raw.orderDate || raw.date || new Date().toISOString(),
    timeline: raw.timeline && raw.timeline.length > 0 ? raw.timeline : defaultTimeline,
  };
};

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>(() => {
    const raw = getStoredItem<any[]>(STORAGE_KEYS.ORDERS, initialMockOrders);
    return raw.map(normalizeOrder);
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [channelFilter, setChannelFilter] = useState<string>('All');

  // Listen to cross-store sync events
  useEffect(() => {
    const unsubscribe = subscribeToStoreUpdates((event) => {
      if (event.type === 'ORDER_PLACED' || event.type === 'ORDER_UPDATED') {
        const stored = getStoredItem<any[]>(STORAGE_KEYS.ORDERS, initialMockOrders);
        setOrders(stored.map(normalizeOrder));
      }
    });

    return () => unsubscribe();
  }, []);

  const saveOrders = useCallback((updated: Order[]) => {
    setOrders(updated);
    setStoredItem(STORAGE_KEYS.ORDERS, updated, 'ORDER_UPDATED');
  }, []);

  const updateOrderStatus = useCallback((orderId: string, newStatus: OrderStatus, courier?: string, trackingNumber?: string) => {
    const updated = orders.map((order) => {
      if (order.id === orderId) {
        const newTimeline = [...(order.timeline || [])];
        newTimeline.push({
          title: `Status: ${newStatus}`,
          description: `Order moved to ${newStatus}`,
          timestamp: new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
          completed: true,
        });

        return {
          ...order,
          orderStatus: newStatus,
          status: newStatus,
          courier: courier || order.courier,
          shippingCarrier: courier || order.shippingCarrier,
          trackingNumber: trackingNumber || order.trackingNumber,
          timeline: newTimeline,
        };
      }
      return order;
    });

    saveOrders(updated);
  }, [orders, saveOrders]);

  const updateShippingDetails = useCallback((orderId: string, carrier: string, trackingNumber: string, trackingUrl?: string) => {
    const updated = orders.map((order) => {
      if (order.id === orderId) {
        return {
          ...order,
          courier: carrier,
          shippingCarrier: carrier,
          trackingNumber,
          trackingUrl,
        };
      }
      return order;
    });
    saveOrders(updated);
  }, [orders, saveOrders]);

  const getOrderById = useCallback((id: string) => {
    return orders.find((o) => o.id === id || o.orderNumber === id);
  }, [orders]);

  const refreshOrders = useCallback(() => {
    const raw = getStoredItem<any[]>(STORAGE_KEYS.ORDERS, initialMockOrders);
    setOrders(raw.map(normalizeOrder));
  }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customer.phone.includes(searchQuery);

      const matchesStatus =
        statusFilter === 'All' ||
        order.orderStatus.toLowerCase() === statusFilter.toLowerCase() ||
        (order.status && order.status.toLowerCase() === statusFilter.toLowerCase());

      const matchesChannel =
        channelFilter === 'All' || order.channel === channelFilter;

      return matchesSearch && matchesStatus && matchesChannel;
    });
  }, [orders, searchQuery, statusFilter, channelFilter]);

  return {
    orders,
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
    refreshOrders,
  };
}

