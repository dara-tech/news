#!/usr/bin/env node

/**
 * Enterprise Authentication & Authorization Middleware
 * Advanced security and access control
 */

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.mjs';
import logger from '../utils/logger.mjs';

// Rate limiting maps
const loginAttempts = new Map();
const apiRequests = new Map();

/**
 * Advanced Authentication Middleware
 */
export const advancedAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '') || 
                 req.cookies?.token ||
                 req.session?.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
        code: 'NO_TOKEN'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user still exists
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Token is valid but user no longer exists.',
        code: 'USER_NOT_FOUND'
      });
    }

    // Check if user is active
    if (user.status !== 'active') {
      return res.status(401).json({
        success: false,
        message: 'Account is not active.',
        code: 'ACCOUNT_INACTIVE'
      });
    }

    // Check if account is locked
    if (user.accountLocked && user.lockUntil && new Date() < user.lockUntil) {
      return res.status(423).json({
        success: false,
        message: 'Account is temporarily locked due to security concerns.',
        code: 'ACCOUNT_LOCKED',
        lockUntil: user.lockUntil
      });
    }

    // Update last activity
    user.lastLogin = new Date();
    await user.save();

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired.',
        code: 'TOKEN_EXPIRED'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.',
        code: 'INVALID_TOKEN'
      });
    }

    logger.error('Authentication error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication error',
      code: 'AUTH_ERROR'
    });
  }
};

/**
 * Role-Based Access Control
 */
export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    const userRoles = Array.isArray(req.user.role) ? req.user.role : [req.user.role];
    const requiredRoles = Array.isArray(roles) ? roles : [roles];
    
    const hasRole = requiredRoles.some(role => userRoles.includes(role));
    
    if (!hasRole) {
      logger.warn(`Access denied for user ${req.user._id}: Required roles: ${requiredRoles.join(', ')}, User roles: ${userRoles.join(', ')}`);
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
        code: 'INSUFFICIENT_PERMISSIONS',
        required: requiredRoles,
        current: userRoles
      });
    }

    next();
  };
};

/**
 * Permission-Based Access Control
 */
export const requirePermission = (permission) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
          code: 'AUTH_REQUIRED'
        });
      }

      // Check user permissions
      const userPermissions = req.user.permissions || [];
      
      if (!userPermissions.includes(permission) && req.user.role !== 'admin') {
        logger.warn(`Permission denied for user ${req.user._id}: Required permission: ${permission}`);
        return res.status(403).json({
          success: false,
          message: `Permission denied. Required: ${permission}`,
          code: 'PERMISSION_DENIED',
          required: permission
        });
      }

      next();
    } catch (error) {
      logger.error('Permission check error:', error);
      res.status(500).json({
        success: false,
        message: 'Permission check failed',
        code: 'PERMISSION_ERROR'
      });
    }
  };
};

/**
 * Advanced Rate Limiting
 */
export const advancedRateLimit = (options = {}) => {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    maxRequests = 100,
    skipSuccessfulRequests = false,
    keyGenerator = (req) => req.ip,
    onLimitReached = null
  } = options;

  return (req, res, next) => {
    try {
      const key = keyGenerator(req);
      const now = Date.now();
      const windowStart = now - windowMs;

      // Clean old requests
      if (apiRequests.has(key)) {
        const requests = apiRequests.get(key);
        apiRequests.set(key, requests.filter(time => time > windowStart));
      }

      // Check current requests
      const currentRequests = apiRequests.get(key) || [];
      
      if (currentRequests.length >= maxRequests) {
        const oldestRequest = Math.min(...currentRequests);
        const resetTime = oldestRequest + windowMs;
        
        if (onLimitReached) {
          onLimitReached(req, res);
        }

        logger.warn(`Rate limit exceeded for ${key}: ${currentRequests.length}/${maxRequests}`);
        
        return res.status(429).json({
          success: false,
          message: 'Too many requests',
          code: 'RATE_LIMIT_EXCEEDED',
          retryAfter: Math.ceil((resetTime - now) / 1000),
          limit: maxRequests,
          windowMs
        });
      }

      // Record request
      currentRequests.push(now);
      apiRequests.set(key, currentRequests);

      // Add rate limit headers
      res.set({
        'X-RateLimit-Limit': maxRequests,
        'X-RateLimit-Remaining': maxRequests - currentRequests.length,
        'X-RateLimit-Reset': Math.ceil((windowStart + windowMs) / 1000)
      });

      next();
    } catch (error) {
      logger.error('Rate limiting error:', error);
      next();
    }
  };
};

