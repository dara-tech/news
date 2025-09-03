import { getAnalyticsData } from './middleware/analytics.mjs';
import logger from '../utils/logger.mjs';

// Get the raw analytics data
const analyticsData = getAnalyticsData();

logger.info('📊 Raw analytics data:');
logger.info(JSON.stringify(analyticsData, null, 2));

// Test the data processing logic from dashboard controller
const totalTraffic = Object.values(analyticsData.trafficSources).reduce((sum, count) => sum + count, 0);
const trafficSourcesWithPercentage = Object.entries(analyticsData.trafficSources).map(([source, count]) => ({
  source,
  visitors: count,
  percentage: totalTraffic > 0 ? Math.round((count / totalTraffic) * 100 * 10) / 10 : 0
}));

const totalDevices = Object.values(analyticsData.deviceBreakdown).reduce((sum, count) => sum + count, 0);
const deviceBreakdown = Object.entries(analyticsData.deviceBreakdown).map(([device, count], index) => ({
  name: device,
  value: totalDevices > 0 ? Math.round((count / totalDevices) * 100 * 10) / 10 : 0,
  color: ['#8884d8', '#82ca9d', '#ffc658'][index] || '#8884d8'
}));

logger.info('\n🎯 Processed traffic sources:');
logger.info(JSON.stringify(trafficSourcesWithPercentage, null, 2));

logger.info('\n📱 Processed device breakdown:');
logger.info(JSON.stringify(deviceBreakdown, null, 2));

logger.info('\n✅ Analytics data processing test completed!'); 