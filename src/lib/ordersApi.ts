import { getSupabase } from './supabaseClient';
import type { Order, OrderItem } from '../data/orders';

export type DeliveryMethod = 'standard' | 'express';
export type PayMethod = 'upi' | 'card' | 'netbanking' | 'cod';

export interface CheckoutItem {
  product_id: string;
  quantity: number;
  size?: string;
}

export interface ShippingAddressInput {
  name: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  contact?: string;
  email?: string;
}

export interface CreatedOrder {
  order_id: string;
  order_number: string;
  total_int: number;
}

/** Server-authoritative order creation. Never trust client totals. Idempotent via key. */
export async function createOrder(args: {
  items: CheckoutItem[];
  address: ShippingAddressInput;
  deliveryMethod: DeliveryMethod;
  paymentMethod: PayMethod;
  couponCode?: string | null;
  idempotencyKey: string;
}): Promise<CreatedOrder> {
  const sb = getSupabase();
  if (!sb) throw new Error('Supabase not configured. Set VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY.');
  const payload = args.items.map((i) => ({ product_id: i.product_id, quantity: i.quantity, size: i.size ?? 'Free Size' }));
  const { data, error } = await sb.rpc('create_order', {
    p_items: payload,
    p_address: args.address,
    p_delivery_method: args.deliveryMethod,
    p_payment_method: args.paymentMethod,
    p_coupon_code: args.couponCode ?? null,
    p_idempotency_key: args.idempotencyKey,
  });
  if (error) throw new Error(error.message);
  const row = (Array.isArray(data) ? data[0] : data) as CreatedOrder;
  if (!row?.order_id) throw new Error('Order creation failed.');
  return row;
}

/** Mark a prepaid order paid by consuming a server-side Razorpay confirmation (one-time). */
export async function attachVerifiedPayment(
  orderId: string,
  razorpayOrderId: string,
  razorpayPaymentId: string,
): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;
  const { data, error } = await sb.rpc('attach_verified_payment', {
    p_order_id: orderId,
    p_razorpay_order_id: razorpayOrderId,
    p_razorpay_payment_id: razorpayPaymentId,
  });
  if (error) throw new Error(error.message);
  return Boolean(data);
}

export async function fetchOrderById(orderId: string): Promise<unknown> {
  const sb = getSupabase();
  if (!sb) throw new Error('Supabase not configured.');
  const { data, error } = await sb.from('orders').select('*, order_items(*), order_timeline(*)').eq('id', orderId).single();
  if (error) throw new Error(error.message);
  return data;
}

// NOTE: Admin status changes live in anvi-admin (direct Supabase + RLS).
// No adminUpdateOrderStatus here — storefront bundle must not ship admin mutations.

export interface ServerOrderItem {
  id: string;
  product_name: string;
  unit_price_int: number;
  quantity: number;
  size_label: string | null;
  image_url: string | null;
  slug: string | null;
}

export interface ServerOrder {
  id: string;
  order_number: string;
  placed_at: string;
  order_status: string;
  subtotal_int: number;
  discount_int: number;
  coupon_code: string | null;
  shipping_fee_int: number;
  total_int: number;
  delivery_method: string;
  courier: string | null;
  tracking_number: string | null;
  shipping_snapshot: {
    name?: string;
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
    phone?: string;
  } | null;
  payment_method: string;
  order_items: ServerOrderItem[];
}

function mapStatus(status: string): Order['status'] {
  if (status === 'delivered') return 'Delivered';
  if (status === 'dispatched' || status === 'shipped') return 'Dispatched';
  return 'In Studio Preparation';
}

function formatOrderDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' });
  } catch {
    return iso;
  }
}

/** Convert a Supabase order row (+ items) into the storefront Order shape. */
export function toStorefrontOrder(row: ServerOrder): Order {
  const items: OrderItem[] = (row.order_items ?? []).map((i) => ({
    id: i.id,
    name: i.product_name,
    price: i.unit_price_int,
    quantity: i.quantity,
    size: i.size_label ?? 'Free Size',
    image: i.image_url ?? '/images/products/saree_ajrakh_1.jpg',
    slug: i.slug ?? '',
  }));
  const snap = row.shipping_snapshot ?? {};
  return {
    id: row.order_number,
    date: formatOrderDate(row.placed_at),
    status: mapStatus(row.order_status),
    items,
    subtotal: row.subtotal_int,
    discount: row.discount_int,
    couponCode: row.coupon_code ?? undefined,
    shipping: row.shipping_fee_int,
    total: row.total_int,
    deliveryMethod: row.delivery_method,
    courier: row.courier ?? undefined,
    trackingNumber: row.tracking_number ?? undefined,
    shippingAddress: {
      name: snap.name ?? 'Valued Patron',
      street: snap.street ?? '',
      city: snap.city ?? '',
      state: snap.state ?? '',
      pincode: snap.pincode ?? '',
      phone: snap.phone ?? '',
    },
    paymentMethod: row.payment_method,
  };
}

/** Server orders for the signed-in customer, in storefront shape. Empty when logged out. */
export async function fetchMyStorefrontOrders(): Promise<Order[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const { data: sessionData } = await sb.auth.getSession();
  if (!sessionData.session) return [];
  const { data, error } = await sb
    .from('orders')
    .select('*, order_items(*)')
    .order('placed_at', { ascending: false });
  if (error) throw new Error(error.message);
  return ((data ?? []) as ServerOrder[]).map(toStorefrontOrder);
}
