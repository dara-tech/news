import Settings from '../models/Settings.mjs';

// Cache settings to avoid database queries on every request
let settingsCache = {};
let cacheTimestamp = 0;
const CACHE_DURATION = 30 * 1000; // 30 seconds (reduced for better responsiveness)

// Get settings from cache or database
const getSettings = async (category = 'general') => {
  const now = Date.now();
  
  // Return cached settings if still valid
  if (settingsCache[category] && (now - cacheTimestamp) < CACHE_DURATION) {
    return settingsCache[category];
  }
  
  // Fetch from database
  try {
    const settings = await Settings.getCategorySettings(category);
    settingsCache[category] = settings;
    cacheTimestamp = now;
    return settings;
  } catch (error) {
    console.error(`Failed to fetch ${category} settings:`, error);
    return {};
  }
};

// Force refresh settings (bypass cache)
const getSettingsFresh = async (category = 'general') => {
  try {
    const settings = await Settings.getCategorySettings(category);
    settingsCache[category] = settings;
    cacheTimestamp = Date.now();
    return settings;
  } catch (error) {
    console.error(`Failed to fetch ${category} settings:`, error);
    return {};
  }
};

// Clear settings cache (call when settings are updated)
export const clearSettingsCache = () => {
  settingsCache = {};
  cacheTimestamp = 0;
};

// Check if registration is allowed
export const checkRegistrationAllowed = async () => {
  const settings = await getSettings('general');
  return settings.allowRegistration !== false; // Default to true if not set
};

// Check if comments are enabled
export const checkCommentsEnabled = async () => {
  const settings = await getSettings('general');
  return settings.commentsEnabled !== false; // Default to true if not set
};

// Check if comment moderation is required
export const checkModerationRequired = async () => {
  const settings = await getSettings('general');
  return settings.moderationRequired === true; // Default to false if not set
};

// Check if analytics are enabled
export const checkAnalyticsEnabled = async () => {
  const settings = await getSettings('general');
  return settings.analyticsEnabled !== false; // Default to true if not set
};

// Check if site is in maintenance mode
export const checkMaintenanceMode = async () => {
  const settings = await getSettings('general');
  return settings.maintenanceMode === true; // Default to false if not set
};

// Middleware to check maintenance mode
export const maintenanceModeMiddleware = async (req, res, next) => {
  try {
    const isMaintenanceMode = await checkMaintenanceMode();
    
    if (isMaintenanceMode) {
      // Allow admins to access during maintenance
      if (req.user && req.user.role === 'admin') {
        return next();
      }
      
      // Return maintenance page for non-admins
      return res.status(503).json({
        success: false,
        message: 'Site is currently under maintenance. Please try again later.',
        maintenance: true
      });
    }
    
    next();
  } catch (error) {
    console.error('Error checking maintenance mode:', error);
    next(); // Continue on error
  }
};

// Middleware to check registration status
export const registrationMiddleware = async (req, res, next) => {
  try {
    const registrationAllowed = await checkRegistrationAllowed();
    
    if (!registrationAllowed) {
      return res.status(403).json({
        success: false,
        message: 'User registration is currently disabled.'
      });
    }
    
    next();
  } catch (error) {
    console.error('Error checking registration status:', error);
    next(); // Continue on error
  }
};

// Middleware to check comments status
export const commentsMiddleware = async (req, res, next) => {
  try {
    const commentsEnabled = await checkCommentsEnabled();
    
    if (!commentsEnabled) {
      return res.status(403).json({
        success: false,
        message: 'Comments are currently disabled.'
      });
    }
    
    next();
  } catch (error) {
    console.error('Error checking comments status:', error);
    next(); // Continue on error
  }
};

// Utility function to get all general settings
export const getGeneralSettings = async () => {
  return await getSettings('general');
};

// Utility function to get all security settings
export const getSecuritySettings = async () => {
  return await getSettings('security');
};

// Utility function to get all integration settings
export const getIntegrationSettings = async () => {
  return await getSettings('integrations');
};

export default {
  getSettings,
  getSettingsFresh,
  clearSettingsCache,
  checkRegistrationAllowed,
  checkCommentsEnabled,
  checkModerationRequired,
  checkAnalyticsEnabled,
  checkMaintenanceMode,
  maintenanceModeMiddleware,
  registrationMiddleware,
  commentsMiddleware,
  getGeneralSettings,
  getSecuritySettings,
  getIntegrationSettings
}; 