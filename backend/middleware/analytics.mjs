import { checkAnalyticsEnabled } from './settings.mjs';
import fs from 'fs';
import path from 'path';
// Analytics data file path
const ANALYTICS_FILE = path.join(process.cwd(), 'analytics-data.json');

// Load analytics data from file
const loadAnalyticsData = () => {
  try {
    if (fs.existsSync(ANALYTICS_FILE)) {
      const data = JSON.parse(fs.readFileSync(ANALYTICS_FILE, 'utf8'));
      // Convert uniqueVisitors back to Set objects
      Object.keys(data.dailyStats).forEach(date => {
        if (data.dailyStats[date].uniqueVisitors && Array.isArray(data.dailyStats[date].uniqueVisitors)) {
          data.dailyStats[date].uniqueVisitors = new Set(data.dailyStats[date].uniqueVisitors);
        }
      });
      return data;
    }
  } catch (error) {
    console.error('Error loading analytics data:', error);
  }
  return {
    pageViews: {},
    userActions: {},
    dailyStats: {},
    trafficSources: {},
    deviceTypes: {}
  };
};

// Save analytics data to file
const saveAnalyticsData = (data) => {
  try {
    // Convert Sets to arrays for JSON serialization
    const serializableData = {
      ...data,
      dailyStats: Object.fromEntries(
        Object.entries(data.dailyStats).map(([date, stats]) => [
          date,
          {
            ...stats,
            uniqueVisitors: Array.from(stats.uniqueVisitors || [])
          }
        ])
      )
    };
    fs.writeFileSync(ANALYTICS_FILE, JSON.stringify(serializableData, null, 2));
  } catch (error) {
    console.error('Error saving analytics data:', error);
  }
};

// Simple in-memory analytics storage (in production, use a proper analytics service)
let analyticsData = loadAnalyticsData();

// Helper function to determine traffic source
const getTrafficSource = (req) => {
  const referer = req.get('Referer');
  const userAgent = req.get('User-Agent') || '';
  
  // Check for direct traffic
  if (!referer) {
    return 'Direct';
  }
  
  // Check for search engines
  const searchEngines = [
    'google.com', 'bing.com', 'yahoo.com', 'duckduckgo.com',
    'baidu.com', 'yandex.com', 'searchencrypt.com'
  ];
  
  for (const engine of searchEngines) {
    if (referer.includes(engine)) {
      return 'Search';
    }
  }
  
  // Check for social media
  const socialPlatforms = [
    'facebook.com', 'twitter.com', 'instagram.com', 'linkedin.com',
    'youtube.com', 'tiktok.com', 'reddit.com', 'pinterest.com',
    'snapchat.com', 'whatsapp.com', 'telegram.org'
  ];
  
  for (const platform of socialPlatforms) {
    if (referer.includes(platform)) {
      return 'Social';
    }
  }
  
  // Check if it's from our own domain (internal navigation)
  const host = req.get('Host');
  if (referer.includes(host)) {
    return 'Direct';
  }
  
  // Everything else is referral
  return 'Referral';
};

// Helper function to determine device type
const getDeviceType = (userAgent) => {
  const ua = userAgent.toLowerCase();
  
  if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
    return 'Mobile';
  }
  
  if (ua.includes('tablet') || ua.includes('ipad')) {
    return 'Tablet';
  }
  
  return 'Desktop';
};

