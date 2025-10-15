// User roles
const USER_ROLES = {
  CUSTOMER: 'customer',
  ADMIN: 'admin',
  DELIVERY_AGENT: 'delivery_agent'
};

// Order statuses
const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  ASSIGNED: 'assigned',
  PICKED_UP: 'picked_up',
  OUT_FOR_DELIVERY: 'out_for_delivery',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
};

// Payment methods
const PAYMENT_METHODS = {
  COD: 'cod',
  ONLINE: 'online',
  CARD: 'card'
};

// Payment statuses
const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded'
};

// Vehicle types
const VEHICLE_TYPES = {
  BIKE: 'bike',
  CAR: 'car',
  BICYCLE: 'bicycle',
  SCOOTER: 'scooter'
};

// Delivery agent statuses
const AGENT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
  PENDING_VERIFICATION: 'pending_verification'
};

// Product categories
const PRODUCT_CATEGORIES = {
  ELECTRONICS: 'electronics',
  CLOTHING: 'clothing',
  FOOD: 'food',
  BOOKS: 'books',
  HOME: 'home',
  BEAUTY: 'beauty',
  SPORTS: 'sports',
  TOYS: 'toys',
  GROCERIES: 'groceries',
  MEDICINES: 'medicines'
};

// Order priorities
const ORDER_PRIORITY = {
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high',
  URGENT: 'urgent'
};

// Notification types
const NOTIFICATION_TYPES = {
  ORDER_PLACED: 'order_placed',
  ORDER_CONFIRMED: 'order_confirmed',
  ORDER_ASSIGNED: 'order_assigned',
  ORDER_PICKED_UP: 'order_picked_up',
  ORDER_OUT_FOR_DELIVERY: 'order_out_for_delivery',
  ORDER_DELIVERED: 'order_delivered',
  ORDER_CANCELLED: 'order_cancelled',
  PAYMENT_SUCCESS: 'payment_success',
  PAYMENT_FAILED: 'payment_failed'
};

// Error codes
const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',
  SERVER_ERROR: 'SERVER_ERROR',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED'
};

// Success messages
const SUCCESS_MESSAGES = {
  USER_REGISTERED: 'User registered successfully',
  USER_LOGGED_IN: 'User logged in successfully',
  USER_LOGGED_OUT: 'User logged out successfully',
  PROFILE_UPDATED: 'Profile updated successfully',
  ORDER_PLACED: 'Order placed successfully',
  ORDER_UPDATED: 'Order updated successfully',
  ORDER_CANCELLED: 'Order cancelled successfully',
  AGENT_CREATED: 'Delivery agent created successfully',
  AGENT_UPDATED: 'Delivery agent updated successfully',
  LOCATION_UPDATED: 'Location updated successfully'
};

// Error messages
const ERROR_MESSAGES = {
  USER_NOT_FOUND: 'User not found',
  INVALID_CREDENTIALS: 'Invalid email or password',
  UNAUTHORIZED: 'Not authorized to access this resource',
  ORDER_NOT_FOUND: 'Order not found',
  AGENT_NOT_FOUND: 'Delivery agent not found',
  DUPLICATE_EMAIL: 'Email already exists',
  WEAK_PASSWORD: 'Password must be at least 8 characters long',
  INVALID_EMAIL: 'Invalid email format',
  INVALID_PHONE: 'Invalid phone number format',
  INVALID_PINCODE: 'Invalid pincode format',
  SERVER_ERROR: 'Internal server error'
};

// API response messages
const API_MESSAGES = {
  SUCCESS: 'Request completed successfully',
  CREATED: 'Resource created successfully',
  UPDATED: 'Resource updated successfully',
  DELETED: 'Resource deleted successfully',
  NOT_FOUND: 'Resource not found',
  BAD_REQUEST: 'Invalid request data',
  UNAUTHORIZED: 'Authentication required',
  FORBIDDEN: 'Access denied',
  CONFLICT: 'Resource already exists',
  VALIDATION_FAILED: 'Validation failed'
};

// Pagination defaults
const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100
};

// Rate limiting
const RATE_LIMITS = {
  AUTH: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5 // 5 requests per window
  },
  API: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // 100 requests per window
  },
  ORDERS: {
    windowMs: 60 * 1000, // 1 minute
    max: 10 // 10 orders per minute
  }
};

// Time constants
const TIME = {
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
  WEEK: 7 * 24 * 60 * 60 * 1000
};

// Distance constants (in kilometers)
const DISTANCE = {
  MAX_DELIVERY_RADIUS: 25,
  MIN_DELIVERY_DISTANCE: 0.5,
  FREE_DELIVERY_THRESHOLD: 500 // Free delivery above ₹500
};

// File upload constants
const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
  UPLOAD_PATH: 'uploads/',
  PROFILE_PATH: 'uploads/profiles/',
  DOCUMENTS_PATH: 'uploads/documents/'
};

// Delivery time slots
const DELIVERY_SLOTS = {
  MORNING: { start: '09:00', end: '12:00' },
  AFTERNOON: { start: '12:00', end: '16:00' },
  EVENING: { start: '16:00', end: '20:00' },
  NIGHT: { start: '20:00', end: '23:00' }
};

// Rating system
const RATING = {
  MIN_SCORE: 1,
  MAX_SCORE: 5,
  DEFAULT_SCORE: 3
};

// Order value thresholds
const ORDER_THRESHOLDS = {
  MIN_ORDER_VALUE: 50,
  FREE_DELIVERY_VALUE: 500,
  EXPRESS_DELIVERY_VALUE: 1000
};

// Agent performance metrics
const PERFORMANCE_METRICS = {
  EXCELLENT_RATING: 4.5,
  GOOD_RATING: 4.0,
  AVERAGE_RATING: 3.5,
  MIN_COMPLETION_RATE: 80
};

// Database collection names
const COLLECTIONS = {
  USERS: 'users',
  ORDERS: 'orders',
  DELIVERY_AGENTS: 'deliveryagents',
  PRODUCTS: 'products',
  NOTIFICATIONS: 'notifications'
};

// Socket.io events
const SOCKET_EVENTS = {
  CONNECTION: 'connection',
  DISCONNECT: 'disconnect',
  ORDER_UPDATE: 'order_update',
  LOCATION_UPDATE: 'location_update',
  NOTIFICATION: 'notification',
  AGENT_STATUS_CHANGE: 'agent_status_change'
};

module.exports = {
  USER_ROLES,
  ORDER_STATUS,
  PAYMENT_METHODS,
  PAYMENT_STATUS,
  VEHICLE_TYPES,
  AGENT_STATUS,
  PRODUCT_CATEGORIES,
  ORDER_PRIORITY,
  NOTIFICATION_TYPES,
  ERROR_CODES,
  SUCCESS_MESSAGES,
  ERROR_MESSAGES,
  API_MESSAGES,
  PAGINATION,
  RATE_LIMITS,
  TIME,
  DISTANCE,
  FILE_UPLOAD,
  DELIVERY_SLOTS,
  RATING,
  ORDER_THRESHOLDS,
  PERFORMANCE_METRICS,
  COLLECTIONS,
  SOCKET_EVENTS
};