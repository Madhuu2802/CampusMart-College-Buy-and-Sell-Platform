const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/campusmart', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected');
    const pendingVendors = await User.find({
      role: 'vendor',
      'vendorDetails.isApproved': false,
      isActive: true,
    }).select('name email phone vendorDetails createdAt');
    console.log('Count:', pendingVendors.length);
    console.log('Sample:', pendingVendors[0]);
  } catch (err) {
    console.error('Error querying pending vendors:', err.name, err.message);
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

run();