// Track page view
export const trackPageView = async (req, res, next) => {
  try {
    const analyticsEnabled = await checkAnalyticsEnabled();
    
    if (!analyticsEnabled) {
      return next();
    }

    const page = req.path;
    const userAgent = req.get('User-Agent') || '';
    const ip = req.ip;
    const timestamp = new Date();
    const userId = req.user?._id || 'anonymous';

    // Determine traffic source
    const trafficSource = getTrafficSource(req);
    
    // Determine device type
    const deviceType = getDeviceType(userAgent);

    // Store page view data
    if (!analyticsData.pageViews[page]) {
      analyticsData.pageViews[page] = 0;
    }
    analyticsData.pageViews[page]++;

    // Store traffic source data
    if (!analyticsData.trafficSources[trafficSource]) {
      analyticsData.trafficSources[trafficSource] = 0;
    }
    analyticsData.trafficSources[trafficSource]++;

    // Store device type data
    if (!analyticsData.deviceTypes[deviceType]) {
      analyticsData.deviceTypes[deviceType] = 0;
    }
    analyticsData.deviceTypes[deviceType]++;

    // Store daily stats
    const dateKey = timestamp.toISOString().split('T')[0];
    if (!analyticsData.dailyStats[dateKey]) {
      analyticsData.dailyStats[dateKey] = {
        pageViews: 0,
        uniqueVisitors: new Set(),
        userActions: 0,
        trafficSources: {},
        deviceTypes: {}
      };
    }
    analyticsData.dailyStats[dateKey].pageViews++;
    analyticsData.dailyStats[dateKey].uniqueVisitors.add(ip);
    
    // Store daily traffic sources
    if (!analyticsData.dailyStats[dateKey].trafficSources[trafficSource]) {
      analyticsData.dailyStats[dateKey].trafficSources[trafficSource] = 0;
    }
    analyticsData.dailyStats[dateKey].trafficSources[trafficSource]++;
    
    // Store daily device types
    if (!analyticsData.dailyStats[dateKey].deviceTypes[deviceType]) {
      analyticsData.dailyStats[dateKey].deviceTypes[deviceType] = 0;
    }
    analyticsData.dailyStats[dateKey].deviceTypes[deviceType]++;

    // Save data to file
    saveAnalyticsData(analyticsData);

    // Log analytics event
    console.log(`[Analytics] Page view: ${page} by ${userId} at ${timestamp.toISOString()} - Source: ${trafficSource}, Device: ${deviceType}`);

  } catch (error) {
    console.error('Analytics tracking error:', error);
  }

  next();
};

// Track user action
export const trackUserAction = async (action, metadata = {}) => {
  try {
    const analyticsEnabled = await checkAnalyticsEnabled();
    
    if (!analyticsEnabled) {
      return;
    }

    const timestamp = new Date();
    const dateKey = timestamp.toISOString().split('T')[0];

    // Store user action data
    if (!analyticsData.userActions[action]) {
      analyticsData.userActions[action] = 0;
    }
    analyticsData.userActions[action]++;

    // Update daily stats
    if (analyticsData.dailyStats[dateKey]) {
      analyticsData.dailyStats[dateKey].userActions++;
    }

    // Save data to file
    saveAnalyticsData(analyticsData);

    // Log analytics event
    console.log(`[Analytics] User action: ${action}`, metadata);

  } catch (error) {
    console.error('Analytics tracking error:', error);
  }
};

// Get analytics data
export const getAnalyticsData = () => {
  // Calculate traffic sources percentages
  const totalTraffic = Object.values(analyticsData.trafficSources).reduce((sum, count) => sum + count, 0);
  const trafficSourcesWithPercentage = Object.entries(analyticsData.trafficSources).map(([source, count]) => ({
    source,
    visitors: count,
    percentage: totalTraffic > 0 ? Math.round((count / totalTraffic) * 100 * 10) / 10 : 0
  }));

  // Calculate device breakdown percentages
  const totalDevices = Object.values(analyticsData.deviceTypes).reduce((sum, count) => sum + count, 0);
  const deviceBreakdown = Object.entries(analyticsData.deviceTypes).map(([device, count], index) => ({
    name: device,
    value: totalDevices > 0 ? Math.round((count / totalDevices) * 100 * 10) / 10 : 0,
    color: ['#8884d8', '#82ca9d', '#ffc658'][index] || '#8884d8'
  }));

  return {
    pageViews: { ...analyticsData.pageViews },
    userActions: { ...analyticsData.userActions },
    trafficSources: trafficSourcesWithPercentage,
    deviceBreakdown,
    dailyStats: Object.fromEntries(
      Object.entries(analyticsData.dailyStats).map(([date, stats]) => [
        date,
        {
          ...stats,
          uniqueVisitors: stats.uniqueVisitors.size
        }
      ])
    )
  };
};

// Reset analytics data (for testing)
export const resetAnalyticsData = () => {
  analyticsData = {
    pageViews: {},
    userActions: {},
    dailyStats: {},
    trafficSources: {},
    deviceTypes: {}
  };
  saveAnalyticsData(analyticsData);
};

export default {
  trackPageView,
  trackUserAction,
  getAnalyticsData,
  resetAnalyticsData
}; 