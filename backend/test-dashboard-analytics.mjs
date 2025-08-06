import { getAnalyticsData } from './middleware/analytics.mjs';

console.log('🔍 Testing dashboard analytics data processing...');

// Get the raw analytics data
const analyticsData = getAnalyticsData();

console.log('📊 Raw analytics data:');
console.log(JSON.stringify(analyticsData, null, 2));

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

console.log('\n🎯 Processed traffic sources:');
console.log(JSON.stringify(trafficSourcesWithPercentage, null, 2));

console.log('\n📱 Processed device breakdown:');
console.log(JSON.stringify(deviceBreakdown, null, 2));

console.log('\n✅ Analytics data processing test completed!'); 