const express = require('express');
const Product = require('../models/Product');
const { auth, vendorAuth } = require('../middleware/auth');
const { uploadMultiple } = require('../middleware/upload');

const router = express.Router();

// @route   GET /api/products
// @desc    Get all products with filters
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { 
      search, 
      category, 
      vendor, 
      minPrice, 
      maxPrice, 
      isVegetarian, 
      isVegan,
      spiceLevel,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1, 
      limit = 12 
    } = req.query;

    let query = { isAvailable: true };

    // Search functionality
    if (search) {
      query.$text = { $search: search };
    }

    // Category filter
    if (category) {
      query.category = category;
    }

    // Vendor filter
    if (vendor) {
      query.vendor = vendor;
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    // Dietary filters
    if (isVegetarian === 'true') {
      query.isVegetarian = true;
    }
    if (isVegan === 'true') {
      query.isVegan = true;
    }

    // Spice level filter
    if (spiceLevel) {
      query.spiceLevel = spiceLevel;
    }

    // Sorting
    let sortOptions = {};
    if (sortBy === 'price') {
      sortOptions.price = sortOrder === 'asc' ? 1 : -1;
    } else if (sortBy === 'rating') {
      sortOptions['rating.average'] = sortOrder === 'asc' ? 1 : -1;
    } else if (sortBy === 'name') {
      sortOptions.name = sortOrder === 'asc' ? 1 : -1;
    } else {
      sortOptions.createdAt = sortOrder === 'asc' ? 1 : -1;
    }

    const products = await Product.find(query)
      .populate('vendor', 'name vendorDetails.businessName vendorDetails.location')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const totalProducts = await Product.countDocuments(query);

    res.json({
      products,
      totalPages: Math.ceil(totalProducts / limit),
      currentPage: parseInt(page),
      totalProducts,
      hasNextPage: page < Math.ceil(totalProducts / limit),
      hasPrevPage: page > 1
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: error?.message || 'Server error' });
  }
});

// @route   GET /api/products/categories
// @desc    Get all product categories
// @access  Public
router.get('/categories', async (req, res) => {
  try {
    const categories = await Product.distinct('category', { isAvailable: true });
    res.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: error?.message || 'Server error' });
  }
});

// @route   GET /api/products/featured
// @desc    Get featured products (high rated, popular)
// @access  Public
router.get('/featured', async (req, res) => {
  try {
    const featuredProducts = await Product.find({
      isAvailable: true,
      isFeatured: true
    })
    .populate('vendor', 'name vendorDetails.businessName')
    .sort({ 'rating.average': -1, createdAt: -1 })
    .limit(8);

    res.json({ products: featuredProducts });
  } catch (error) {
    console.error('Get featured products error:', error);
    res.status(500).json({ message: error?.message || 'Server error' });
  }
});

// @route   GET /api/products/:id
// @desc    Get single product
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('vendor', 'name vendorDetails.businessName vendorDetails.location phone email')
      .populate('reviews.user', 'name profileImage');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ product });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ message: error?.message || 'Server error' });
  }
});

