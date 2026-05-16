export const ROLES = {
  ADMIN: 'admin',
  SELLER: 'seller',
  BUYER: 'buyer',
};

export const CATEGORIES = [
  { id: 'electronics',   label: 'Electronics',    icon: '💻', color: '#3B82F6' },
  { id: 'fashion',       label: 'Fashion',         icon: '👗', color: '#EC4899' },
  { id: 'books',         label: 'Books',           icon: '📚', color: '#10B981' },
  { id: 'shoes',         label: 'Shoes',           icon: '👟', color: '#F59E0B' },
  { id: 'home-kitchen',  label: 'Home & Kitchen',  icon: '🏠', color: '#8B5CF6' },
  { id: 'sports',        label: 'Sports',          icon: '⚽', color: '#EF4444' },
  { id: 'beauty',        label: 'Beauty',          icon: '💄', color: '#F43F5E' },
  { id: 'toys',          label: 'Toys & Games',    icon: '🎮', color: '#06B6D4' },
  { id: 'automotive',    label: 'Automotive',      icon: '🚗', color: '#78716C' },
  { id: 'grocery',       label: 'Grocery',         icon: '🛒', color: '#22C55E' },
];

export const ORDER_STATUS = {
  PENDING:    'pending',
  CONFIRMED:  'confirmed',
  SHIPPED:    'shipped',
  DELIVERED:  'delivered',
  CANCELLED:  'cancelled',
  REFUNDED:   'refunded',
};

export const PAYMENT_STATUS = {
  PENDING:   'pending',
  SUCCESS:   'success',
  FAILED:    'failed',
  REFUNDED:  'refunded',
};

export const API_ROUTES = {
  AUTH: {
    LOGIN:          '/auth/login',
    REGISTER:       '/auth/register',
    GOOGLE:         '/auth/google',
    SEND_OTP:       '/auth/send-otp',
    VERIFY_OTP:     '/auth/verify-otp',
    LOGOUT:         '/auth/logout',
    ME:             '/auth/me',
    REFRESH:        '/auth/refresh',
  },
  PRODUCTS: {
    ALL:            '/products',
    BY_ID:          (id) => `/products/${id}`,
    BY_CATEGORY:    (cat) => `/products/category/${cat}`,
    SELLER_PRODUCTS:'/products/seller/me',
    CREATE:         '/products',
    UPDATE:         (id) => `/products/${id}`,
    DELETE:         (id) => `/products/${id}`,
    SEARCH:         '/products/search',
  },
  ORDERS: {
    CREATE:         '/orders',
    MY_ORDERS:      '/orders/my',
    SELLER_ORDERS:  '/orders/seller',
    ALL:            '/orders/admin/all',
    BY_ID:          (id) => `/orders/${id}`,
    UPDATE_STATUS:  (id) => `/orders/${id}/status`,
  },
  PAYMENT: {
    CREATE_RAZORPAY:'/payment/razorpay/create',
    VERIFY_RAZORPAY:'/payment/razorpay/verify',
  },
  MESSAGES: {
    SEND:           '/messages',
    ALL:            '/messages/admin/all',
    BY_ID:          (id) => `/messages/${id}`,
    DELETE:         (id) => `/messages/${id}`,
  },
  USERS: {
    ALL:            '/users/admin/all',
    BY_ID:          (id) => `/users/${id}`,
    UPDATE:         (id) => `/users/${id}`,
    DELETE:         (id) => `/users/${id}`,
  },
};