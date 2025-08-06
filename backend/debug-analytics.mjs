import { getAnalyticsData, resetAnalyticsData } from './middleware/analytics.mjs';

console.log('🔍 Debugging analytics data...');

// Check current analytics data
const currentData = getAnalyticsData();
console.log('Current analytics data:');
console.log(JSON.stringify(currentData, null, 2));

// Check if traffic sources exist
console.log('\n📊 Traffic sources check:');
console.log('trafficSources length:', currentData.trafficSources?.length || 0);
console.log('trafficSources data:', currentData.trafficSources);

// Check if device breakdown exists
console.log('\n📱 Device breakdown check:');
console.log('deviceBreakdown length:', currentData.deviceBreakdown?.length || 0);
console.log('deviceBreakdown data:', currentData.deviceBreakdown);

// Reset and check empty state
console.log('\n🔄 Resetting analytics data...');
resetAnalyticsData();

const emptyData = getAnalyticsData();
console.log('Empty analytics data:');
console.log(JSON.stringify(emptyData, null, 2)); 