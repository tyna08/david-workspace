const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Main authentication middleware
const authenticateUser = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Find user and attach to request
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    req.user = user;
    req.userId = decoded.userId;
    
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Check if user is a tutor
const requireTutor = (req, res, next) => {
  if (req.user && (req.user.role === 'tutor' || req.user.role === 'admin')) {
    next();
  } else {
    res.status(403).json({ error: 'Access denied. Tutor role required.' });
  }
};

// Check if user is a student
const requireStudent = (req, res, next) => {
  if (req.user && (req.user.role === 'student' || req.user.role === 'admin')) {
    next();
  } else {
    res.status(403).json({ error: 'Access denied. Student role required.' });
  }
};

// Optional: Allow both students and tutors
const requireAuth = (req, res, next) => {
  // This just requires authentication, any role is fine
  next();
};

module.exports = {
  authenticateUser,
  requireTutor,
  requireStudent,
  requireAuth
};