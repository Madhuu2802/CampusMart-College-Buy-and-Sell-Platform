const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const testLogin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/campusmart');
    console.log('Connected to MongoDB');
    
    // Test credentials
    const testEmail = 'admin@campusmart.com';
    const testPassword = 'admin123';
    
    console.log(`\nTesting login with:`);
    console.log(`Email: ${testEmail}`);
    console.log(`Password: ${testPassword}`);
    
    // Find user by email
    const user = await User.findOne({ email: testEmail });
    if (!user) {
      console.log('❌ User not found!');
      process.exit(1);
    }
    
    console.log('✅ User found in database');
    console.log(`User ID: ${user._id}`);
    console.log(`User Name: ${user.name}`);
    console.log(`User Role: ${user.role}`);
    console.log(`User Active: ${user.isActive}`);
    
    // Test password comparison
    const isMatch = await user.comparePassword(testPassword);
    if (isMatch) {
      console.log('✅ Password verification successful!');
      console.log('\n🎉 Login test PASSED - Authentication is working correctly!');
    } else {
      console.log('❌ Password verification failed!');
      console.log('\n💥 Login test FAILED - Password does not match!');
    }
    
    // Test with wrong password
    console.log('\n--- Testing with wrong password ---');
    const wrongPasswordMatch = await user.comparePassword('wrongpassword');
    if (!wrongPasswordMatch) {
      console.log('✅ Wrong password correctly rejected');
    } else {
      console.log('❌ Wrong password incorrectly accepted!');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed with error:', error);
    process.exit(1);
  }
};

console.log('🧪 Starting login authentication test...');
testLogin();