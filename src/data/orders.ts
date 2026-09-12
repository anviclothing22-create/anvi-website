export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  size?: string;
  image: string;
  slug: string;
}

export interface Order {
  id: string; // e.g. "ANVI-849201"
  date: string;
  status: 'In Studio Preparation' | 'Dispatched' | 'Delivered';
  items: OrderItem[];
  subtotal: number;
  discount?: number;
  couponCode?: string;
  shipping: number;
  total: number;
  deliveryMethod: string;
  trackingNumber?: string;
  courier?: string;
  shippingAddress: {
    name: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
    phone: string;
  };
  paymentMethod: string;
}

export const initialOrders: Order[] = [
  {
    id: 'ANVI-849201',
    date: 'September 08, 2026',
    status: 'In Studio Preparation',
    subtotal: 8300,
    shipping: 0,
    total: 8300,
    deliveryMethod: 'Standard Insured Delivery',
    courier: 'BlueDart Express',
    trackingNumber: 'BLU-84920194IN',
    shippingAddress: {
      name: 'Ananya Sundaram',
      street: '146, Raju Naidu St, Sivananda Colony, Tatabad',
      city: 'Coimbatore',
      state: 'Tamil Nadu',
      pincode: '641012',
      phone: '+91 99948 37459',
    },
    paymentMethod: 'UPI (Google Pay)',
    items: [
      {
        id: 'item-1',
        name: 'Ajrakh Chanderi Silk Saree',
        price: 4850,
        quantity: 1,
        size: 'Free Size',
        image: '/images/products/saree_ajrakh_1.jpg',
        slug: 'ajrakh-chanderi-silk-saree',
      },
      {
        id: 'item-2',
        name: 'Taamara Madder Red Bagru Set',
        price: 3450,
        quantity: 1,
        size: 'M',
        image: '/images/products/salwar_bagru_1.jpg',
        slug: 'taamara-madder-red-bagru-set',
      },
    ],
  },
  {
    id: 'ANVI-731940',
    date: 'August 14, 2026',
    status: 'Delivered',
    subtotal: 2850,
    shipping: 0,
    total: 2850,
    deliveryMethod: 'Studio Priority Express',
    courier: 'Delhivery Surface',
    trackingNumber: 'DEL-73194022IN',
    shippingAddress: {
      name: 'Ananya Sundaram',
      street: '146, Raju Naidu St, Sivananda Colony, Tatabad',
      city: 'Coimbatore',
      state: 'Tamil Nadu',
      pincode: '641012',
      phone: '+91 99948 37459',
    },
    paymentMethod: 'Credit Card (HDFC Visa)',
    items: [
      {
        id: 'item-3',
        name: 'Indigo Kalamkari Co-ord Set',
        price: 2850,
        quantity: 1,
        size: 'S',
        image: '/images/products/coord_indigo_1.jpg',
        slug: 'indigo-kalamkari-co-ord-set',
      },
    ],
  },
  {
    id: 'ANVI-620419',
    date: 'June 22, 2026',
    status: 'Delivered',
    subtotal: 6200,
    shipping: 0,
    total: 6200,
    deliveryMethod: 'Standard Insured Delivery',
    courier: 'BlueDart Express',
    trackingNumber: 'BLU-62041901IN',
    shippingAddress: {
      name: 'Ananya Sundaram',
      street: '146, Raju Naidu St, Sivananda Colony, Tatabad',
      city: 'Coimbatore',
      state: 'Tamil Nadu',
      pincode: '641012',
      phone: '+91 99948 37459',
    },
    paymentMethod: 'UPI (PhonePe)',
    items: [
      {
        id: 'item-4',
        name: 'Ivory Zari Festive 3-Piece Set',
        price: 6200,
        quantity: 1,
        size: 'M',
        image: '/images/products/set_ivory_1.jpg',
        slug: 'ivory-zari-festive-3-piece-set',
      },
    ],
  },
];
