import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from "../models/User.mjs";

// Protect routes
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Get token from cookie if available
  if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  // Or get token from header
  else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token and remove the password field
      req.user = await User.findById(decoded.userId).select('-password');

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Not authorized, user not found'
        });
      }
      next();
    } catch (error) {
      res.clearCookie('jwt');
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token failed'
      });
    }
  } else {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token'
    });
  }
});

// Admin middleware
export const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(401).json({
      success: false,
      message: 'Not authorized as an admin'
    });
  }
};