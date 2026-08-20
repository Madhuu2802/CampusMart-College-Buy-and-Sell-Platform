const mongoose = require('mongoose');
const User = require('./models/User');
const Product = require('./models/Product');
const MarketplaceItem = require('./models/MarketplaceItem');
require('dotenv').config();

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/campusmart');
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({ role: 'vendor' });
    await Product.deleteMany({});
    await MarketplaceItem.deleteMany({});
    console.log('✅ Cleared existing sample data');

    // No vendors created - Popular Vendors section will be empty
    console.log('✅ No vendors created (as requested)');

    // Find or create admin user to serve as seller for marketplace items
    let adminUser = await User.findOne({ email: 'admin@campusmart.com' });
    if (!adminUser) {
      adminUser = new User({
        name: 'Campus Admin',
        email: 'admin@campusmart.com',
        password: 'admin123',
        role: 'admin',
        phone: '+1234567890',
        college: 'Campus University'
      });
      await adminUser.save();
      console.log('✅ Admin user created');
    } else {
      console.log('✅ Using existing admin user');
    }

    // No products created since no vendors exist
    console.log('✅ No products created (no vendors available)');

    // Create sample marketplace items
    const marketplaceItems = [
      {
        title: 'Used iPhone 12',
        description: 'iPhone 12 in excellent condition, barely used with original box',
        price: 35000,
        category: 'electronics',
        condition: 'like-new',
        location: 'Campus Hostel A',
        seller: adminUser._id,
        images: ['https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=300&fit=crop&crop=center'],
        status: 'approved',
        isNegotiable: true,
        contactInfo: {
          phone: '+1234567890',
          email: 'seller1@campus.com',
          preferredContact: 'phone'
        }
      },
      {
        title: 'Study Table',
        description: 'Wooden study table in good condition, perfect for dorm room',
        price: 2500,
        category: 'furniture',
        condition: 'good',
        location: 'Campus Hostel B',
        seller: adminUser._id,
        images: ['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop&crop=center'],
        status: 'approved',
        isNegotiable: true,
        contactInfo: {
          phone: '+1234567891',
          email: 'seller2@campus.com',
          preferredContact: 'both'
        }
      },
      {
        title: 'Engineering Textbooks',
        description: 'Complete set of engineering textbooks for 2nd year students',
        price: 1200,
        category: 'books',
        condition: 'good',
        location: 'Main Campus',
        seller: adminUser._id,
        images: ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=300&fit=crop&crop=center'],
        status: 'approved',
        isNegotiable: true,
        contactInfo: {
          phone: '+1234567892',
          email: 'seller3@campus.com',
          preferredContact: 'email'
        }
      },
      {
        title: 'Gaming Headset',
        description: 'High-quality gaming headset with microphone, perfect for gaming',
        price: 1800,
        category: 'electronics',
        condition: 'like-new',
        location: 'Campus Hostel C',
        seller: adminUser._id,
        images: ['https://images.unsplash.com/photo-1599669454699-248893623440?w=400&h=300&fit=crop&crop=center'],
        status: 'approved',
        isNegotiable: false,
        contactInfo: {
          phone: '+1234567890',
          email: 'seller1@campus.com',
          preferredContact: 'phone'
        }
      }
    ];

    await MarketplaceItem.insertMany(marketplaceItems);
    console.log('✅ Sample marketplace items created');

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📊 Created:');
    console.log('- 0 Vendors (removed as requested)');
    console.log('- 0 Products (no vendors available)');
    console.log('- 4 Marketplace Items (all approved)');
    console.log('- 1 Admin User (for marketplace items)');
    console.log('\n🚀 Dashboard should now display content!');
    console.log('\n📋 Note: Popular Vendors section will be empty as requested');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

console.log('🌱 Starting database seeding...');
seedData();