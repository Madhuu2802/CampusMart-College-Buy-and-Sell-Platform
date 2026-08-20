const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/campusmart', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Connected to MongoDB');
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@campusmart.com' });
    if (existingAdmin) {
      console.log('Admin user already exists!');
      process.exit(0);
    }
    
    // Create admin user (password will be hashed by pre-save middleware)
    const adminUser = new User({
      name: 'Campus Mart Admin',
      email: 'admin@campusmart.com',
      password: 'admin123', // Plain password - will be hashed by mongoose pre-save
      role: 'admin',
      phone: '+1234567890',
      college: 'Campus Mart University'
    });
    
    await adminUser.save();
    console.log('Admin user created successfully!');
    console.log('Email: admin@campusmart.com');
    console.log('Password: admin123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
};

createAdmin();