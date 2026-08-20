const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { auth } = require('../middleware/auth');
const { uploadSingle } = require('../middleware/upload');

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, phone, college, studentId, vendorDetails } = req.body;

    // Check if user already exists with email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Check if student ID already exists (for student registration)
    if (role === 'student' && studentId) {
      const existingStudent = await User.findOne({ studentId });
      if (existingStudent) {
        return res.status(400).json({ message: 'Student ID already exists. Please use a different Student ID.' });
      }
    }

    // Validate required fields based on role
    if (role === 'student' && !studentId) {
      return res.status(400).json({ message: 'Student ID is required for student registration' });
    }

    if (role === 'vendor' && (!vendorDetails || !vendorDetails.businessName)) {
      return res.status(400).json({ message: 'Business details are required for vendor registration' });
    }

    // Create new user
    const userData = {
      name,
      email,
      password,
      role: role || 'student',
      phone,
      college
    };

    if (role === 'student') {
      userData.studentId = studentId;
    }

    if (role === 'vendor') {
      userData.vendorDetails = {
        businessName: vendorDetails.businessName,
        businessType: vendorDetails.businessType,
        location: vendorDetails.location,
        isApproved: false
      };
    }

    const user = new User(userData);
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        college: user.college,
        vendorDetails: user.vendorDetails
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle specific MongoDB errors
    if (error.code === 11000) {
      // Duplicate key error
      if (error.keyPattern && error.keyPattern.email) {
        return res.status(400).json({ message: 'Email already exists. Please use a different email address.' });
      }
      if (error.keyPattern && error.keyPattern.studentId) {
        return res.status(400).json({ message: 'Student ID already exists. Please use a different Student ID.' });
      }
      return res.status(400).json({ message: 'Duplicate information detected. Please check your details.' });
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    
    // Generic server error
    res.status(500).json({ message: 'Server error during registration. Please try again.' });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(400).json({ message: 'Account is deactivated. Please contact admin.' });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        college: user.college,
        vendorDetails: user.vendorDetails,
        profileImage: user.profileImage
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        college: req.user.college,
        phone: req.user.phone,
        studentId: req.user.studentId,
        year: req.user.year,
        department: req.user.department,
        address: req.user.address,
        dateOfBirth: req.user.dateOfBirth,
        emergencyContact: req.user.emergencyContact,
        bio: req.user.bio,
        vendorDetails: req.user.vendorDetails,
        profileImage: req.user.profileImage,
        lastLogin: req.user.lastLogin
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, uploadSingle('profileImage'), async (req, res) => {
  try {
    const { 
      name, 
      phone, 
      college, 
      studentId, 
      year, 
      department, 
      address, 
      dateOfBirth, 
      emergencyContact, 
      bio 
    } = req.body;
    
    const updateData = {};

    // Basic fields
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (college) updateData.college = college;
    
    // Student-specific fields
    if (studentId) updateData.studentId = studentId;
    if (year) updateData.year = year;
    if (department) updateData.department = department;
    if (address) updateData.address = address;
    if (dateOfBirth) updateData.dateOfBirth = new Date(dateOfBirth);
    if (emergencyContact) updateData.emergencyContact = emergencyContact;
    if (bio !== undefined) updateData.bio = bio; // Allow empty string
    
    if (req.file) updateData.profileImage = req.file.path;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error during profile update' });
  }
});

// @route   POST /api/auth/change-password
// @desc    Change user password
// @access  Private
router.post('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await User.findById(req.user._id);
    
    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error during password change' });
  }
});

module.exports = router;