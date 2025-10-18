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

mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/backend", {
  useNewUrlParser: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

const vercelUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null;
// Allow-list known frontends and previews
const allowedOrigins = [
  'https://walletxy.vercel.app',
  // Explicit preview URL reported in production error
  'https://walletxy-4az28ymdu-manav-singlas-projects.vercel.app',
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  process.env.FRONTEND_URL,
  vercelUrl,
  // Allow comma-separated list via env if provided
  ...(process.env.CORS_ALLOWED_ORIGINS ? process.env.CORS_ALLOWED_ORIGINS.split(',').map(s => s.trim()).filter(Boolean) : [])
].filter(Boolean);

// Allow Vercel preview deployments for the frontend project (e.g., walletxy-xxxxx-<team>.vercel.app)
const allowedOriginRegexes = [
  /^https:\/\/walletxy[a-z0-9-]*\.vercel\.app$/,
];

const corsOrigin = (origin, callback) => {
  if (!origin) return callback(null, true); // allow non-browser or same-origin
  const isExplicitlyAllowed = allowedOrigins.includes(origin);
  const matchesPattern = allowedOriginRegexes.some((re) => re.test(origin));
  if (isExplicitlyAllowed || matchesPattern) {
    return callback(null, true);
  }
  const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
  return callback(new Error(msg), false);
};

// Use default allowedHeaders behavior so the server reflects
// Access-Control-Request-Headers from the browser (avoids preflight failures
// due to restrictive static allow-list like sec-ch-ua headers)
app.use(cors({
  origin: corsOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));

// Ensure preflight requests succeed
app.options('*', cors({ origin: corsOrigin, credentials: true }));

// Ensure caches don't mix responses across different origins
app.use((req, res, next) => {
  res.setHeader('Vary', 'Origin');
  next();
});

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.json({ message: 'Expense Tracker API is running!' });
});

app.use('/api/user', userRoutes);

app.get('/isLoggedIn', checkUserLogin, (req, res) => {
  return res.status(200).json({ message: 'User is logged in', user: req.user });
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

app.use('/api/expense', expenseRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use((err, req, res, next) => {
  if (err.message.includes('The CORS policy')) {
    return res.status(403).json({ message: err.message });
  }
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
  });
}

module.exports = app;
