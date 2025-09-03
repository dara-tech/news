import ActivityLog from '../models/ActivityLog.mjs';
import logger from '../utils/logger.mjs';

// Helper function to log activities
export const logActivity = async ({
  userId,
  action,
  entity,
  entityId = null,
  description,
  metadata = {},
  severity = 'low',
  req = null
}) => {
  try {
    const logData = {
      userId,
      action,
      entity,
      entityId,
      description,
      metadata,
      severity
    };

    // Add request data if available
    if (req) {
      logData.ipAddress = req.ip || req.connection.remoteAddress;
      logData.userAgent = req.get('User-Agent');
    }

    await ActivityLog.create(logData);
  } catch (error) {
    logger.error('Failed to log activity:', error);
    // Don't throw error to prevent breaking the main operation
  }
};

// Middleware to automatically log certain actions
export const autoLogActivity = (action, entity, options = {}) => {
  return async (req, res, next) => {
    // Store original res.json to intercept responses
    const originalJson = res.json;

    res.json = function(body) {
      // Only log if the operation was successful
      if (body && (body.success === true || res.statusCode < 400)) {
        const userId = req.user?._id;
        if (userId) {
          const description = options.getDescription ? 
            options.getDescription(req, body) : 
            `${action} ${entity}`;

          const entityId = options.getEntityId ? 
            options.getEntityId(req, body) : 
            req.params.id;

          const metadata = options.getMetadata ? 
            options.getMetadata(req, body) : 
            {};

          logActivity({
            userId,
            action,
            entity,
            entityId,
            description,
            metadata,
            severity: options.severity || 'low',
            req
          });
        }
      }

      // Call original res.json
      return originalJson.call(this, body);
    };

    next();
  };
};

// Common activity descriptions
export const ActivityDescriptions = {
  USER_LOGIN: (username) => `User ${username} logged in`,
  USER_LOGOUT: (username) => `User ${username} logged out`,
  USER_CREATE: (username) => `Created new user: ${username}`,
  USER_UPDATE: (username) => `Updated user profile: ${username}`,
  USER_DELETE: (username) => `Deleted user: ${username}`,
  
  NEWS_CREATE: (title) => `Created new article: ${title}`,
  NEWS_UPDATE: (title) => `Updated article: ${title}`,
  NEWS_DELETE: (title) => `Deleted article: ${title}`,
  NEWS_PUBLISH: (title) => `Published article: ${title}`,
  NEWS_UNPUBLISH: (title) => `Unpublished article: ${title}`,
  
  CATEGORY_CREATE: (name) => `Created new category: ${name}`,
  CATEGORY_UPDATE: (name) => `Updated category: ${name}`,
  CATEGORY_DELETE: (name) => `Deleted category: ${name}`,
  
  ROLE_CREATE: (name) => `Created new role: ${name}`,
  ROLE_UPDATE: (name) => `Updated role: ${name}`,
  ROLE_DELETE: (name) => `Deleted role: ${name}`,
  ROLE_ASSIGN: (roleName, username) => `Assigned role "${roleName}" to user ${username}`,
  
  SETTINGS_UPDATE: (section) => `Updated ${section} settings`,
  SECURITY_FORCE_LOGOUT: () => `Forced logout of all users`,
};

export default { logActivity, autoLogActivity, ActivityDescriptions };