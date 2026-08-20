const express = require('express');
const MarketplaceItem = require('../models/MarketplaceItem');
const { auth, studentAuth, adminAuth } = require('../middleware/auth');
const { uploadMultiple } = require('../middleware/upload');

const router = express.Router();

// @route   GET /api/marketplace
// @desc    Get all approved marketplace items
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      search,
      category,
      condition,
      minPrice,
      maxPrice,
      location,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 12
    } = req.query;

    let query = { status: 'approved' };

    // Search functionality
    if (search) {
      query.$text = { $search: search };
    }

    // Category filter
    if (category) {
      query.category = category;
    }

    // Condition filter
    if (condition) {
      query.condition = condition;
    }

    // Location filter
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    // Sorting
    let sortOptions = {};
    if (sortBy === 'price') {
      sortOptions.price = sortOrder === 'asc' ? 1 : -1;
    } else if (sortBy === 'views') {
      sortOptions.views = sortOrder === 'asc' ? 1 : -1;
    } else if (sortBy === 'title') {
      sortOptions.title = sortOrder === 'asc' ? 1 : -1;
    } else {
      sortOptions.createdAt = sortOrder === 'asc' ? 1 : -1;
    }

    const items = await MarketplaceItem.find(query)
      .populate('seller', 'name college profileImage')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const totalItems = await MarketplaceItem.countDocuments(query);

    res.json({
      items,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: parseInt(page),
      totalItems,
      hasNextPage: page < Math.ceil(totalItems / limit),
      hasPrevPage: page > 1
    });
  } catch (error) {
    console.error('Get marketplace items error:', error);
    res.status(500).json({ message: error?.message || 'Server error' });
  }
});

// @route   GET /api/marketplace/categories
// @desc    Get all marketplace categories
// @access  Public
router.get('/categories', async (req, res) => {
  try {
    const categories = await MarketplaceItem.distinct('category', { status: 'approved' });
    res.json({ categories });
  } catch (error) {
    console.error('Get marketplace categories error:', error);
    res.status(500).json({ message: error?.message || 'Server error' });
  }
});

// @route   GET /api/marketplace/recent
// @desc    Get recently added items
// @access  Public
router.get('/recent', async (req, res) => {
  try {
    const recentItems = await MarketplaceItem.find({ status: 'approved' })
      .populate('seller', 'name college')
      .sort({ createdAt: -1 })
      .limit(8);

    res.json({ items: recentItems });
  } catch (error) {
    console.error('Get recent items error:', error);
    res.status(500).json({ message: error?.message || 'Server error' });
  }
});

