const mongoose = require('mongoose');
const MarketplaceItem = require('./models/MarketplaceItem');
const User = require('./models/User');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/campusmart', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

const createTestPendingItems = async () => {
  try {
    // Find a student user to use as seller
    const student = await User.findOne({ role: 'student' });
    
    if (!student) {
      console.log('No student user found. Please create a student user first.');
      return;
    }

    // Create test pending items
    const testItems = [
      {
        title: 'Used Textbook - Computer Science',
        description: 'Excellent condition computer science textbook for sale',
        price: 50,
        category: 'books',
        condition: 'good',
        location: 'Campus Library',
        seller: student._id,
        images: ['uploads/test1.jpg'],
        status: 'pending',
        contactInfo: {
          phone: '123-456-7890',
          email: student.email,
          preferredMethod: 'phone'
        }
      },
      {
        title: 'Laptop Stand - Adjustable',
        description: 'Barely used laptop stand, perfect for studying',
        price: 25,
        category: 'electronics',
        condition: 'like-new',
        location: 'Dorm Room',
        seller: student._id,
        images: ['uploads/test2.jpg'],
        status: 'pending',
        contactInfo: {
          phone: '123-456-7890',
          email: student.email,
          preferredMethod: 'email'
        }
      }
    ];

    // Check if test items already exist
    const existingItems = await MarketplaceItem.find({ 
      title: { $in: testItems.map(item => item.title) } 
    });

    if (existingItems.length > 0) {
      console.log('Test items already exist. Skipping creation.');
      console.log('Existing pending items count:', await MarketplaceItem.countDocuments({ status: 'pending' }));
      return;
    }

    // Create the test items
    const createdItems = await MarketplaceItem.insertMany(testItems);
    console.log(`Created ${createdItems.length} test pending items`);
    console.log('Total pending items:', await MarketplaceItem.countDocuments({ status: 'pending' }));
    
  } catch (error) {
    console.error('Error creating test items:', error);
  } finally {
    mongoose.connection.close();
  }
};

createTestPendingItems();