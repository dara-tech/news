import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';

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
      console.log('Decoded token:', decoded);

      // Get user from the token, ensuring isAdmin is included
      const user = await User.findById(decoded.userId);
      console.log('User found:', user);

      if (!user) {
        console.log('No user found for ID:', decoded.id);
        res.status(404);
        throw new Error('User not found');
      }

      req.user = user;
      next();
    } catch (error) {
      console.error(error);
      res.clearCookie('jwt');
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  } else {
    // If no token is present, we can still allow access to public routes.
    // The route handler will be responsible for checking if a user is required.
    next();
  }
});

// Admin middleware
export const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(401);
    throw new Error('Not authorized as an admin');
  }
};
