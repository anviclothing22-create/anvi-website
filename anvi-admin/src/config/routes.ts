export const ROUTES = {
  // Auth — single source of truth (use ROUTES.AUTH.* everywhere)
  AUTH: {
    LOGIN: '/login',
    FORGOT_PASSWORD: '/forgot-password',
    RESET_PASSWORD: '/reset-password',
  },

  // App
  DASHBOARD: '/',
  PRODUCTS: '/products',
  CATEGORIES: '/categories',
  ORDERS: '/orders',
  ORDER_DETAILS: (id: string) => `/orders/${id}`,
  COUPONS: '/coupons',
  LEADS: '/leads',
  CMS: '/cms',
};
