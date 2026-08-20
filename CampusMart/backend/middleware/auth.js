const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT token
const auth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    console.log('Auth header received:', authHeader);
    
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      console.log('No token provided');
      return res.status(401).json({ message: 'No token provided, authorization denied' });
    }

    console.log('Token received:', token.substring(0, 20) + '...');
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token decoded successfully:', decoded.userId);
    
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      console.log('User not found for token');
      return res.status(401).json({ message: 'Token is not valid' });
    }

    if (!user.isActive) {
      console.log('User account is deactivated');
      return res.status(401).json({ message: 'Account is deactivated' });
    }

    console.log('Authentication successful for user:', user.email);
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    console.error('Token that failed:', req.header('Authorization'));
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Check if user is admin
const adminAuth = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }
    next();
  } catch (error) {
    console.error('Admin auth error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Check if user is vendor
const vendorAuth = async (req, res, next) => {
  try {
    if (req.user.role !== 'vendor') {
      return res.status(403).json({ message: 'Access denied. Vendor privileges required.' });
    }
    
    if (!req.user.vendorDetails?.isApproved) {
      return res.status(403).json({ message: 'Vendor account not approved yet.' });
    }
    
    next();
  } catch (error) {
    console.error('Vendor auth error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Check if user is student
const studentAuth = async (req, res, next) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Access denied. Student privileges required.' });
    }
    next();
  } catch (error) {
    console.error('Student auth error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Check if user is vendor or admin
const vendorOrAdminAuth = async (req, res, next) => {
  try {
    if (req.user.role !== 'vendor' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Vendor or Admin privileges required.' });
    }
    
    if (req.user.role === 'vendor' && !req.user.vendorDetails?.isApproved) {
      return res.status(403).json({ message: 'Vendor account not approved yet.' });
    }
    
    next();
  } catch (error) {
    console.error('Vendor or admin auth error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  auth,
  adminAuth,
  vendorAuth,
  studentAuth,
  vendorOrAdminAuth
};