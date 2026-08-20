const express = require('express');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const User = require('./models/User');
const Product = require('./models/Product');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174'
    ];

    const isLocalhost =
      allowedOrigins.includes(origin) ||
      /^http:\/\/127\.0\.[0-9]+\.[0-9]+:517[3-4]$/.test(origin);

    if (isLocalhost) {
      callback(null, true);
    } else {
      callback(new Error(`Not allowed by CORS: ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/vendors', require('./routes/vendors'));
app.use('/api/products', require('./routes/products'));
app.use('/api/marketplace', require('./routes/marketplace'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/admin', require('./routes/admin'));

// MongoDB Connection
const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/campusmart';

let memoryServer = null;

const connectWithRetry = async (retries = 10, delayMs = 2000) => {
  let attempt = 0;

  while (attempt < retries) {
    try {
      await mongoose.connect(MONGODB_URI); // ✅ FIXED
      console.log('MongoDB connected successfully');
      return true;
    } catch (err) {
      attempt += 1;
      const remaining = retries - attempt;

      console.error(
        `MongoDB connection error (attempt ${attempt}/${retries}):`,
        err?.message || err
      );

      if (remaining <= 0) {
        console.warn(
          'Exceeded maximum MongoDB connection attempts. Falling back to in-memory MongoDB.'
        );

        try {
          memoryServer = await MongoMemoryServer.create();
          const memUri = memoryServer.getUri('campusmart');

          await mongoose.connect(memUri); // ✅ FIXED

          console.log('✅ Connected to in-memory MongoDB instance');
          console.log(
            'ℹ️ Data will reset on server restart. Configure MONGODB_URI for persistence.'
          );

          return true;
        } catch (memErr) {
          console.error(
            '❌ Failed to start in-memory MongoDB:',
            memErr?.message || memErr
          );
          break;
        }
      }

      await new Promise((res) => setTimeout(res, delayMs));
    }
  }

  return false;
};

connectWithRetry();

// Seed sample data
const ensureSampleData = async () => {
  try {
    const vendorCount = await User.countDocuments({ role: 'vendor' });

    if (vendorCount > 0) return;

    const vendors = [
      {
        name: 'Spice Hub',
        email: 'spicehub@campusmart.com',
        password: 'vendor123',
        phone: '+1234567001',
        vendorDetails: {
          businessName: 'Spice Hub',
          businessType: 'fast-food',
          location: 'Main Canteen',
          isApproved: true,
          approvedAt: new Date()
        },
        products: [
          {
            name: 'Masala Maggie Bowl',
            description: 'Spicy maggie with veggies',
            price: 60,
            category: 'meals',
            images: [
              'https://images.unsplash.com/photo-1604908176997-46efc7e4b3f5'
            ]
          }
        ]
      }
    ];

    for (const v of vendors) {
      let user = await User.findOne({ email: v.email });

      if (!user) {
        user = new User({
          name: v.name,
          email: v.email,
          password: v.password,
          role: 'vendor',
          phone: v.phone,
          college: 'Campus University',
          vendorDetails: v.vendorDetails
        });

        await user.save();
      }

      for (const p of v.products) {
        const exists = await Product.findOne({
          name: p.name,
          vendor: user._id
        });

        if (!exists) {
          const prod = new Product({
            ...p,
            vendor: user._id,
            isAvailable: true
          });

          await prod.save();
        }
      }
    }

    console.log('🌱 Sample data seeded');
  } catch (e) {
    console.warn('Seed data skipped:', e?.message || e);
  }
};

mongoose.connection.once('open', ensureSampleData);

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Campus Mart API is running!' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`🔒 http://localhost:${PORT}`);
  console.log(`📡 API: http://localhost:${PORT}/api`);

  process.on('SIGINT', async () => {
    if (memoryServer) {
      await memoryServer.stop();
    }
    process.exit(0);
  });
});