export const ORDER_STATUSES = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PREPARING: 'preparing',
  READY_FOR_PICKUP: 'ready_for_pickup',
  PICKED_UP: 'picked_up',
  IN_TRANSIT: 'in_transit',
  OUT_FOR_DELIVERY: 'out_for_delivery',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  RETURNED: 'returned'
};

export const PAYMENT_METHODS = {
  CREDIT_CARD: 'Credit Card',
  DEBIT_CARD: 'Debit Card',
  UPI: 'UPI',
  NET_BANKING: 'Net Banking',
  WALLET: 'Digital Wallet',
  COD: 'Cash on Delivery'
};

export const PAYMENT_STATUSES = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded'
};

export const USER_ROLES = {
  CUSTOMER: 'customer',
  ADMIN: 'admin',
  DELIVERY_AGENT: 'delivery'
};

export const AGENT_STATUSES = {
  ACTIVE: 'active',
  BUSY: 'busy',
  OFFLINE: 'offline',
  UNAVAILABLE: 'unavailable'
};

export const VEHICLE_TYPES = {
  MOTORCYCLE: 'Motorcycle',
  SCOOTER: 'Scooter',
  BICYCLE: 'Bicycle',
  VAN: 'Van',
  TRUCK: 'Truck'
};

export const PRODUCT_CATEGORIES = {
  ELECTRONICS: 'Electronics',
  FASHION: 'Fashion',
  HOME_KITCHEN: 'Home & Kitchen',
  BOOKS: 'Books',
  SPORTS: 'Sports',
  BEAUTY: 'Beauty & Personal Care',
  TOYS: 'Toys & Games',
  AUTOMOTIVE: 'Automotive'
};

export const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  preparing: 'bg-orange-100 text-orange-800',
  ready_for_pickup: 'bg-purple-100 text-purple-800',
  picked_up: 'bg-indigo-100 text-indigo-800',
  in_transit: 'bg-cyan-100 text-cyan-800',
  out_for_delivery: 'bg-teal-100 text-teal-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  returned: 'bg-gray-100 text-gray-800'
};

export const DELIVERY_COMMISSION_RATE = 0.08; // 8% commission
export const PLATFORM_FEE_RATE = 0.02; // 2% platform fee

export const API_ENDPOINTS = {
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',
  ORDERS: '/api/orders',
  AGENTS: '/api/agents',
  CUSTOMERS: '/api/customers',
  ANALYTICS: '/api/analytics'
};