// @route   POST /api/products
// @desc    Create new product (Vendor only)
// @access  Private (Vendor)
router.post('/', auth, vendorAuth, uploadMultiple('images', 5), async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      preparationTime,
      ingredients,
      nutritionalInfo,
      tags,
      isVegetarian,
      isVegan,
      spiceLevel
    } = req.body;

    // Validate required fields
    if (!name || !description || !price || !category) {
      return res.status(400).json({ 
        message: 'Name, description, price, and category are required' 
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ 
        message: 'At least one product image is required' 
      });
    }

    // Process uploaded images
    const images = req.files.map(file => file.path);

    // Parse JSON fields if they're strings
    let parsedIngredients = [];
    let parsedTags = [];
    let parsedNutritionalInfo = {};

    try {
      if (ingredients) {
        parsedIngredients = typeof ingredients === 'string' ? JSON.parse(ingredients) : ingredients;
      }
      if (tags) {
        parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;
      }
      if (nutritionalInfo) {
        parsedNutritionalInfo = typeof nutritionalInfo === 'string' ? JSON.parse(nutritionalInfo) : nutritionalInfo;
      }
    } catch (parseError) {
      return res.status(400).json({ message: 'Invalid JSON format in ingredients, tags, or nutritional info' });
    }

    const product = new Product({
      name,
      description,
      price: parseFloat(price),
      category,
      images,
      vendor: req.user._id,
      preparationTime: preparationTime ? parseInt(preparationTime) : 15,
      ingredients: parsedIngredients,
      nutritionalInfo: parsedNutritionalInfo,
      tags: parsedTags,
      isVegetarian: isVegetarian === 'true',
      isVegan: isVegan === 'true',
      spiceLevel: spiceLevel || 'mild'
    });

    await product.save();
    await product.populate('vendor', 'name vendorDetails.businessName');

    res.status(201).json({
      message: 'Product created successfully',
      product
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/products/:id
// @desc    Update product (Vendor only)
// @access  Private (Vendor)
router.put('/:id', auth, vendorAuth, uploadMultiple('images', 5), async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      vendor: req.user._id
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found or unauthorized' });
    }

    const {
      name,
      description,
      price,
      category,
      preparationTime,
      ingredients,
      nutritionalInfo,
      tags,
      isVegetarian,
      isVegan,
      spiceLevel,
      isAvailable
    } = req.body;

    // Update fields
    if (name) product.name = name;
    if (description) product.description = description;
    if (price) product.price = parseFloat(price);
    if (category) product.category = category;
    if (preparationTime) product.preparationTime = parseInt(preparationTime);
    if (isAvailable !== undefined) product.isAvailable = isAvailable === 'true';
    if (isVegetarian !== undefined) product.isVegetarian = isVegetarian === 'true';
    if (isVegan !== undefined) product.isVegan = isVegan === 'true';
    if (spiceLevel) product.spiceLevel = spiceLevel;

    // Parse and update JSON fields
    try {
      if (ingredients) {
        product.ingredients = typeof ingredients === 'string' ? JSON.parse(ingredients) : ingredients;
      }
      if (tags) {
        product.tags = typeof tags === 'string' ? JSON.parse(tags) : tags;
      }
      if (nutritionalInfo) {
        product.nutritionalInfo = typeof nutritionalInfo === 'string' ? JSON.parse(nutritionalInfo) : nutritionalInfo;
      }
    } catch (parseError) {
      return res.status(400).json({ message: 'Invalid JSON format in ingredients, tags, or nutritional info' });
    }

    // Update images if new ones are uploaded
    if (req.files && req.files.length > 0) {
      product.images = req.files.map(file => file.path);
    }

    await product.save();
    await product.populate('vendor', 'name vendorDetails.businessName');

    res.json({
      message: 'Product updated successfully',
      product
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/products/:id
// @desc    Delete product (Vendor only)
// @access  Private (Vendor)
router.delete('/:id', auth, vendorAuth, async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({
      _id: req.params.id,
      vendor: req.user._id
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found or unauthorized' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/products/:id/review
// @desc    Add product review
// @access  Private
router.post('/:id/review', auth, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user already reviewed this product
    const existingReview = product.reviews.find(
      review => review.user.toString() === req.user._id.toString()
    );

    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this product' });
    }

    // Add new review
    product.reviews.push({
      user: req.user._id,
      rating: parseInt(rating),
      comment: comment || ''
    });

    // Update average rating
    const totalRating = product.reviews.reduce((sum, review) => sum + review.rating, 0);
    product.rating.average = totalRating / product.reviews.length;
    product.rating.count = product.reviews.length;

    await product.save();
    await product.populate('reviews.user', 'name profileImage');

    res.json({
      message: 'Review added successfully',
      product
    });
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/products/vendor/my-products
// @desc    Get vendor's products
// @access  Private (Vendor)
router.get('/vendor/my-products', auth, vendorAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, category, isAvailable } = req.query;
    
    let query = { vendor: req.user._id };
    
    if (category) {
      query.category = category;
    }
    
    if (isAvailable !== undefined) {
      query.isAvailable = isAvailable === 'true';
    }

    const products = await Product.find(query)
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
    console.error('Get vendor products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;