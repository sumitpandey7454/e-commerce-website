const express     = require('express');
const mongoose    = require('mongoose');
const cors        = require('cors');
const helmet      = require('helmet');
const morgan      = require('morgan');
const compression = require('compression');
const rateLimit   = require('express-rate-limit');
require('dotenv').config();

const app = express();

// ── Security Middleware ──
app.use(helmet());
app.use(compression());

// ── CORS ──
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'http://localhost:5173',
  ],
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','PATCH'],
}));

// ── Rate Limiting ──
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many login attempts, please try again after 15 minutes.' },
});

// ── Body Parser ──
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Logger ──
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// ── Routes ──
app.use('/api/auth',     authLimiter, require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders',   require('./routes/orderRoutes'));
app.use('/api/payment',  require('./routes/paymentRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));
app.use('/api/users',    require('./routes/userRoutes'));

// ── Health Check ──
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'ShopVerse API is running 🚀', env: process.env.NODE_ENV });
});

// ── 404 ──
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ── Global Error Handler ──
app.use((err, req, res, next) => {
  console.error('Global Error:', err.stack);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// ── Database + Start ──
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📚 API Base: http://localhost:${PORT}/api`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

module.exports = app;