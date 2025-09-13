#!/usr/bin/env node

/**
 * Enterprise Analytics API Routes (Test Version - No Auth)
 * For testing the enterprise analytics dashboard
 */

import express from 'express';
import News from '../models/News.mjs';
import User from '../models/User.mjs';
import UserLogin from '../models/UserLogin.mjs';
import realTimeUserTracker from '../services/realTimeUserTracker.mjs';
import logger from '../utils/logger.mjs';

const router = express.Router();

/**
 * Helper function to get real-time user data
 */
async function getRealTimeData() {
  try {
    const activeUsers = await realTimeUserTracker.getActiveUsers();
    const trending = await realTimeUserTracker.getTrendingContent(5);
    
    return {
      currentUsers: activeUsers.totalActiveUsers,
      registeredUsers: activeUsers.registeredUsers,
      anonymousUsers: activeUsers.anonymousUsers,
      userTypeBreakdown: activeUsers.userTypeBreakdown,
      userLocations: activeUsers.locationBreakdown,
      userSessions: activeUsers.sessions.slice(0, 10).map(session => ({
        ...session,
        location: typeof session.location === 'string' 
          ? session.location 
          : `${session.location?.city || 'Unknown'}, ${session.location?.country || 'Unknown'}`
      })), // Show top 10 sessions with formatted location
      trending: trending.map(item => ({
        _id: typeof item.category === 'string' ? item.category : item.category?.en || item.category?.kh || 'Uncategorized',
        title: typeof item.title === 'string' ? item.title : item.title?.en || item.title?.kh || 'Untitled',
        count: item.viewCount,
        articleId: item._id
      })),
      alerts: activeUsers.totalActiveUsers > 100 ? [{
        type: 'info',
        message: 'High traffic detected - monitor server performance',
        timestamp: new Date()
      }] : [],
      // Add missing fields for compatibility
      status: 'healthy',
      requestsPerSecond: Math.random() * 10 + 5,
      avgResponseTime: Math.floor(Math.random() * 100) + 120
    };
  } catch (error) {
    logger.error('Error getting real-time data:', error);
    return {
      currentUsers: 0,
      userLocations: [],
      userSessions: [],
      trending: [],
      alerts: []
    };
  }
}

/**
 * GET /api/admin/analytics/overview
 * Overview data for LiveStatsBar component
 */
router.get('/overview', async (req, res) => {
  try {
    // Get real analytics data from database
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const [
      totalArticles,
      publishedToday,
      totalUsers,
      activeUsers24h,
      totalViews
    ] = await Promise.all([
      News.countDocuments({ status: 'published' }),
      News.countDocuments({ 
        status: 'published',
        publishedAt: { $gte: today }
      }),
      User.countDocuments(),
      User.countDocuments({ 
        lastLogin: { $gte: last24Hours }
      }),
      News.aggregate([
        { $match: { status: 'published' } },
        { $group: { _id: null, totalViews: { $sum: { $ifNull: ['$views', 0] } } } }
      ])
    ]);

    // Get real-time active users
    const realTimeData = await getRealTimeData();

    // Get trending articles
    const trendingArticles = await News.find({
      status: 'published',
      publishedAt: { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) }
    })
    .populate('category', 'name')
    .sort({ views: -1 })
    .limit(3)
    .select('title slug views publishedAt category');

    const overviewData = {
      realTime: {
        activeUsers: realTimeData.currentUsers,
        status: 'healthy',
        requestsPerSecond: realTimeData.requestsPerSecond || 0,
        avgResponseTime: realTimeData.avgResponseTime || 0
      },
      overview: {
        totalArticles,
        totalViews: totalViews.length > 0 ? totalViews[0].totalViews : 0,
        totalUsers,
        publishedToday,
        activeUsers24h
      },
      trending: {
        articles: trendingArticles.map(article => ({
          _id: article._id,
          title: typeof article.title === 'string' ? article.title : article.title?.en || 'Untitled',
          views: article.views || 0,
          slug: article.slug,
          category: article.category?.name || 'Uncategorized'
        }))
      }
    };
    
    res.json({
      success: true,
      data: overviewData,
      timestamp: new Date()
    });
  } catch (error) {
    logger.error('Analytics overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get analytics overview',
      error: error.message
    });
  }
});

/**
 * GET /api/admin/analytics/dashboard
 * Real-time analytics dashboard data
 */
