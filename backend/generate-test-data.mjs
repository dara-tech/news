import { trackPageView, getAnalyticsData, resetAnalyticsData } from './middleware/analytics.mjs';
import logger from '../utils/logger.mjs';

logger.info('🧪 Generating test traffic data...');

// Reset analytics data
resetAnalyticsData();

// Simulate some traffic
const simulateRequest = (path, referer, userAgent) => {
  const mockReq = {
    path,
    get: (header) => {
      if (header === 'Referer') return referer;
      if (header === 'User-Agent') return userAgent;
      if (header === 'Host') return 'localhost:5001';
      return null;
    },
    ip: '127.0.0.1',
    user: null
  };
  
  const mockRes = {};
  const mockNext = () => {};
  
  trackPageView(mockReq, mockRes, mockNext);
};

// Generate test data
simulateRequest('/home', null, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'); // Direct
simulateRequest('/news', 'https://www.google.com/search?q=news', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'); // Search
simulateRequest('/article', 'https://www.facebook.com/sharer/sharer.php', 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15'); // Social
simulateRequest('/category', 'https://example.com/blog', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'); // Referral
simulateRequest('/about', null, 'Mozilla/5.0 (iPad; CPU OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15'); // Direct Tablet
simulateRequest('/contact', 'https://www.bing.com/search?q=contact', 'Mozilla/5.0 (Android 11; Mobile; rv:68.0) Gecko/68.0 Firefox/68.0'); // Search Mobile

logger.info('✅ Test data generated!');
logger.info('📊 Analytics data:');
logger.info(JSON.stringify(getAnalyticsData(), null, 2)); 