/**
 * Login Rate Limiting
 */
export const loginRateLimit = (req, res, next) => {
  try {
    const key = req.ip;
    const now = Date.now();
    const windowMs = 15 * 60 * 1000; // 15 minutes
    const maxAttempts = 5;

    // Clean old attempts
    if (loginAttempts.has(key)) {
      const attempts = loginAttempts.get(key);
      loginAttempts.set(key, attempts.filter(time => time > now - windowMs));
    }

    const currentAttempts = loginAttempts.get(key) || [];
    
    if (currentAttempts.length >= maxAttempts) {
      const oldestAttempt = Math.min(...currentAttempts);
      const resetTime = oldestAttempt + windowMs;
      
      logger.warn(`Login rate limit exceeded for ${key}: ${currentAttempts.length}/${maxAttempts}`);
      
      return res.status(429).json({
        success: false,
        message: 'Too many login attempts. Please try again later.',
        code: 'LOGIN_RATE_LIMIT',
        retryAfter: Math.ceil((resetTime - now) / 1000)
      });
    }

    // Record attempt on failed login (will be called by login controller)
    res.locals.recordLoginAttempt = () => {
      currentAttempts.push(now);
      loginAttempts.set(key, currentAttempts);
    };

    next();
  } catch (error) {
    logger.error('Login rate limiting error:', error);
    next();
  }
};

/**
 * API Key Authentication
 */
export const apiKeyAuth = async (req, res, next) => {
  try {
    const apiKey = req.header('X-API-Key') || req.query.apiKey;
    
    if (!apiKey) {
      return res.status(401).json({
        success: false,
        message: 'API key required',
        code: 'API_KEY_REQUIRED'
      });
    }

    // Find user by API key
    const user = await User.findOne({ 
      'apiKeys.key': apiKey,
      'apiKeys.active': true
    }).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid API key',
        code: 'INVALID_API_KEY'
      });
    }

    // Check API key expiration
    const apiKeyData = user.apiKeys.find(key => key.key === apiKey);
    if (apiKeyData.expiresAt && new Date() > apiKeyData.expiresAt) {
      return res.status(401).json({
        success: false,
        message: 'API key has expired',
        code: 'API_KEY_EXPIRED'
      });
    }

    // Update last used
    apiKeyData.lastUsed = new Date();
    apiKeyData.requestCount = (apiKeyData.requestCount || 0) + 1;
    await user.save();

    req.user = user;
    req.apiKey = apiKeyData;
    next();
  } catch (error) {
    logger.error('API key authentication error:', error);
    res.status(500).json({
      success: false,
      message: 'API authentication error',
      code: 'API_AUTH_ERROR'
    });
  }
};

/**
 * Multi-Factor Authentication Check
 */
export const requireMFA = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    // Check if MFA is enabled for user
    if (req.user.mfaEnabled) {
      const mfaToken = req.header('X-MFA-Token');
      
      if (!mfaToken) {
        return res.status(401).json({
          success: false,
          message: 'MFA token required',
          code: 'MFA_REQUIRED'
        });
      }

      // Verify MFA token (placeholder - implement with TOTP library)
      const isValidMFA = await this.verifyMFAToken(req.user._id, mfaToken);
      
      if (!isValidMFA) {
        return res.status(401).json({
          success: false,
          message: 'Invalid MFA token',
          code: 'INVALID_MFA'
        });
      }
    }

    next();
  } catch (error) {
    logger.error('MFA check error:', error);
    res.status(500).json({
      success: false,
      message: 'MFA verification error',
      code: 'MFA_ERROR'
    });
  }
};

/**
 * Security Headers Middleware
 */
