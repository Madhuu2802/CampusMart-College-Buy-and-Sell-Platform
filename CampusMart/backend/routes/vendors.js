const express = require('express');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { auth, vendorAuth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/vendors
// @desc    Get all approved vendors
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { search, location, businessType } = req.query;
    
    let query = {
      role: 'vendor',
      'vendorDetails.isApproved': true,
      isActive: true
    };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { 'vendorDetails.businessName': { $regex: search, $options: 'i' } }
      ];
    }

    if (location) {
      query['vendorDetails.location'] = { $regex: location, $options: 'i' };
    }

    if (businessType) {
      query['vendorDetails.businessType'] = businessType;
    }

    const vendors = await User.find(query)
      .select('name email vendorDetails profileImage createdAt')
      .sort({ 'vendorDetails.approvedAt': -1 });

    res.json({
      vendors,
      count: vendors.length
    });
  } catch (error) {
    console.error('Get vendors error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/vendors/apply
// @desc    Apply to become a vendor (sets role and pending approval)
// @access  Private (Authenticated)
router.post('/apply', auth, async (req, res) => {
  try {
    const { businessName, businessType, location } = req.body;

    if (!businessName || !businessType || !location) {
      return res.status(400).json({ message: 'businessName, businessType, and location are required' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Policy: Only users already registered as 'vendor' may submit or update application details
    if (user.role !== 'vendor') {
      return res.status(403).json({
        message: 'Students cannot become vendors via application. Please register a new vendor account.'
      });
    }

    // If already a vendor
    if (user.vendorDetails?.isApproved) {
      return res.status(400).json({ message: 'You are already an approved vendor' });
    }

    // Allow updating application details if pending
    user.vendorDetails = {
      ...user.vendorDetails,
      businessName,
      businessType,
      location,
      isApproved: false
    };
    await user.save();
    const safeUser = await User.findById(user._id).select('-password');
    return res.json({ message: 'Application updated. Awaiting admin approval.', user: safeUser });
  } catch (error) {
    console.error('Vendor apply error:', error?.message || error);
    res.status(500).json({ message: error?.message || 'Server error' });
  }
});

// @route   GET /api/vendors/:id
// @desc    Get vendor details
// @access  Public
// @route   GET /api/vendors/pending
// @desc    Get pending vendor approvals (Admin only)
// @access  Private (Admin)
router.get('/pending', auth, adminAuth, async (req, res) => {
  try {
    const pendingVendors = await User.find({
      role: 'vendor',
      'vendorDetails.isApproved': false,
      isActive: true
    }).select('name email phone vendorDetails createdAt');

    res.json({
      vendors: pendingVendors,
      count: pendingVendors.length
    });
  } catch (error) {
    console.error('Get pending vendors error:', error?.message || error);
    res.status(500).json({ message: error?.message || 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const vendor = await User.findOne({
      _id: req.params.id,
      role: 'vendor',
      'vendorDetails.isApproved': true,
      isActive: true
    }).select('name email vendorDetails profileImage createdAt');

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    // Get vendor's products
    const products = await Product.find({
      vendor: vendor._id,
      isAvailable: true
    }).sort({ createdAt: -1 });

    res.json({
      vendor,
      products,
      productCount: products.length
    });
  } catch (error) {
    console.error('Get vendor details error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/vendors/dashboard/stats
// @desc    Get vendor dashboard statistics
// @access  Private (Vendor)
router.get('/dashboard/stats', auth, vendorAuth, async (req, res) => {
  try {
    const vendorId = req.user._id;

    // Get product count
    const productCount = await Product.countDocuments({ vendor: vendorId });
    const activeProductCount = await Product.countDocuments({ 
      vendor: vendorId, 
      isAvailable: true 
    });

    // Get order statistics
    const totalOrders = await Order.countDocuments({ vendor: vendorId });
    const pendingOrders = await Order.countDocuments({ 
      vendor: vendorId, 
      status: { $in: ['pending', 'confirmed', 'preparing'] } 
    });
    const completedOrders = await Order.countDocuments({ 
      vendor: vendorId, 
      status: 'delivered' 
    });

    // Get revenue (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const revenueResult = await Order.aggregate([
      {
        $match: {
          vendor: vendorId,
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

    // Get recent orders
    const recentOrders = await Order.find({ vendor: vendorId })
      .populate('customer', 'name email phone')
      .populate('items.product', 'name price')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      stats: {
        productCount,
        activeProductCount,
        totalOrders,
        pendingOrders,
        completedOrders,
        monthlyRevenue
      },
      recentOrders
    });
  } catch (error) {
    console.error('Vendor dashboard stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/vendors/orders
// @desc    Get vendor orders
// @access  Private (Vendor)
router.get('/orders', auth, vendorAuth, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const vendorId = req.user._id;

    let query = { vendor: vendorId };
    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate('customer', 'name email phone')
      .populate('items.product', 'name price images')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const totalOrders = await Order.countDocuments(query);

    res.json({
      orders,
      totalPages: Math.ceil(totalOrders / limit),
      currentPage: page,
      totalOrders
    });
  } catch (error) {
    console.error('Get vendor orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/vendors/orders/:orderId/status
// @desc    Update order status
// @access  Private (Vendor)
router.put('/orders/:orderId/status', auth, vendorAuth, async (req, res) => {
  try {
    const { status, note } = req.body;
    const vendorId = req.user._id;

    const order = await Order.findOne({
      _id: req.params.orderId,
      vendor: vendorId
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Validate status transition
    const validTransitions = {
      'pending': ['confirmed', 'cancelled'],
      'confirmed': ['preparing', 'cancelled'],
      'preparing': ['ready', 'cancelled'],
      'ready': ['delivered'],
      'delivered': [],
      'cancelled': []
    };

    if (!validTransitions[order.status].includes(status)) {
      return res.status(400).json({ 
        message: `Cannot change status from ${order.status} to ${status}` 
      });
    }

    // Update order status
    order.status = status;
    order.timeline.push({
      status,
      timestamp: new Date(),
      note: note || `Order ${status} by vendor`
    });

    if (status === 'delivered') {
      order.deliveryDetails.actualTime = new Date();
    }

    await order.save();

    res.json({
      message: 'Order status updated successfully',
      order
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/vendors/profile
// @desc    Update vendor profile
// @access  Private (Vendor)
router.put('/profile', auth, vendorAuth, async (req, res) => {
  try {
    const { businessName, businessType, location } = req.body;
    const vendorId = req.user._id;

    const updateData = {};
    if (businessName) updateData['vendorDetails.businessName'] = businessName;
    if (businessType) updateData['vendorDetails.businessType'] = businessType;
    if (location) updateData['vendorDetails.location'] = location;

    const vendor = await User.findByIdAndUpdate(
      vendorId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      message: 'Vendor profile updated successfully',
      vendor
    });
  } catch (error) {
    console.error('Update vendor profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


// @route   PUT /api/vendors/:id/approve
// @desc    Approve vendor (Admin only)
// @access  Private (Admin)
router.put('/:id/approve', auth, adminAuth, async (req, res) => {
  try {
    const vendor = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'vendor' },
      {
        'vendorDetails.isApproved': true,
        'vendorDetails.approvedBy': req.user._id,
        'vendorDetails.approvedAt': new Date()
      },
      { new: true }
    ).select('-password');

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    res.json({
      message: 'Vendor approved successfully',
      vendor
    });
  } catch (error) {
    console.error('Approve vendor error:', error?.message || error);
    res.status(500).json({ message: error?.message || 'Server error' });
  }
});

module.exports = router;