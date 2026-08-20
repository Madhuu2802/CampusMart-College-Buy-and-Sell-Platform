const express = require('express');
const User = require('../models/User');
const Product = require('../models/Product');
const MarketplaceItem = require('../models/MarketplaceItem');
const Order = require('../models/Order');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard statistics
// @access  Private (Admin)
router.get('/dashboard', auth, adminAuth, async (req, res) => {
  try {
    // Get user statistics
    const totalUsers = await User.countDocuments();
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalVendors = await User.countDocuments({ role: 'vendor' });
    const approvedVendors = await User.countDocuments({ 
      role: 'vendor', 
      'vendorDetails.isApproved': true 
    });
    const pendingVendors = await User.countDocuments({ 
      role: 'vendor', 
      'vendorDetails.isApproved': false 
    });

    // Get product statistics
    const totalProducts = await Product.countDocuments();
    const activeProducts = await Product.countDocuments({ isAvailable: true });

    // Get marketplace statistics
    const totalMarketplaceItems = await MarketplaceItem.countDocuments();
    const pendingMarketplaceItems = await MarketplaceItem.countDocuments({ status: 'pending' });
    const approvedMarketplaceItems = await MarketplaceItem.countDocuments({ status: 'approved' });

    // Get order statistics
    const totalOrders = await Order.countDocuments();
    const completedOrders = await Order.countDocuments({ status: 'delivered' });
    const pendingOrders = await Order.countDocuments({ 
      status: { $in: ['pending', 'confirmed', 'preparing', 'ready'] } 
    });

    // Get revenue statistics (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const revenueResult = await Order.aggregate([
      {
        $match: {
          paymentStatus: 'paid',
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$finalAmount' }
        }
      }
    ]);

    const monthlyRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

    // Get recent activities
    const recentUsers = await User.find()
      .select('name email role createdAt vendorDetails.isApproved')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentOrders = await Order.find()
      .populate('customer', 'name email')
      .populate('vendor', 'name vendorDetails.businessName')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      stats: {
        users: {
          total: totalUsers,
          students: totalStudents,
          vendors: totalVendors,
          approvedVendors,
          pendingVendors
        },
        products: {
          total: totalProducts,
          active: activeProducts
        },
        marketplace: {
          total: totalMarketplaceItems,
          pending: pendingMarketplaceItems,
          approved: approvedMarketplaceItems
        },
        orders: {
          total: totalOrders,
          completed: completedOrders,
          pending: pendingOrders
        },
        revenue: {
          monthly: monthlyRevenue
        }
      },
      recentActivities: {
        users: recentUsers,
        orders: recentOrders
      }
    });
  } catch (error) {
    console.error('Admin dashboard error:', error?.message || error);
    res.status(500).json({ message: error?.message || 'Server error' });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users with filters
// @access  Private (Admin)
router.get('/users', auth, adminAuth, async (req, res) => {
  try {
    const { role, search, page = 1, limit = 10 } = req.query;
    
    let query = {};
    
    if (role) {
      query.role = role;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const totalUsers = await User.countDocuments(query);

    res.json({
      users,
      totalPages: Math.ceil(totalUsers / limit),
      currentPage: parseInt(page),
      totalUsers
    });
  } catch (error) {
    console.error('Get users error:', error?.message || error);
    res.status(500).json({ message: error?.message || 'Server error' });
  }
});

// @route   PUT /api/admin/users/:id/toggle-status
// @desc    Toggle user active status
// @access  Private (Admin)
router.put('/users/:id/toggle-status', auth, adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('Toggle user status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/orders
// @desc    Get all orders with filters
// @access  Private (Admin)
router.get('/orders', auth, adminAuth, async (req, res) => {
  try {
    const { status, paymentStatus, page = 1, limit = 10 } = req.query;
    
    let query = {};
    
    if (status) {
      query.status = status;
    }
    
    if (paymentStatus) {
      query.paymentStatus = paymentStatus;
    }

    const orders = await Order.find(query)
      .populate('customer', 'name email phone')
      .populate('vendor', 'name vendorDetails.businessName')
      .populate('items.product', 'name price')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const totalOrders = await Order.countDocuments(query);

    res.json({
      orders,
      totalPages: Math.ceil(totalOrders / limit),
      currentPage: parseInt(page),
      totalOrders
    });
  } catch (error) {
    console.error('Get orders error:', error?.message || error);
    res.status(500).json({ message: error?.message || 'Server error' });
  }
});

// @route   GET /api/admin/products
// @desc    Get all products with filters
// @access  Private (Admin)
router.get('/products', auth, adminAuth, async (req, res) => {
  try {
    const { category, vendor, isAvailable, page = 1, limit = 10 } = req.query;
    
    let query = {};
    
    if (category) {
      query.category = category;
    }
    
    if (vendor) {
      query.vendor = vendor;
    }
    
    if (isAvailable !== undefined) {
      query.isAvailable = isAvailable === 'true';
    }

    const products = await Product.find(query)
      .populate('vendor', 'name vendorDetails.businessName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const totalProducts = await Product.countDocuments(query);

    res.json({
      products,
      totalPages: Math.ceil(totalProducts / limit),
      currentPage: parseInt(page),
      totalProducts
    });
  } catch (error) {
    console.error('Get products error:', error?.message || error);
    res.status(500).json({ message: error?.message || 'Server error' });
  }
});

// @route   DELETE /api/admin/products/:id
// @desc    Delete product (Admin)
// @access  Private (Admin)
router.delete('/products/:id', auth, adminAuth, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error?.message || error);
    res.status(500).json({ message: error?.message || 'Server error' });
  }
});

// @route   GET /api/admin/analytics
// @desc    Get analytics data
// @access  Private (Admin)
router.get('/analytics', auth, adminAuth, async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Daily revenue for the period
    const dailyRevenue = await Order.aggregate([
      {
        $match: {
          paymentStatus: 'paid',
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          revenue: { $sum: '$finalAmount' },
          orders: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
      }
    ]);

    // Top vendors by revenue
    const topVendors = await Order.aggregate([
      {
        $match: {
          paymentStatus: 'paid',
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$vendor',
          revenue: { $sum: '$finalAmount' },
          orders: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'vendor'
        }
      },
      {
        $unwind: '$vendor'
      },
      {
        $project: {
          vendorName: '$vendor.name',
          businessName: '$vendor.vendorDetails.businessName',
          revenue: 1,
          orders: 1
        }
      },
      {
        $sort: { revenue: -1 }
      },
      {
        $limit: 10
      }
    ]);

    // Popular categories
    const popularCategories = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          avgRating: { $avg: '$rating.average' }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    res.json({
      dailyRevenue,
      topVendors,
      popularCategories,
      period: days
    });
  } catch (error) {
    console.error('Analytics error:', error?.message || error);
    res.status(500).json({ message: error?.message || 'Server error' });
  }
});

module.exports = router;