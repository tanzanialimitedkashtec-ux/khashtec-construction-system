const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { fullName, email, phone, location, serviceType, customService, additionalInfo, password } = req.body;

    // Validation
    if (!fullName || !email || !phone || !location || !serviceType || !password) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create new user
    const userData = {
      fullName,
      email,
      phone,
      location,
      serviceType,
      customService,
      additionalInfo,
      password, // In production, hash this password
      role: 'Customer',
      department: 'Clients',
      status: 'Active'
    };

    const result = await User.create(userData);
    
    if (result.success) {
      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        user: {
          id: result.id,
          fullName: result.fullName,
          email: result.email,
          phone: result.phone,
          location: result.location,
          serviceType: result.serviceType,
          role: result.role,
          department: result.department,
          registrationDate: result.registrationDate,
          status: result.status
        }
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to register user',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const result = await User.authenticate(email, password);
    
    if (result.success) {
      // Generate JWT token
      const token = jwt.sign(
        { userId: result.user.id, email: result.user.email },
        process.env.JWT_SECRET || 'fallback_secret',
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      res.json({
        success: true,
        message: 'Login successful',
        token,
        user: result.user
      });
    } else {
      res.status(401).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get current user profile
router.get('/profile', async (req, res) => {
  try {
    // This would typically use middleware to verify JWT and get userId
    const userId = req.user?.id; // From auth middleware
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
