const jwt = require('jsonwebtoken');

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required'
    });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret', (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    req.user = user;
    next();
  });
};

// Middleware to check user role
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (roles.includes(req.user.role)) {
      next();
    } else {
      res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }
  };
};

// Middleware to check if user is admin
const requireAdmin = requireRole(['Managing Director', 'HR Manager', 'Finance Manager', 'Project Manager', 'Real Estate Manager', 'HSE Manager']);

// Middleware to check if user is HR
const requireHR = requireRole(['Managing Director', 'HR Manager']);

// Middleware to check if user is Finance
const requireFinance = requireRole(['Managing Director', 'Finance Manager']);

// Middleware to check if user is Project Manager
const requireProjectManager = requireRole(['Managing Director', 'Project Manager']);

// Middleware to check if user is Real Estate Manager
const requireRealEstate = requireRole(['Managing Director', 'Real Estate Manager']);

// Middleware to check if user is HSE Manager
const requireHSE = requireRole(['Managing Director', 'HSE Manager']);

module.exports = {
  authenticateToken,
  requireRole,
  requireAdmin,
  requireHR,
  requireFinance,
  requireProjectManager,
  requireRealEstate,
  requireHSE
};