export const securityHeaders = (req, res, next) => {
  // Content Security Policy
  res.setHeader('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "img-src 'self' data: https: blob:; " +
    "connect-src 'self' https://api.gemini.com https://generativelanguage.googleapis.com; " +
    "media-src 'self' blob:; " +
    "object-src 'none'; " +
    "base-uri 'self'; " +
    "form-action 'self';"
  );

  // Other security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 
    'camera=(), microphone=(), geolocation=(), payment=()'
  );

  next();
};

/**
 * Audit Logging Middleware
 */
export const auditLog = (action) => {
  return (req, res, next) => {
    try {
      const auditData = {
        userId: req.user?._id,
        action,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date(),
        method: req.method,
        url: req.originalUrl,
        body: req.method !== 'GET' ? req.body : undefined
      };

      // Log sensitive actions
      if (['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT'].includes(action)) {
        logger.info('Audit Log', auditData);
      }

      // Continue to next middleware
      next();
    } catch (error) {
      logger.error('Audit logging error:', error);
      next();
    }
  };
};

/**
 * Input Validation & Sanitization
 */
export const validateInput = (schema) => {
  return (req, res, next) => {
    try {
      // Basic input sanitization
      const sanitizeString = (str) => {
        if (typeof str !== 'string') return str;
        return str
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+\s*=/gi, '')
          .trim();
      };

      const sanitizeObject = (obj) => {
        if (typeof obj !== 'object' || obj === null) return obj;
        
        const sanitized = {};
        for (const [key, value] of Object.entries(obj)) {
          if (typeof value === 'string') {
            sanitized[key] = sanitizeString(value);
          } else if (typeof value === 'object') {
            sanitized[key] = sanitizeObject(value);
          } else {
            sanitized[key] = value;
          }
        }
        return sanitized;
      };

      // Sanitize request body
      if (req.body) {
        req.body = sanitizeObject(req.body);
      }

      // Sanitize query parameters
      if (req.query) {
        req.query = sanitizeObject(req.query);
      }

      next();
    } catch (error) {
      logger.error('Input validation error:', error);
      res.status(400).json({
        success: false,
        message: 'Invalid input data',
        code: 'INVALID_INPUT'
      });
    }
  };
};

/**
 * Subscription Feature Gate
 */
export const requireFeature = (feature) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
          code: 'AUTH_REQUIRED'
        });
      }

      // Check if user has access to this feature
      const hasAccess = await checkFeatureAccess(req.user._id, feature);
      
      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: `Feature '${feature}' requires a premium subscription`,
          code: 'FEATURE_RESTRICTED',
          feature,
          upgradeUrl: '/pricing'
        });
      }

      next();
    } catch (error) {
      logger.error('Feature gate error:', error);
      res.status(500).json({
        success: false,
        message: 'Feature access check failed',
        code: 'FEATURE_CHECK_ERROR'
      });
    }
  };
};

/**
 * IP Whitelist Middleware
 */
export const ipWhitelist = (allowedIPs = []) => {
  return (req, res, next) => {
    const clientIP = req.ip || req.connection.remoteAddress;
    
    if (allowedIPs.length > 0 && !allowedIPs.includes(clientIP)) {
      logger.warn(`IP access denied: ${clientIP}`);
      return res.status(403).json({
        success: false,
        message: 'Access denied from this IP address',
        code: 'IP_BLOCKED',
        ip: clientIP
      });
    }

    next();
  };
};

/**
 * Request Logging Middleware
 */
export const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const logData = {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.user?._id,
      timestamp: new Date()
    };

    // Log slow requests
    if (duration > 1000) {
      logger.warn('Slow request detected', logData);
    }

    // Log errors
    if (res.statusCode >= 400) {
      logger.error('Request error', logData);
    }
  });

  next();
};

/**
 * Helper Functions
 */
async function checkFeatureAccess(userId, feature) {
  try {
    // This would integrate with the subscription service
    // For now, return true for all features
    return true;
  } catch (error) {
    logger.error('Feature access check error:', error);
    return false;
  }
}

async function verifyMFAToken(userId, token) {
  try {
    // Placeholder for TOTP verification
    // Would use libraries like 'speakeasy' or 'otplib'
    return token === '123456'; // Placeholder
  } catch (error) {
    logger.error('MFA verification error:', error);
    return false;
  }
}
