export interface OrderItem {
  id: string;
  productId?: string;
  name: string;
  productName?: string;
  price: number;
  unitPrice?: number;
  totalPrice?: number;
  quantity: number;
  size?: string;
  selectedSize?: string;
  selectedColor?: string;
  image: string;
  productImage?: string;
  sku?: string;
}

export type OrderStatus =
  | 'In Studio Preparation'
  | 'Dispatched'
  | 'Delivered'
  | 'Cancelled'
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'in_studio_preparation'
  | 'shipped'
  | 'dispatched'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export type PaymentStatus =
  | 'Paid'
  | 'Pending'
  | 'Refunded'
  | 'paid'
  | 'pending'
  | 'refunded'
  | 'failed';

export interface OrderCustomer {
  name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  street: string;
  pincode: string;
  isFirstOrder?: boolean;
}

export interface ShippingAddress {
  fullName: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface OrderTimelineEvent {
  title: string;
  description: string;
  timestamp: string;
  completed: boolean;
}

export interface Order {
  id: string;
  orderNumber: string;
  customer: OrderCustomer;
  customerEmail?: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  discountAmount?: number;
  couponCode?: string;
  shippingFee: number;
  shippingCost?: number;
  taxAmount?: number;
  total: number;
  totalAmount?: number;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  orderStatus: OrderStatus;
  status?: OrderStatus;
  orderDate: string;
  date?: string;
  createdAt?: string;
  channel?: 'Online Store' | 'Coimbatore Offline Boutique' | string;
  courier?: string;
  shippingCarrier?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  timeline: OrderTimelineEvent[];
  shippingAddress?: ShippingAddress;
  notes?: string;
}
