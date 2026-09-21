const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Protect routes - ensures the user is authenticated via Bearer token
 */
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tastetrail_super_secret_jwt_key_2026');

      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'User not found' });
      }

      return next();
    } catch (error) {
      console.error('[Auth Error]', error.message);
      return res.status(401).json({ success: false, message: 'Not authorized, invalid token' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }
};

/**
 * Optional authentication - if a token is present and valid, attaches req.user.
 * Does NOT throw 401 if missing. Useful for public endpoints that have personalized perks.
 */
const optionalAuth = async (req, res, next) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tastetrail_super_secret_jwt_key_2026');
      req.user = await User.findById(decoded.id).select('-password');
    } catch (error) {
      // Ignore token errors for optional auth
      req.user = null;
    }
  }
  next();
};

module.exports = { protect, optionalAuth };
