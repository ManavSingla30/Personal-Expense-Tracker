const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const userRoutes = require('./routes/user.js');
const { checkUserLogin } = require('./middleware/user.js');
const User = require('./models/user.js');
const expenseRoutes = require('./routes/expense.js');

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB Connection
// Removed deprecated options: useNewUrlParser and useUnifiedTopology
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// CORS Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}))

// Body parsing
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- API Routes ---
app.get('/', (req, res) => {
  res.json({ 
    message: 'Expense Tracker API is running!',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    mongodb: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

app.use('/api/user', userRoutes);
app.use('/api/expense', expenseRoutes);

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

// --- Error Handling ---
app.use((req, res) => {
  res.status(404).json({ 
    message: 'Route not found',
    path: req.path
  });
});

app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// --- Server Startup ---
// This now runs in all environments, which is what Render needs.
app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});
