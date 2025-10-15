const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');

// Password hashing utility
const hashPassword = async (password) => {
  const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
  return await bcrypt.hash(password, saltRounds);
};

// Password comparison utility
const comparePassword = async (plainPassword, hashedPassword) => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

// Generate random string
const generateRandomString = (length = 10) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Generate order ID
const generateOrderId = () => {
  const timestamp = Date.now().toString(36);
  const randomStr = generateRandomString(4);
  return `ORD-${timestamp}-${randomStr}`.toUpperCase();
};

// Calculate distance between two coordinates (Haversine formula)
const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in kilometers
};

// Convert degrees to radians
const toRadians = (degrees) => {
  return degrees * (Math.PI / 180);
};

// Estimate delivery time based on distance
const estimateDeliveryTime = (distance) => {
  // Base time: 30 minutes + 15 minutes per km
  const baseTime = 30;
  const timePerKm = 15;
  const totalMinutes = baseTime + (distance * timePerKm);
  
  const now = new Date();
  const deliveryTime = new Date(now.getTime() + totalMinutes * 60000);
  
  return deliveryTime;
};

// Format currency
const formatCurrency = (amount, currency = 'INR') => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2
  }).format(amount);
};

// Calculate delivery fee based on distance
const calculateDeliveryFee = (distance) => {
  const baseFee = 20; // Base delivery fee in INR
  const ratePerKm = 10; // Additional fee per km
  
  if (distance <= 2) {
    return baseFee;
  }
  
  return baseFee + ((distance - 2) * ratePerKm);
};

// Validate request input
const validateRequest = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    throw new Error(errorMessages.join(', '));
  }
};

// Send standardized response
const sendResponse = (res, statusCode, success, message, data = null) => {
  const response = {
    success,
    message
  };
  
  if (data !== null) {
    response.data = data;
  }
  
  return res.status(statusCode).json(response);
};

// Paginate results
const paginate = async (model, query = {}, options = {}) => {
  const page = parseInt(options.page) || 1;
  const limit = parseInt(options.limit) || 10;
  const skip = (page - 1) * limit;
  
  const [results, total] = await Promise.all([
    model.find(query)
      .sort(options.sort || '-createdAt')
      .skip(skip)
      .limit(limit)
      .populate(options.populate || ''),
    model.countDocuments(query)
  ]);
  
  const totalPages = Math.ceil(total / limit);
  
  return {
    results,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    }
  };
};

// Clean object by removing null/undefined values
const cleanObject = (obj) => {
  const cleaned = {};
  Object.keys(obj).forEach(key => {
    if (obj[key] !== null && obj[key] !== undefined && obj[key] !== '') {
      if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
        const nestedCleaned = cleanObject(obj[key]);
        if (Object.keys(nestedCleaned).length > 0) {
          cleaned[key] = nestedCleaned;
        }
      } else {
        cleaned[key] = obj[key];
      }
    }
  });
  return cleaned;
};

// Generate time slots for delivery
const generateDeliverySlots = () => {
  const slots = [];
  const now = new Date();
  const currentHour = now.getHours();
  
  // Generate slots for next 48 hours
  for (let day = 0; day < 2; day++) {
    const date = new Date();
    date.setDate(date.getDate() + day);
    
    const startHour = day === 0 ? Math.max(currentHour + 2, 9) : 9;
    
    for (let hour = startHour; hour <= 21; hour += 2) {
      const slotStart = new Date(date);
      slotStart.setHours(hour, 0, 0, 0);
      
      const slotEnd = new Date(date);
      slotEnd.setHours(hour + 2, 0, 0, 0);
      
      slots.push({
        id: `${date.toDateString()}-${hour}`,
        start: slotStart,
        end: slotEnd,
        label: `${slotStart.toLocaleTimeString('en-IN', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })} - ${slotEnd.toLocaleTimeString('en-IN', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })}`,
        available: true
      });
    }
  }
  
  return slots;
};

// Validate email format
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate phone number (Indian format)
const isValidPhone = (phone) => {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone.replace(/\s+/g, ''));
};

// Validate pincode (Indian format)
const isValidPincode = (pincode) => {
  const pincodeRegex = /^[1-9][0-9]{5}$/;
  return pincodeRegex.test(pincode);
};

module.exports = {
  hashPassword,
  comparePassword,
  generateRandomString,
  generateOrderId,
  calculateDistance,
  estimateDeliveryTime,
  formatCurrency,
  calculateDeliveryFee,
  validateRequest,
  sendResponse,
  paginate,
  cleanObject,
  generateDeliverySlots,
  isValidEmail,
  isValidPhone,
  isValidPincode
};