const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const userRoutes = require('./routes/user.js');
const { checkUserLogin } = require('./middleware/user.js');
const User = require('./models/user.js');
const expenseRoutes = require('./routes/expense.js');

const app = express();

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/backend", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// CORS Configuration - UPDATED
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  process.env.FRONTEND_URL,
].filter(Boolean);

// Regex patterns for dynamic Vercel URLs
const allowedOriginRegexes = [
  /^https:\/\/walletxy.*\.vercel\.app$/,  // All walletxy deployments
  /^https:\/\/.*-manav-singlas-projects\.vercel\.app$/,  // All your preview deployments
];

const corsOrigin = (origin, callback) => {
  // Allow requests with no origin (mobile apps, Postman, curl, etc.)
  if (!origin) {
    console.log('✅ No origin - allowing request');
    return callback(null, true);
  }

  // Check explicit origins
  if (allowedOrigins.includes(origin)) {
    console.log('✅ Allowed origin (explicit):', origin);
    return callback(null, true);
  }

  // Check regex patterns
  const matchesPattern = allowedOriginRegexes.some((regex) => regex.test(origin));
  if (matchesPattern) {
    console.log('✅ Allowed origin (regex match):', origin);
    return callback(null, true);
  }

  // Reject
  console.log('❌ Blocked origin:', origin);
  const msg = `CORS policy does not allow access from origin: ${origin}`;
  return callback(new Error(msg), false);
};

// Apply CORS middleware
app.use(cors({
  origin: corsOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  exposedHeaders: ['Set-Cookie'],
}));

// Handle preflight requests
app.options('*', cors({
  origin: corsOrigin,
  credentials: true,
}));

// Body parsing middleware
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Expense Tracker API is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    mongodb: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    timestamp: new Date().toISOString()
  });
});

// User routes
app.use('/api/user', userRoutes);

// Protected routes
app.get('/isLoggedIn', checkUserLogin, (req, res) => {
  return res.status(200).json({ 
    message: 'User is logged in', 
    user: req.user 
  });
});

app.get('/findUser', checkUserLogin, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    return res.status(200).json({ user });
  } catch (err) {
    console.error('Find user error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Expense routes
app.use('/api/expense', expenseRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    message: 'Route not found',
    path: req.path,
    method: req.method
  });
});

// Error handler
app.use((err, req, res, next) => {
  // Handle CORS errors
  if (err.message && err.message.includes('CORS policy')) {
    console.error('CORS Error:', err.message);
    return res.status(403).json({ 
      message: 'CORS error',
      error: err.message,
      origin: req.headers.origin
    });
  }

  console.error('Server Error:', err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Local development server
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 Server started on port ${PORT}`);
  });
}

// Export for Vercel
module.exports = app;