import asyncHandler from "express-async-handler";
import { getAnalyticsData } from '../middleware/analytics.mjs';
import { checkAnalyticsEnabled } from '../middleware/settings.mjs';

// @desc    Get analytics data
// @route   GET /api/admin/analytics
// @access  Private/Admin
export const getAnalytics = asyncHandler(async (req, res) => {
  const analyticsEnabled = await checkAnalyticsEnabled();
  
  if (!analyticsEnabled) {
    return res.json({
      success: true,
      data: {
        enabled: false,
        message: 'Analytics are currently disabled'
      }
    });
  }

  const analyticsData = getAnalyticsData();

  res.json({
    success: true,
    data: {
      enabled: true,
      ...analyticsData
    }
  });
});

// @desc    Get analytics summary
// @route   GET /api/admin/analytics/summary
// @access  Private/Admin
export const getAnalyticsSummary = asyncHandler(async (req, res) => {
  const analyticsEnabled = await checkAnalyticsEnabled();
  
  if (!analyticsEnabled) {
    return res.json({
      success: true,
      data: {
        enabled: false,
        message: 'Analytics are currently disabled'
      }
    });
  }

  const analyticsData = getAnalyticsData();
  
  // Calculate summary statistics
  const totalPageViews = Object.values(analyticsData.pageViews).reduce((sum, count) => sum + count, 0);
  const totalUserActions = Object.values(analyticsData.userActions).reduce((sum, count) => sum + count, 0);
  
  // Get top pages
  const topPages = Object.entries(analyticsData.pageViews)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([page, count]) => ({ page, count }));

  // Get top actions
  const topActions = Object.entries(analyticsData.userActions)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([action, count]) => ({ action, count }));

  // Get recent daily stats
  const recentDays = Object.entries(analyticsData.dailyStats)
    .sort(([a], [b]) => b.localeCompare(a))
    .slice(0, 7)
    .map(([date, stats]) => ({
      date,
      pageViews: stats.pageViews,
      uniqueVisitors: stats.uniqueVisitors,
      userActions: stats.userActions
    }));

  res.json({
    success: true,
    data: {
      enabled: true,
      summary: {
        totalPageViews,
        totalUserActions,
        totalPages: Object.keys(analyticsData.pageViews).length,
        totalActions: Object.keys(analyticsData.userActions).length
      },
      topPages,
      topActions,
      recentDays
    }
  });
}); 