router.get('/dashboard', async (req, res) => {
  try {
    // Get real analytics data from database
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalArticles,
      publishedToday,
      totalUsers,
      activeUsers24h,
      topPerformingContent,
      contentQualityDistribution
    ] = await Promise.all([
      News.countDocuments({ status: 'published' }),
      News.countDocuments({ 
        status: 'published',
        publishedAt: { $gte: today }
      }),
      User.countDocuments(),
      User.countDocuments({ 
        lastLogin: { $gte: last24Hours }
      }),
      News.find({
        status: 'published',
        publishedAt: { $gte: lastWeek }
      })
      .populate('category', 'name')
      .populate('author', 'name')
      .sort({ views: -1 })
      .limit(5)
      .select('title slug views publishedAt category author qualityAssessment'),
      
      News.aggregate([
        { $match: { status: 'published', 'qualityAssessment.overallScore': { $exists: true } } },
        {
          $bucket: {
            groupBy: '$qualityAssessment.overallScore',
            boundaries: [0, 50, 70, 85, 95, 100],
            default: 'unscored',
            output: {
              count: { $sum: 1 },
              avgScore: { $avg: '$qualityAssessment.overallScore' }
            }
          }
        }
      ])
    ]);

    // Calculate average quality score
    const qualityResult = await News.aggregate([
      { $match: { status: 'published', 'qualityAssessment.overallScore': { $exists: true } } },
      { $group: { _id: null, avgScore: { $avg: '$qualityAssessment.overallScore' } } }
    ]);
    const avgQualityScore = qualityResult[0]?.avgScore || 0;

    const dashboardData = {
      overview: {
        totalArticles,
        publishedToday,
        totalUsers,
        activeUsers24h,
        avgQualityScore,
        systemHealth: {
          status: 'healthy',
          uptime: process.uptime(),
          memory: process.memoryUsage()
        }
      },
      performance: {
        topPerformingContent,
        contentQualityDistribution,
        userEngagement: {
          avgSessionDuration: 180,
          bounceRate: 35,
          pagesPerSession: 2.5
        }
      },
      growth: {
        userGrowth: [
          { date: '2025-09-01', count: 45 },
          { date: '2025-09-02', count: 52 },
          { date: '2025-09-03', count: 38 }
        ],
        contentGrowth: [
          { date: '2025-09-01', count: 12 },
          { date: '2025-09-02', count: 15 },
          { date: '2025-09-03', count: 8 }
        ],
        revenueGrowth: [
          { date: '2025-09-01', amount: 0 },
          { date: '2025-09-02', amount: 0 },
          { date: '2025-09-03', amount: 0 }
        ]
      },
      social: {
        totalPosts: 45,
        engagement: 78,
        reach: 12500,
        platforms: {
          telegram: { posts: 25, engagement: 85 },
          facebook: { posts: 12, engagement: 65 },
          twitter: { posts: 8, engagement: 72 }
        }
      },
      realTime: await getRealTimeData()
    };
    
    res.json({
      success: true,
      data: dashboardData,
      timestamp: new Date()
    });
  } catch (error) {
    logger.error('Dashboard analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get dashboard analytics',
      error: error.message
    });
  }
});

/**
 * GET /api/admin/analytics/business-intelligence
 * Advanced business intelligence report
 */
router.get('/business-intelligence', async (req, res) => {
  try {
    const { timeRange = '30d' } = req.query;
    
    const biData = {
      summary: {
        timeRange,
        generatedAt: new Date(),
        keyMetrics: {
          contentKPIs: {
            articlesPublished: await News.countDocuments({ status: 'published' }),
            averageQuality: 85.2,
            contentEngagement: 68.5,
            socialShares: 1250
          },
          userKPIs: {
            monthlyActiveUsers: 2500,
            userRetention: 72,
            sessionDuration: 180,
            bounceRate: 35
          },
          businessKPIs: {
            revenue: 0,
            conversionRate: 0,
            customerLifetimeValue: 0,
            churnRate: 0
          },
          technicalKPIs: {
            uptime: 99.9,
            responseTime: 150,
            errorRate: 0.5,
            scalabilityScore: 85
          }
        }
      },
      content: {
        categoryPerformance: [
          { _id: 'Politics', totalViews: 15000, totalArticles: 95, avgQuality: 88 },
          { _id: 'Technology', totalViews: 12000, totalArticles: 65, avgQuality: 92 },
          { _id: 'Business', totalViews: 8500, totalArticles: 45, avgQuality: 85 },
          { _id: 'Health', totalViews: 6200, totalArticles: 35, avgQuality: 87 }
        ]
      },
      users: {
        userGrowth: [
          { _id: '2025-08-01', newUsers: 125 },
          { _id: '2025-08-15', newUsers: 145 },
          { _id: '2025-09-01', newUsers: 168 },
          { _id: '2025-09-03', newUsers: 185 }
        ]
      },
      revenue: {
        totalRevenue: 0,
        monthlyRecurringRevenue: 0,
        averageRevenuePerUser: 0,
        churnRate: 0
      },
      recommendations: [
        {
          category: 'content',
          priority: 'high',
          title: 'Implement Content Personalization',
          description: 'Add AI-powered content recommendations to increase user engagement.',
          action: 'Deploy recommendation engine and personalization features'
        },
        {
          category: 'monetization',
          priority: 'high',
          title: 'Launch Premium Subscriptions',
          description: 'High-quality content and user base ready for premium monetization.',
          action: 'Enable subscription tiers and premium features'
        },
        {
          category: 'performance',
          priority: 'medium',
          title: 'Optimize Mobile Experience',
          description: 'Mobile traffic is growing, optimize for mobile performance.',
          action: 'Implement progressive web app features and mobile optimization'
        }
      ]
    };
    
    res.json({
      success: true,
      data: biData,
      timestamp: new Date()
    });
  } catch (error) {
    logger.error('Business intelligence error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get business intelligence data',
      error: error.message
    });
  }
});

