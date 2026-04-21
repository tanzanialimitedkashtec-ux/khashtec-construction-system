const moment = require('moment');

// Format date for display
const formatDate = (date) => {
  return moment(date).format('DD/MM/YYYY');
};

// Format datetime for display
const formatDateTime = (datetime) => {
  return moment(datetime).format('DD/MM/YYYY HH:mm:ss');
};

// Format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-TZ', {
    style: 'currency',
    currency: 'TZS',
    minimumFractionDigits: 0
  }).format(amount);
};

// Generate unique ID
const generateId = (prefix) => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `${prefix}-${timestamp}-${random}`;
};

// Calculate days between dates
const daysBetween = (startDate, endDate) => {
  const start = moment(startDate);
  const end = moment(endDate);
  return end.diff(start, 'days');
};

// Validate email format
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate phone number (Tanzania format)
const isValidPhone = (phone) => {
  const phoneRegex = /^(\+255|0)?[67]\d{8}$/;
  return phoneRegex.test(phone);
};

// Sanitize string input
const sanitizeString = (str) => {
  if (!str) return '';
  return str.trim().replace(/[<>]/g, '');
};

// Pagination helper
const getPagination = (page, limit) => {
  const offset = (page - 1) * limit;
  return { limit, offset };
};

// Success response helper
const successResponse = (data, message = 'Success') => {
  return {
    success: true,
    message,
    data
  };
};

// Error response helper
const errorResponse = (message, code = 500) => {
  return {
    success: false,
    message,
    error: code
  };
};

module.exports = {
  formatDate,
  formatDateTime,
  formatCurrency,
  generateId,
  daysBetween,
  isValidEmail,
  isValidPhone,
  sanitizeString,
  getPagination,
  successResponse,
  errorResponse
};
