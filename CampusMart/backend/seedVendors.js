const mongoose = require('mongoose');
const User = require('./models/User');
const Product = require('./models/Product');
require('dotenv').config();

async function upsertVendor(v) {
  const existing = await User.findOne({ email: v.email });
  if (existing) {
    console.log(`✅ Vendor exists: ${v.vendorDetails.businessName} (${v.email})`);
    return existing;
  }

  const user = new User({
    name: v.name,
    email: v.email,
    password: v.password || 'vendor123',
    role: 'vendor',
    phone: v.phone || '+1000000000',
    college: v.college || 'Campus University',
    vendorDetails: {
      businessName: v.vendorDetails.businessName,
      businessType: v.vendorDetails.businessType,
      location: v.vendorDetails.location,
      isApproved: true,
      approvedAt: new Date()
    }
  });
  await user.save();
  console.log(`🌟 Vendor created: ${v.vendorDetails.businessName} (${v.email})`);
  return user;
}

async function upsertProduct(vendor, p) {
  const existing = await Product.findOne({ name: p.name, vendor: vendor._id });
  if (existing) {
    console.log(`  ✅ Product exists: ${p.name}`);
    return existing;
  }

  const product = new Product({
    name: p.name,
    description: p.description,
    price: p.price,
    category: p.category,
    images: p.images,
    vendor: vendor._id,
    isAvailable: true,
    isFeatured: !!p.isFeatured,
    tags: p.tags || []
  });
  await product.save();
  console.log(`  🍽️ Product added: ${p.name}`);
  return product;
}

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/campusmart');
    console.log('✅ Connected to MongoDB');

    const vendors = [
      {
        name: 'Spice Hub',
        email: 'spicehub@campusmart.com',
        password: 'vendor123',
        phone: '+1234567001',
        vendorDetails: {
          businessName: 'Spice Hub',
          businessType: 'fast-food',
          location: 'Main Canteen'
        },
        products: [
          {
            name: 'Masala Maggie Bowl',
            description: 'Spicy maggie with veggies and special masala.',
            price: 60,
            category: 'meals',
            images: ['https://images.unsplash.com/photo-1604908176997-46efc7e4b3f5?w=400&h=300&fit=crop&crop=center'],
            tags: ['spicy', 'quick']
          },
          {
            name: 'Paneer Roll',
            description: 'Grilled paneer tikka wrapped in fresh roti.',
            price: 90,
            category: 'snacks',
            images: ['https://images.unsplash.com/photo-1601050690597-8f012f0528a7?w=400&h=300&fit=crop&crop=center'],
            tags: ['vegetarian']
          }
        ]
      },
      {
        name: 'Sweet Treats',
        email: 'sweettreats@campusmart.com',
        password: 'vendor123',
        phone: '+1234567002',
        vendorDetails: {
          businessName: 'Sweet Treats',
          businessType: 'desserts',
          location: 'Hostel Block A'
        },
        products: [
          {
            name: 'Chocolate Brownie',
            description: 'Rich chocolate brownie with nuts.',
            price: 70,
            category: 'desserts',
            images: ['https://images.unsplash.com/photo-1548365328-9b6c2a23ef34?w=400&h=300&fit=crop&crop=center']
          },
          {
            name: 'Cold Coffee',
            description: 'Iced coffee with a smooth blend.',
            price: 80,
            category: 'beverages',
            images: ['https://images.unsplash.com/photo-1512568400610-62da28bc8a13?w=400&h=300&fit=crop&crop=center']
          }
        ]
      },
      {
        name: 'Healthy Bites',
        email: 'healthybites@campusmart.com',
        password: 'vendor123',
        phone: '+1234567003',
        vendorDetails: {
          businessName: 'Healthy Bites',
          businessType: 'healthy',
          location: 'Sports Complex'
        },
        products: [
          {
            name: 'Grilled Veg Salad',
            description: 'Fresh salad with grilled vegetables and light dressing.',
            price: 120,
            category: 'healthy',
            images: ['https://images.unsplash.com/photo-1551183053-bf91a1d81136?w=400&h=300&fit=crop&crop=center']
          },
          {
            name: 'Fruit Bowl',
            description: 'Seasonal fruits served chilled.',
            price: 100,
            category: 'healthy',
            images: ['https://images.unsplash.com/photo-1518081461907-8d0f0a1f5c3d?w=400&h=300&fit=crop&crop=center']
          }
        ]
      }
    ];

    for (const v of vendors) {
      const vendorUser = await upsertVendor(v);
      for (const p of v.products) {
        await upsertProduct(vendorUser, p);
      }
    }

    console.log('\n🎉 Dummy vendors and products seeded successfully!');
    console.log('- Vendors: Spice Hub, Sweet Treats, Healthy Bites');
    console.log('- Default password for vendors: vendor123');
  } catch (error) {
    console.error('❌ Error seeding vendors:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

run();