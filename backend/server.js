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
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// CORS Configuration - Updated for production
app.use(cors({
  origin: "https://walletxy.netlify.app",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root route for testing
app.get('/', (req, res) => {
  res.json({ message: 'Expense Tracker API is running!' });
});

// User routes
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
    console.log(user);
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
  res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Local development server
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
  });
}

// Export for Vercel
module.exports = app;