/**
 * GET /api/admin/analytics/performance
 * Performance monitoring data
 */
router.get('/performance', async (req, res) => {
  try {
    const { timeRange = '1h' } = req.query;
    
    const performanceData = {
      summary: {
        totalRequests: 1250,
        totalErrors: 5,
        errorRate: 0.4,
        avgResponseTime: 145,
        p95ResponseTime: 280,
        p99ResponseTime: 450,
        timeRange
      },
      system: {
        memory: {
          usage: 65.8,
          heapUsed: 89 * 1024 * 1024,
          rss: 125 * 1024 * 1024
        },
        cpu: {
          load1: 0.8,
          load5: 0.6,
          load15: 0.4
        },
        database: {
          connections: {
            current: 8,
            available: 100
          },
          collections: 13
        }
      },
      distribution: {
        statusCodes: {
          200: 1180,
          404: 45,
          500: 5
        }
      },
      alerts: [
        {
          type: 'performance',
          severity: 'info',
          message: 'System performance is optimal',
          timestamp: new Date()
        }
      ]
    };
    
    res.json({
      success: true,
      data: performanceData,
      timestamp: new Date()
    });
  } catch (error) {
    logger.error('Performance analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get performance data',
      error: error.message
    });
  }
});

/**
 * GET /api/admin/analytics/real-time
 * Real-time system metrics
 */
router.get('/real-time', async (req, res) => {
  try {
    const activeUsers = await realTimeUserTracker.getActiveUsers();
    const userAnalytics = await realTimeUserTracker.getUserAnalytics();
    
    const realTimeData = {
      timestamp: new Date(),
      requestsPerSecond: Math.random() * 10 + 5, // Keep simulated for now
      avgResponseTime: Math.floor(Math.random() * 100) + 120, // Keep simulated for now
      activeConnections: Math.floor(Math.random() * 20) + 5, // Keep simulated for now
      memoryUsage: Math.random() * 30 + 50, // Keep simulated for now
      cpuLoad: Math.random() * 2 + 0.5, // Keep simulated for now
      status: 'healthy',
      currentUsers: activeUsers.totalActiveUsers,
      userSessions: activeUsers.sessions,
      userLocations: activeUsers.locationBreakdown,
      last24Hours: userAnalytics
    };
    
    res.json({
      success: true,
      data: realTimeData,
      timestamp: new Date()
    });
  } catch (error) {
    logger.error('Real-time analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get real-time data',
      error: error.message
    });
  }
});

/**
 * GET /api/admin/analytics/live-users
 * Detailed live user information
 */
router.get('/live-users', async (req, res) => {
  try {
    const activeUsers = await realTimeUserTracker.getActiveUsers();
    const trending = await realTimeUserTracker.getTrendingContent(10);
    const userAnalytics = await realTimeUserTracker.getUserAnalytics();
    
    // Get detailed article information for trending content
    const trendingWithDetails = await Promise.all(
      trending.map(async (item) => {
        try {
          const article = await News.findById(item._id)
            .select('title category slug views publishedAt')
            .populate('category', 'name');
          
          return {
            articleId: item._id,
            title: article?.title || item.title,
            category: article?.category?.name || item.category,
            slug: article?.slug,
            totalViews: article?.views || 0,
            recentViews: item.viewCount,
            publishedAt: article?.publishedAt
          };
        } catch (error) {
          return {
            articleId: item._id,
            title: item.title,
            category: item.category,
            recentViews: item.viewCount
          };
        }
      })
    );
    
    const liveUserData = {
      summary: {
        totalActiveUsers: activeUsers.totalActiveUsers,
        totalSessions: activeUsers.sessions.length,
        uniqueLocations: activeUsers.locationBreakdown.length,
        topLocation: activeUsers.locationBreakdown[0]?.location || 'No data'
      },
      activeUsers: activeUsers.sessions.map(session => ({
        sessionId: session.sessionId,
        userType: session.userType,
        isRegistered: session.isRegistered,
        userDisplay: session.userDisplay,
        userDetails: session.userDetails,
        location: typeof session.location === 'string' 
          ? session.location 
          : `${session.location?.city || 'Unknown'}, ${session.location?.country || 'Unknown'}`,
        locationObject: session.location, // Keep original for detailed analysis
        currentlyViewing: session.currentPage,
        sessionDuration: session.sessionDuration,
        pageViews: session.pageViews,
        device: session.device,
        browser: session.browser,
        lastActivity: session.lastActivity
      })),
      userTypeBreakdown: activeUsers.userTypeBreakdown,
      locationBreakdown: activeUsers.locationBreakdown,
      trendingContent: trendingWithDetails,
      last24HoursAnalytics: {
        totalSessions: userAnalytics.totalSessions,
        uniqueUsers: userAnalytics.uniqueUsers,
        topLocations: userAnalytics.locationBreakdown.slice(0, 5),
        deviceBreakdown: userAnalytics.deviceBreakdown
      }
    };
    
    res.json({
      success: true,
      data: liveUserData,
      timestamp: new Date(),
      isRealData: true
    });
  } catch (error) {
    logger.error('Live users analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get live user data',
      error: error.message
    });
  }
});

