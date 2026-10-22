
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Frontend domains

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'https://campus-mart-phi.vercel.app',
  'https://campusmart-college-buy-and-sell-pla.vercel.app',
  process.env.FRONTEND_URL
].filter(Boolean);


app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.error('CORS blocked origin:', origin);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health checks
app.get('/', (req, res) => {
  res.json({ message: 'Campus Mart API is running!' });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    database: mongoose.connection.readyState === 1
      ? 'connected'
      : 'disconnected'
  });
});

// API routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/vendors', require('./routes/vendors'));
app.use('/api/products', require('./routes/products'));
app.use('/api/marketplace', require('./routes/marketplace'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/admin', require('./routes/admin'));

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err.message);

  if (res.headersSent) {
    return next(err);
  }

  if (err.message && err.message.includes('CORS')) {
    return res.status(403).json({
      message: 'Frontend origin is not allowed by CORS'
    });
  }

  res.status(500).json({
    message: 'Something went wrong. Please try again.'
  });
});

// Start only after MongoDB connects
async function startServer() {
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI is missing in environment variables');
    process.exit(1);
  }

  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET is missing in environment variables');
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 15000
    });

    console.log('MongoDB connected successfully');

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`CampusMart API running on port ${PORT}`);
    });
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  }
}

startServer();
