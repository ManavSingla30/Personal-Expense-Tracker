const jwt = require('jsonwebtoken');

const checkUserLogin = (req, res, next) => {
  const token = req.cookies?.token;
  
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized: No token found' });
  }

  try {
    const secret = process.env.JWT_SECRET;
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    next();
  } catch (err) {
    console.error('JWT verification failed:', err.message);
    return res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }
};

module.exports = { checkUserLogin };