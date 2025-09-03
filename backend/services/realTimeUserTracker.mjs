#!/usr/bin/env node

/**
 * Real-Time User Tracker Service
 * Tracks live users, their locations, and viewing behavior
 */

import UserLogin from '../models/UserLogin.mjs';
import User from '../models/User.mjs';
import News from '../models/News.mjs';
import logger from '../utils/logger.mjs';
import geoip from 'geoip-lite';

class RealTimeUserTracker {
  constructor() {
    this.activeUsers = new Map(); // userId -> user session data
    this.pageViews = new Map(); // articleId -> view count
    this.userSessions = new Map(); // sessionId -> session data
    this.locationCache = new Map(); // IP -> location data
    
    // Clean up inactive users every 2 minutes
    setInterval(() => this.cleanupInactiveUsers(), 120000);
  }

  /**
   * Track user page view
   */
  trackPageView(req, articleId, userId = null, userDetails = null) {
    const sessionId = req.sessionID || req.ip + Date.now();
    const userAgent = req.get('User-Agent') || '';
    const ip = req.ip || req.connection.remoteAddress;
    
    // Get location from IP
    const location = this.getLocationFromIP(ip);
    
    // Determine user type and details
    const isRegistered = userId !== null;
    const userType = isRegistered ? 'registered' : 'anonymous';
    
    // Track session
    const sessionData = {
      sessionId,
      userId,
      userType,
      isRegistered,
      userDetails: userDetails || null, // {name, email, role, avatar, etc.}
      ip,
      location,
      userAgent,
      currentPage: articleId,
      lastActivity: new Date(),
      pageViews: this.userSessions.get(sessionId)?.pageViews || [],
      startTime: this.userSessions.get(sessionId)?.startTime || new Date()
    };
    
    // Add current page to view history
    sessionData.pageViews.push({
      articleId,
      timestamp: new Date(),
      duration: 0
    });
    
    // Keep only last 10 page views
    if (sessionData.pageViews.length > 10) {
      sessionData.pageViews = sessionData.pageViews.slice(-10);
    }
    
    this.userSessions.set(sessionId, sessionData);
    
    // Track active user
    if (userId) {
      this.activeUsers.set(userId, {
        ...sessionData,
        userId
      });
    }
    
    // Track article views
    const currentViews = this.pageViews.get(articleId) || 0;
    this.pageViews.set(articleId, currentViews + 1);
    
    logger.info(`Page view tracked: ${articleId} from ${location?.city || 'Unknown'}, ${location?.country || 'Unknown'}`);
  }

  /**
   * Get location from IP address
   */
  getLocationFromIP(ip) {
    if (this.locationCache.has(ip)) {
      return this.locationCache.get(ip);
    }
    
    // Skip local IPs
    if (ip === '127.0.0.1' || ip === '::1' || ip?.startsWith('192.168.') || ip?.startsWith('10.')) {
      const localLocation = {
        country: 'Local',
        region: 'Development',
        city: 'Localhost',
        timezone: 'Local',
        coordinates: [0, 0]
      };
      this.locationCache.set(ip, localLocation);
      return localLocation;
    }
    
    try {
      const geo = geoip.lookup(ip);
      if (geo) {
        const location = {
          country: geo.country,
          region: geo.region,
          city: geo.city,
          timezone: geo.timezone,
          coordinates: [geo.ll[1], geo.ll[0]] // [lng, lat] for MongoDB
        };
        this.locationCache.set(ip, location);
        return location;
      }
    } catch (error) {
      logger.error('GeoIP lookup error:', error);
    }
    
    const unknownLocation = {
      country: 'Unknown',
      region: 'Unknown',
      city: 'Unknown',
      timezone: 'Unknown',
      coordinates: [0, 0]
    };
    this.locationCache.set(ip, unknownLocation);
    return unknownLocation;
  }