// @route   GET /api/marketplace/my-items
// @desc    Get user's marketplace items
// @access  Private (Student)
router.get('/my-items', auth, studentAuth, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    let query = { seller: req.user._id };
    
    if (status) {
      query.status = status;
    }

    const items = await MarketplaceItem.find(query)
      .populate('interestedBuyers.user', 'name college profileImage')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const totalItems = await MarketplaceItem.countDocuments(query);

    res.json({
      items,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: parseInt(page),
      totalItems
    });
  } catch (error) {
    console.error('Get user items error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/marketplace/pending
// @desc    Get pending marketplace items (Admin only)
// @access  Private (Admin)
router.get('/pending', auth, adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const items = await MarketplaceItem.find({ status: 'pending' })
      .populate('seller', 'name college profileImage')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const totalItems = await MarketplaceItem.countDocuments({ status: 'pending' });

    res.json({
      items,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: parseInt(page),
      totalItems
    });
  } catch (error) {
    console.error('Get pending items error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/marketplace/:id
// @desc    Get single marketplace item
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const item = await MarketplaceItem.findById(req.params.id)
      .populate('seller', 'name college phone email profileImage')
      .populate('interestedBuyers.user', 'name college profileImage');

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Increment view count
    item.views += 1;
    await item.save();

    res.json({ item });
  } catch (error) {
    console.error('Get marketplace item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/marketplace
// @desc    Create new marketplace item (Student only)
// @access  Private (Student)
router.post('/', auth, studentAuth, uploadMultiple('images', 5), async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      category,
      condition,
      location,
      contactInfo,
      tags,
      isNegotiable,
      originalPrice,
      purchaseDate,
      warranty,
      deliveryOptions
    } = req.body;

    // Validate required fields
    if (!title || !description || !price || !category || !condition || !location) {
      return res.status(400).json({
        message: 'Title, description, price, category, condition, and location are required'
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        message: 'At least one item image is required'
      });
    }

    // Process uploaded images
    const images = req.files.map(file => file.path);

    // Parse JSON fields if they're strings
    let parsedContactInfo = {};
    let parsedTags = [];
    let parsedWarranty = {};
    let parsedDeliveryOptions = {};

    try {
      if (contactInfo) {
        parsedContactInfo = typeof contactInfo === 'string' ? JSON.parse(contactInfo) : contactInfo;
      }
      if (tags) {
        parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;
      }
      if (warranty) {
        parsedWarranty = typeof warranty === 'string' ? JSON.parse(warranty) : warranty;
      }
      if (deliveryOptions) {
        parsedDeliveryOptions = typeof deliveryOptions === 'string' ? JSON.parse(deliveryOptions) : deliveryOptions;
      }
    } catch (parseError) {
      return res.status(400).json({ message: 'Invalid JSON format in contact info, tags, warranty, or delivery options' });
    }

    const item = new MarketplaceItem({
      title,
      description,
      price: parseFloat(price),
      category,
      condition,
      images,
      seller: req.user._id,
      location,
      contactInfo: parsedContactInfo,
      tags: parsedTags,
      isNegotiable: isNegotiable === 'true',
      originalPrice: originalPrice ? parseFloat(originalPrice) : undefined,
      purchaseDate: purchaseDate ? new Date(purchaseDate) : undefined,
      warranty: parsedWarranty,
      deliveryOptions: parsedDeliveryOptions
    });

    await item.save();
    await item.populate('seller', 'name college');

    res.status(201).json({
      message: 'Item submitted for approval successfully',
      item
    });
  } catch (error) {
    console.error('Create marketplace item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/marketplace/:id
// @desc    Update marketplace item (Owner only)
// @access  Private (Student)
router.put('/:id', auth, studentAuth, uploadMultiple('images', 5), async (req, res) => {
  try {
    const item = await MarketplaceItem.findOne({
      _id: req.params.id,
      seller: req.user._id
    });

    if (!item) {
      return res.status(404).json({ message: 'Item not found or unauthorized' });
    }

    // Don't allow updates if item is sold
    if (item.status === 'sold') {
      return res.status(400).json({ message: 'Cannot update sold items' });
    }

    const {
      title,
      description,
      price,
      category,
      condition,
      location,
      contactInfo,
      tags,
      isNegotiable,
      originalPrice,
      warranty,
      deliveryOptions
    } = req.body;

    // Update fields
    if (title) item.title = title;
    if (description) item.description = description;
    if (price) item.price = parseFloat(price);
    if (category) item.category = category;
    if (condition) item.condition = condition;
    if (location) item.location = location;
    if (isNegotiable !== undefined) item.isNegotiable = isNegotiable === 'true';
    if (originalPrice) item.originalPrice = parseFloat(originalPrice);

    // Parse and update JSON fields
    try {
      if (contactInfo) {
        item.contactInfo = typeof contactInfo === 'string' ? JSON.parse(contactInfo) : contactInfo;
      }
      if (tags) {
        item.tags = typeof tags === 'string' ? JSON.parse(tags) : tags;
      }
      if (warranty) {
        item.warranty = typeof warranty === 'string' ? JSON.parse(warranty) : warranty;
      }
      if (deliveryOptions) {
        item.deliveryOptions = typeof deliveryOptions === 'string' ? JSON.parse(deliveryOptions) : deliveryOptions;
      }
    } catch (parseError) {
      return res.status(400).json({ message: 'Invalid JSON format in contact info, tags, warranty, or delivery options' });
    }

    // Update images if new ones are uploaded
    if (req.files && req.files.length > 0) {
      item.images = req.files.map(file => file.path);
    }

    // Reset status to pending if it was rejected
    if (item.status === 'rejected') {
      item.status = 'pending';
      item.rejectionReason = undefined;
    }

    await item.save();
    await item.populate('seller', 'name college');

    res.json({
      message: 'Item updated successfully',
      item
    });
  } catch (error) {
    console.error('Update marketplace item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/marketplace/:id
// @desc    Delete marketplace item (Owner only)
// @access  Private (Student)
router.delete('/:id', auth, studentAuth, async (req, res) => {
  try {
    const item = await MarketplaceItem.findOneAndDelete({
      _id: req.params.id,
      seller: req.user._id
    });

    if (!item) {
      return res.status(404).json({ message: 'Item not found or unauthorized' });
    }

    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Delete marketplace item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/marketplace/:id/interest
// @desc    Express interest in buying item
// @access  Private (Student)
router.post('/:id/interest', auth, studentAuth, async (req, res) => {
  try {
    const { message } = req.body;
    
    const item = await MarketplaceItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    if (item.status !== 'approved') {
      return res.status(400).json({ message: 'Item is not available for purchase' });
    }

    if (item.seller.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot express interest in your own item' });
    }

    // Check if user already expressed interest
    const existingInterest = item.interestedBuyers.find(
      buyer => buyer.user.toString() === req.user._id.toString()
    );

    if (existingInterest) {
      return res.status(400).json({ message: 'You have already expressed interest in this item' });
    }

    // Add interested buyer
    item.interestedBuyers.push({
      user: req.user._id,
      message: message || 'Interested in buying this item'
    });

    await item.save();

    res.json({
      message: 'Interest expressed successfully',
      item
    });
  } catch (error) {
    console.error('Express interest error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/marketplace/:id/mark-sold
// @desc    Mark item as sold
// @access  Private (Student - Owner)
router.put('/:id/mark-sold', auth, studentAuth, async (req, res) => {
  try {
    const { buyerId, finalPrice } = req.body;
    
    const item = await MarketplaceItem.findOne({
      _id: req.params.id,
      seller: req.user._id
    });

    if (!item) {
      return res.status(404).json({ message: 'Item not found or unauthorized' });
    }

    if (item.status === 'sold') {
      return res.status(400).json({ message: 'Item is already marked as sold' });
    }

    item.status = 'sold';
    item.soldTo = buyerId;
    item.soldAt = new Date();
    item.finalPrice = finalPrice ? parseFloat(finalPrice) : item.price;

    await item.save();

    res.json({
      message: 'Item marked as sold successfully',
      item
    });
  } catch (error) {
    console.error('Mark sold error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});





// @route   PUT /api/marketplace/:id/approve
// @desc    Approve marketplace item (Admin only)
// @access  Private (Admin)
router.put('/:id/approve', auth, adminAuth, async (req, res) => {
  try {
    const item = await MarketplaceItem.findByIdAndUpdate(
      req.params.id,
      {
        status: 'approved',
        approvedBy: req.user._id,
        approvedAt: new Date()
      },
      { new: true }
    ).populate('seller', 'name college');

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.json({
      message: 'Item approved successfully',
      item
    });
  } catch (error) {
    console.error('Approve item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/marketplace/:id/reject
// @desc    Reject marketplace item (Admin only)
// @access  Private (Admin)
router.put('/:id/reject', auth, adminAuth, async (req, res) => {
  try {
    const { reason } = req.body;
    
    const item = await MarketplaceItem.findByIdAndUpdate(
      req.params.id,
      {
        status: 'rejected',
        rejectionReason: reason || 'Item does not meet marketplace guidelines'
      },
      { new: true }
    ).populate('seller', 'name college');

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.json({
      message: 'Item rejected successfully',
      item
    });
  } catch (error) {
    console.error('Reject item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;