/**
 * POST /api/admin/analytics/simulate-users
 * Simulate live users for testing (TEST ONLY)
 */
router.post('/simulate-users', async (req, res) => {
  try {
    const { count = 5 } = req.body;
    
    // Sample user data for simulation
    const sampleUsers = [
      { name: 'John Doe', email: 'john@example.com', role: 'subscriber' },
      { name: 'Jane Smith', email: 'jane@example.com', role: 'premium' },
      { name: 'Mike Johnson', email: 'mike@example.com', role: 'admin' },
      { name: 'Sarah Wilson', email: 'sarah@example.com', role: 'editor' },
      { name: 'David Brown', email: 'david@example.com', role: 'subscriber' }
    ];
    
    const sampleArticles = [
      '507f1f77bcf86cd799439011',
      '507f1f77bcf86cd799439012', 
      '507f1f77bcf86cd799439013',
      '507f1f77bcf86cd799439014',
      '507f1f77bcf86cd799439015'
    ];
    
    const simulatedUsers = [];
    
    for (let i = 0; i < count; i++) {
      const isRegistered = Math.random() > 0.4; // 60% registered, 40% anonymous
      const userDetails = isRegistered ? sampleUsers[i % sampleUsers.length] : null;
      const userId = isRegistered ? `user_${i + 1}` : null;
      const articleId = sampleArticles[Math.floor(Math.random() * sampleArticles.length)];
      
      // Create mock request
      const mockReq = {
        sessionID: `sim_session_${i + 1}_${Date.now()}`,
        ip: `192.168.1.${100 + i}`,
        get: (header) => {
          if (header === 'User-Agent') {
            const browsers = [
              'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0',
              'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148',
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Firefox/120.0'
            ];
            return browsers[i % browsers.length];
          }
          return '';
        },
        connection: { remoteAddress: `192.168.1.${100 + i}` }
      };
      
      // Track the simulated user
      realTimeUserTracker.trackPageView(mockReq, articleId, userId, userDetails);
      
      simulatedUsers.push({
        sessionId: `sim_session_${i + 1}`,
        userType: isRegistered ? 'registered' : 'anonymous',
        userDisplay: userDetails?.name || 'Anonymous User',
        articleId
      });
      
      // Add some random additional page views
      if (Math.random() > 0.5) {
        setTimeout(() => {
          const newArticle = sampleArticles[Math.floor(Math.random() * sampleArticles.length)];
          realTimeUserTracker.trackPageView(mockReq, newArticle, userId, userDetails);
        }, Math.random() * 2000);
      }
    }
    
    // Get updated analytics
    const activeUsers = await realTimeUserTracker.getActiveUsers();
    
    res.json({
      success: true,
      message: `Successfully simulated ${count} users`,
      simulatedUsers,
      currentStats: {
        totalActiveUsers: activeUsers.totalActiveUsers,
        registeredUsers: activeUsers.registeredUsers,
        anonymousUsers: activeUsers.anonymousUsers,
        registrationRate: activeUsers.userTypeBreakdown.registrationRate
      },
      timestamp: new Date()
    });
  } catch (error) {
    logger.error('User simulation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to simulate users',
      error: error.message
    });
  }
});

/**
 * DELETE /api/admin/analytics/clear-users
 * Clear all simulated users (TEST ONLY)
 */
router.delete('/clear-users', async (req, res) => {
  try {
    // Clear the user sessions (this is a simple reset)
    realTimeUserTracker.userSessions.clear();
    realTimeUserTracker.activeUsers.clear();
    
    res.json({
      success: true,
      message: 'All user sessions cleared',
      timestamp: new Date()
    });
  } catch (error) {
    logger.error('Clear users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear users',
      error: error.message
    });
  }
});

export default router;
