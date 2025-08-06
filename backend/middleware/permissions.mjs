import asyncHandler from 'express-async-handler';
import Role from '../models/Role.mjs';

// Cache for role permissions to reduce database queries
const rolePermissionsCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Clear cache periodically
setInterval(() => {
  rolePermissionsCache.clear();
}, CACHE_TTL);

/**
 * Get user permissions with caching
 */
const getUserPermissions = async (userRole) => {
  const cacheKey = userRole;
  const cached = rolePermissionsCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.permissions;
  }
  
  const role = await Role.findOne({ name: userRole });
  const permissions = role ? role.permissions : [];
  
  rolePermissionsCache.set(cacheKey, {
    permissions,
    timestamp: Date.now()
  });
  
  return permissions;
};

/**
 * Check if user has required permission
 * @param {string|string[]} requiredPermissions - Permission(s) to check
 * @param {object} options - Additional options
 * @param {boolean} options.requireAll - If true, user must have ALL permissions (default: false)
 * @param {boolean} options.allowSuperAdmin - If true, admin role bypasses permission checks (default: true)
 */
export const hasPermission = (requiredPermissions, options = {}) => {
  const {
    requireAll = false,
    allowSuperAdmin = true
  } = options;

  return asyncHandler(async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Convert to array if single permission
    const permissions = Array.isArray(requiredPermissions) 
      ? requiredPermissions 
      : [requiredPermissions];

    // Super admin bypass
    if (allowSuperAdmin && req.user.role === 'admin') {
      return next();
    }

    // Get user permissions
    const userPermissions = await getUserPermissions(req.user.role);

    // Check permissions
    const hasRequiredPermissions = requireAll
      ? permissions.every(permission => userPermissions.includes(permission))
      : permissions.some(permission => userPermissions.includes(permission));

    if (!hasRequiredPermissions) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
        required: permissions,
        userRole: req.user.role
      });
    }

    next();
  });
};

/**
 * Check if user has any of the specified permissions
 */
export const hasAnyPermission = (permissions) => {
  return hasPermission(permissions, { requireAll: false });
};

/**
 * Check if user has all of the specified permissions
 */
export const hasAllPermissions = (permissions) => {
  return hasPermission(permissions, { requireAll: true });
};

/**
 * Resource ownership middleware
 * Checks if user owns the resource or has admin permissions
 */
export const requireOwnership = (resourceIdField = 'id', userIdField = 'userId') => {
  return asyncHandler(async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Admin can access any resource
    if (req.user.role === 'admin') {
      return next();
    }

    // Check ownership
    const resourceId = req.params[resourceIdField] || req.body[resourceIdField];
    const userId = req.resource?.[userIdField] || req.user._id;

    if (resourceId && resourceId.toString() === userId.toString()) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'Access denied: You can only access your own resources'
    });
  });
};

/**
 * Role level middleware
 * Checks if user's role level meets minimum requirement
 */
export const requireRoleLevel = (minLevel) => {
  return asyncHandler(async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const role = await Role.findOne({ name: req.user.role });
    
    if (!role) {
      return res.status(403).json({
        success: false,
        message: 'Invalid user role'
      });
    }

    if (role.level < minLevel) {
      return res.status(403).json({
        success: false,
        message: `Insufficient role level. Required: ${minLevel}, Current: ${role.level}`
      });
    }

    next();
  });
};

/**
 * Content moderation middleware
 * Allows content owners and moderators to access content
 */
export const canModerateContent = (contentType = 'content') => {
  return hasAnyPermission([
    `${contentType}.moderate`,
    `${contentType}.delete`,
    'admin.all'
  ]);
};

/**
 * Time-based access control
 * Restricts access based on time conditions
 */
export const timeBasedAccess = (options = {}) => {
  const {
    allowedHours = null, // [start, end] in 24h format
    allowedDays = null,  // [0-6] where 0 is Sunday
    timezone = 'UTC'
  } = options;

  return asyncHandler(async (req, res, next) => {
    const now = new Date();
    
    // Skip time checks for admin
    if (req.user?.role === 'admin') {
      return next();
    }

    // Check allowed hours
    if (allowedHours) {
      const currentHour = now.getHours();
      const [startHour, endHour] = allowedHours;
      
      if (currentHour < startHour || currentHour > endHour) {
        return res.status(403).json({
          success: false,
          message: `Access restricted to ${startHour}:00 - ${endHour}:00`
        });
      }
    }

    // Check allowed days
    if (allowedDays) {
      const currentDay = now.getDay();
      
      if (!allowedDays.includes(currentDay)) {
        return res.status(403).json({
          success: false,
          message: 'Access restricted on this day'
        });
      }
    }

    next();
  });
};

/**
 * Rate limiting by role
 */
export const roleBasedRateLimit = (limits = {}) => {
  const requestCounts = new Map();
  
  // Default limits per hour by role
  const defaultLimits = {
    user: 100,
    editor: 500,
    admin: 1000,
    ...limits
  };

  return asyncHandler(async (req, res, next) => {
    const userKey = `${req.user._id}_${req.user.role}`;
    const now = Date.now();
    const hourKey = Math.floor(now / (60 * 60 * 1000));
    const requestKey = `${userKey}_${hourKey}`;
    
    const currentCount = requestCounts.get(requestKey) || 0;
    const limit = defaultLimits[req.user.role] || defaultLimits.user;
    
    if (currentCount >= limit) {
      return res.status(429).json({
        success: false,
        message: `Rate limit exceeded. Limit: ${limit} requests per hour`,
        retryAfter: 3600 - (Math.floor(now / 1000) % 3600)
      });
    }
    
    requestCounts.set(requestKey, currentCount + 1);
    
    // Clean up old entries
    if (Math.random() < 0.01) { // 1% chance
      for (const [key] of requestCounts) {
        const [, , keyHour] = key.split('_');
        if (parseInt(keyHour) < hourKey - 1) {
          requestCounts.delete(key);
        }
      }
    }
    
    next();
  });
};

/**
 * API key permission middleware
 * For external API access with specific permissions
 */
export const requireApiPermission = (permission) => {
  return asyncHandler(async (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    
    if (!apiKey) {
      return res.status(401).json({
        success: false,
        message: 'API key required'
      });
    }

    // Here you would validate the API key and check its permissions
    // For now, this is a placeholder
    // In production, you'd have an ApiKey model with permissions
    
    // Mock validation
    if (apiKey === process.env.MASTER_API_KEY) {
      return next();
    }
    
    return res.status(403).json({
      success: false,
      message: 'Invalid API key or insufficient permissions'
    });
  });
};

export default {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  requireOwnership,
  requireRoleLevel,
  canModerateContent,
  timeBasedAccess,
  roleBasedRateLimit,
  requireApiPermission
};