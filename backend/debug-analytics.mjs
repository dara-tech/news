import { getAnalyticsData, resetAnalyticsData } from './middleware/analytics.mjs';
import logger from '../utils/logger.mjs';

// Check current analytics data
const currentData = getAnalyticsData();
logger.info('Current analytics data:');
logger.info(JSON.stringify(currentData, null, 2));

// Check if traffic sources exist
logger.info('\n📊 Traffic sources check:');
logger.info('trafficSources length:', currentData.trafficSources?.length || 0);
logger.info('trafficSources data:', currentData.trafficSources);

// Check if device breakdown exists
logger.info('\n📱 Device breakdown check:');
logger.info('deviceBreakdown length:', currentData.deviceBreakdown?.length || 0);
logger.info('deviceBreakdown data:', currentData.deviceBreakdown);

// Reset and check empty state
logger.info('\n🔄 Resetting analytics data...');
resetAnalyticsData();

const emptyData = getAnalyticsData();
logger.info('Empty analytics data:');
logger.info(JSON.stringify(emptyData, null, 2)); 