  /**
   * Get current active users
   */
  async getActiveUsers() {
    const now = new Date();
    const activeThreshold = 5 * 60 * 1000; // 5 minutes
    
    const activeSessions = [];
    const locationStats = {};
    const contentStats = {};
    
    for (const [sessionId, session] of this.userSessions.entries()) {
      const timeSinceActivity = now - new Date(session.lastActivity);
      
      if (timeSinceActivity <= activeThreshold) {
        activeSessions.push({
          sessionId: sessionId.substring(0, 8), // Truncate for privacy
          userId: session.userId,
          userType: session.userType || (session.userId ? 'registered' : 'anonymous'),
          isRegistered: session.isRegistered || (session.userId !== null),
          userDetails: session.userDetails,
          userDisplay: session.userDetails?.name || session.userDetails?.email || `Anonymous User`,
          location: session.location,
          currentPage: session.currentPage,
          sessionDuration: Math.floor((now - new Date(session.startTime)) / 1000 / 60), // minutes
          pageViews: session.pageViews.length,
          lastActivity: session.lastActivity,
          device: this.getDeviceType(session.userAgent),
          browser: this.getBrowserInfo(session.userAgent)
        });
        
        // Count by location
        const locationKey = `${session.location?.city || 'Unknown'}, ${session.location?.country || 'Unknown'}`;
        locationStats[locationKey] = (locationStats[locationKey] || 0) + 1;
        
        // Count by content
        if (session.currentPage) {
          contentStats[session.currentPage] = (contentStats[session.currentPage] || 0) + 1;
        }
      }
    }
    
    // Calculate user type statistics
    const registeredUsers = activeSessions.filter(s => s.isRegistered).length;
    const anonymousUsers = activeSessions.filter(s => !s.isRegistered).length;
    
    return {
      totalActiveUsers: activeSessions.length,
      registeredUsers,
      anonymousUsers,
      userTypeBreakdown: {
        registered: registeredUsers,
        anonymous: anonymousUsers,
        registrationRate: activeSessions.length > 0 ? Math.round((registeredUsers / activeSessions.length) * 100) : 0
      },
      sessions: activeSessions,
      locationBreakdown: Object.entries(locationStats)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([location, count]) => ({ location, count })),
      topContent: Object.entries(contentStats)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([articleId, count]) => ({ articleId, count }))
    };
  }

  /**
   * Get trending content based on recent views
   */
  async getTrendingContent(limit = 10) {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    
    const trendingMap = new Map();
    
    // Analyze recent page views
    for (const [sessionId, session] of this.userSessions.entries()) {
      for (const view of session.pageViews) {
        if (new Date(view.timestamp) >= oneHourAgo) {
          const count = trendingMap.get(view.articleId) || 0;
          trendingMap.set(view.articleId, count + 1);
        }
      }
    }
    
    // Get article details
    const trending = [];
    const sortedArticles = Array.from(trendingMap.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit);
    
    for (const [articleId, viewCount] of sortedArticles) {
      try {
        const article = await News.findById(articleId)
          .select('title category publishedAt')
          .populate('category', 'name');
        
        if (article) {
          trending.push({
            _id: articleId,
            title: article.title,
            category: article.category?.name || 'Uncategorized',
            viewCount,
            publishedAt: article.publishedAt
          });
        }
      } catch (error) {
        logger.error(`Error fetching trending article ${articleId}:`, error);
      }
    }
    
    return trending;
  }

  /**
   * Get user analytics for the last 24 hours
   */
  async getUserAnalytics() {
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    try {
      const [
        totalSessions,
        uniqueUsers,
        locationData,
        deviceData
      ] = await Promise.all([
        UserLogin.countDocuments({ loginTime: { $gte: last24Hours } }),
        UserLogin.distinct('userId', { loginTime: { $gte: last24Hours } }),
        UserLogin.aggregate([
          { $match: { loginTime: { $gte: last24Hours } } },
          { $group: { _id: '$location.country', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 10 }
        ]),
        UserLogin.aggregate([
          { $match: { loginTime: { $gte: last24Hours } } },
          { $group: { _id: '$device', count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ])
      ]);
      
      return {
        totalSessions,
        uniqueUsers: uniqueUsers.length,
        locationBreakdown: locationData.map(item => ({
          location: item._id || 'Unknown',
          count: item.count
        })),
        deviceBreakdown: deviceData.map(item => ({
          device: item._id || 'Unknown',
          count: item.count
        }))
      };
    } catch (error) {
      logger.error('Error getting user analytics:', error);
      return {
        totalSessions: 0,
        uniqueUsers: 0,
        locationBreakdown: [],
        deviceBreakdown: []
      };
    }
  }

  /**
   * Clean up inactive users
   */
  cleanupInactiveUsers() {
    const now = new Date();
    const inactiveThreshold = 10 * 60 * 1000; // 10 minutes
    
    let cleaned = 0;
    for (const [sessionId, session] of this.userSessions.entries()) {
      const timeSinceActivity = now - new Date(session.lastActivity);
      if (timeSinceActivity > inactiveThreshold) {
        this.userSessions.delete(sessionId);
        if (session.userId) {
          this.activeUsers.delete(session.userId);
        }
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      logger.info(`Cleaned up ${cleaned} inactive user sessions`);
    }
  }

  /**
   * Get device type from user agent
   */
  getDeviceType(userAgent) {
    if (!userAgent) return 'Unknown';
    
    if (/Mobile|Android|iPhone|iPad/.test(userAgent)) {
      return /iPad/.test(userAgent) ? 'Tablet' : 'Mobile';
    }
    return 'Desktop';
  }

  /**
   * Get browser info from user agent
   */
  getBrowserInfo(userAgent) {
    if (!userAgent) return 'Unknown';
    
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Other';
  }

  /**
   * Track user login
   */
  async trackUserLogin(userId, req) {
    const ip = req.ip || req.connection.remoteAddress;
    const location = this.getLocationFromIP(ip);
    const userAgent = req.get('User-Agent') || '';
    
    try {
      const loginRecord = new UserLogin({
        userId,
        username: req.user?.name || 'Unknown',
        email: req.user?.email || 'Unknown',
        ipAddress: ip,
        location,
        device: this.getDeviceType(userAgent),
        browser: {
          name: this.getBrowserInfo(userAgent),
          userAgent
        },
        loginTime: new Date()
      });
      
      await loginRecord.save();
      logger.info(`User login tracked: ${req.user?.email} from ${location?.city}, ${location?.country}`);
    } catch (error) {
      logger.error('Error tracking user login:', error);
    }
  }
}

// Export singleton instance
export default new RealTimeUserTracker();
