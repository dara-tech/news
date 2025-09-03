import asyncHandler from "express-async-handler";
import UserLogin from "../models/UserLogin.mjs";
import User from "../models/User.mjs";
import { getLocationFromIP, parseUserAgent, detectSecurityFlags } from "../utils/geoLocation.mjs";
import logger from '../utils/logger.mjs';

// @desc    Track user login
// @route   POST /api/auth/login-track
// @access  Private
export const trackUserLogin = asyncHandler(async (req, res) => {
  try {
    const { userId, loginMethod = 'email', success = true, failureReason = null } = req.body;
    
    if (!userId) {
      res.status(400);
      throw new Error('User ID is required');
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    // Get client IP
    const ipAddress = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for']?.split(',')[0] || 'unknown';
    
    // Get location from IP
    const location = await getLocationFromIP(ipAddress);
    
    // Parse user agent
    const userAgent = req.get('User-Agent') || '';
    const deviceInfo = parseUserAgent(userAgent);
    
    // Get previous logins for security analysis
    const previousLogins = await UserLogin.find({ userId }).sort({ loginTime: -1 }).limit(10);
    
    // Detect security flags
    const securityFlags = detectSecurityFlags({ ipAddress, location }, previousLogins);
    
    // Create login record
    const loginData = {
      userId: user._id,
      username: user.username,
      email: user.email,
      loginTime: new Date(),
      ipAddress,
      location,
      device: deviceInfo.device,
      browser: deviceInfo.browser,
      os: deviceInfo.os,
      loginMethod,
      success,
      failureReason,
      securityFlags,
      metadata: {
        userAgent,
        referer: req.get('Referer'),
        acceptLanguage: req.get('Accept-Language'),
        screenResolution: req.body.screenResolution || null
      }
    };

    const loginRecord = await UserLogin.create(loginData);

    res.json({
      success: true,
      loginId: loginRecord._id,
      securityFlags,
      location: loginRecord.location
    });

  } catch (error) {
    res.status(500);
    throw new Error('Failed to track login');
  }
});

// @desc    Track user logout
// @route   POST /api/auth/logout-track
// @access  Private
export const trackUserLogout = asyncHandler(async (req, res) => {
  try {
    const { loginId } = req.body;
    
    if (!loginId) {
      res.status(400);
      throw new Error('Login ID is required');
    }

    const loginRecord = await UserLogin.findById(loginId);
    if (!loginRecord) {
      res.status(404);
      throw new Error('Login record not found');
    }

    // Calculate session duration
    const logoutTime = new Date();
    const sessionDuration = Math.round((logoutTime - loginRecord.loginTime) / (1000 * 60)); // in minutes

    // Update login record
    loginRecord.logoutTime = logoutTime;
    loginRecord.sessionDuration = sessionDuration;
    await loginRecord.save();

    res.json({
      success: true,
      sessionDuration
    });

  } catch (error) {
    res.status(500);
    throw new Error('Failed to track logout');
  }
});

// @desc    Get user login map data
// @route   GET /api/admin/user-logins/map
// @access  Private/Admin
export const getUserLoginMapData = asyncHandler(async (req, res) => {
  try {
    const { days = 7, limit = 100 } = req.query;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const logins = await UserLogin.find({
      loginTime: { $gte: startDate },
      success: true,
      'location.coordinates': { 
        $exists: true, 
        $ne: null,
        $type: 'array',
        $size: 2
      }
    })
    .populate('userId', 'username email profileImage')
    .sort({ loginTime: -1 })
    .limit(parseInt(limit))
    .lean();

    // Group by location for clustering
    const locationGroups = {};
    logins.forEach(login => {
      // Skip if no coordinates or invalid coordinates
      if (!login.location || !login.location.coordinates || !Array.isArray(login.location.coordinates) || login.location.coordinates.length < 2) {
        logger.warn('Invalid or missing coordinates for login:', login._id);
        return;
      }
      
      const [longitude, latitude] = login.location.coordinates;
      
      // Validate coordinate values
      if (typeof longitude !== 'number' || typeof latitude !== 'number' || isNaN(longitude) || isNaN(latitude)) {
        logger.warn('Invalid coordinate values for login:', login._id);
        return;
      }
      
      const key = `${latitude},${longitude}`;
      if (!locationGroups[key]) {
        locationGroups[key] = {
          coordinates: { latitude, longitude },
          country: login.location.country,
          city: login.location.city,
          region: login.location.region,
          count: 0,
          users: [],
          recentLogins: []
        };
      }
      
      locationGroups[key].count++;
      
      // Add unique users
      const userExists = locationGroups[key].users.find(u => u._id === login.userId._id);
      if (!userExists) {
        locationGroups[key].users.push({
          _id: login.userId._id,
          username: login.userId.username,
          email: login.userId.email,
          profileImage: login.userId.profileImage
        });
      }
      
      // Add recent logins (max 5 per location)
      if (locationGroups[key].recentLogins.length < 5) {
        locationGroups[key].recentLogins.push({
          username: login.username,
          loginTime: login.loginTime,
          device: login.device,
          browser: login.browser.name
        });
      }
    });

    // Convert to array format for frontend
    const mapData = Object.values(locationGroups).map(group => ({
      ...group,
      userCount: group.users.length,
      totalLogins: group.count
    }));

    res.json({
      success: true,
      data: mapData,
      total: logins.length,
      uniqueUsers: new Set(logins.map(l => l.userId._id.toString())).size
    });

  } catch (error) {
    res.status(500);
    throw new Error('Failed to fetch login map data');
  }
});

// @desc    Get user login analytics
// @route   GET /api/admin/user-logins/analytics
// @access  Private/Admin
export const getUserLoginAnalytics = asyncHandler(async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Get basic stats
    const totalLogins = await UserLogin.countDocuments({ loginTime: { $gte: startDate } });
    const successfulLogins = await UserLogin.countDocuments({ 
      loginTime: { $gte: startDate }, 
      success: true 
    });
    const failedLogins = totalLogins - successfulLogins;
    
    // Get unique users
    const uniqueUsers = await UserLogin.distinct('userId', { loginTime: { $gte: startDate } });
    
    // Get device breakdown
    const deviceStats = await UserLogin.aggregate([
      { $match: { loginTime: { $gte: startDate } } },
      { $group: { _id: '$device', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Get browser breakdown
    const browserStats = await UserLogin.aggregate([
      { $match: { loginTime: { $gte: startDate } } },
      { $group: { _id: '$browser.name', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Get country breakdown
    const countryStats = await UserLogin.aggregate([
      { $match: { loginTime: { $gte: startDate } } },
      { $group: { _id: '$location.country', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Get hourly login pattern
    const hourlyStats = await UserLogin.aggregate([
      { $match: { loginTime: { $gte: startDate } } },
      {
        $group: {
          _id: { $hour: '$loginTime' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    // Get security flags
    const securityStats = await UserLogin.aggregate([
      { $match: { loginTime: { $gte: startDate } } },
      { $unwind: '$securityFlags' },
      { $group: { _id: '$securityFlags', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Get average session duration
    const avgSessionDuration = await UserLogin.aggregate([
      { 
        $match: { 
          loginTime: { $gte: startDate },
          sessionDuration: { $gt: 0 }
        } 
      },
      { $group: { _id: null, avgDuration: { $avg: '$sessionDuration' } } }
    ]);

    res.json({
      success: true,
      data: {
        totalLogins,
        successfulLogins,
        failedLogins,
        successRate: totalLogins > 0 ? ((successfulLogins / totalLogins) * 100).toFixed(1) : 0,
        uniqueUsers: uniqueUsers.length,
        deviceStats,
        browserStats,
        countryStats,
        hourlyStats,
        securityStats,
        avgSessionDuration: avgSessionDuration[0]?.avgDuration || 0
      }
    });

  } catch (error) {
    res.status(500);
    throw new Error('Failed to fetch login analytics');
  }
});

// @desc    Get recent user logins
// @route   GET /api/admin/user-logins/recent
// @access  Private/Admin
export const getRecentUserLogins = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const logins = await UserLogin.find()
      .populate('userId', 'username email profileImage')
      .sort({ loginTime: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();

    const total = await UserLogin.countDocuments();

    res.json({
      success: true,
      data: logins,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalLogins: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    res.status(500);
    throw new Error('Failed to fetch recent logins');
  }
}); 