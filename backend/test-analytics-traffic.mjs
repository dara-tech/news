import { resetAnalyticsData } from './middleware/analytics.mjs';
import logger from '../utils/logger.mjs';

// Simulate different traffic sources for testing
const simulateTraffic = () => {
  logger.info('🧪 Simulating traffic sources for analytics testing...');
  
  // Reset analytics data
  resetAnalyticsData();
  
  // Simulate requests with different referrers
  const testRequests = [
    // Direct traffic (no referer)
    { referer: null, userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    
    // Search traffic
    { referer: 'https://www.google.com/search?q=news+website', userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    { referer: 'https://www.bing.com/search?q=latest+news', userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36' },
    
    // Social traffic
    { referer: 'https://www.facebook.com/sharer/sharer.php', userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15' },
    { referer: 'https://twitter.com/intent/tweet', userAgent: 'Mozilla/5.0 (Android 11; Mobile; rv:68.0) Gecko/68.0 Firefox/68.0' },
    { referer: 'https://www.instagram.com/', userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15' },
    
    // Referral traffic
    { referer: 'https://example.com/blog', userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    { referer: 'https://news-site.com/article', userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36' },
    
    // More direct traffic
    { referer: null, userAgent: 'Mozilla/5.0 (iPad; CPU OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15' },
    { referer: null, userAgent: 'Mozilla/5.0 (Android 11; Tablet; rv:68.0) Gecko/68.0 Firefox/68.0' },
    
    // More search traffic
    { referer: 'https://www.google.com/search?q=breaking+news', userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    { referer: 'https://duckduckgo.com/?q=local+news', userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36' },
    
    // More social traffic
    { referer: 'https://www.linkedin.com/sharing/share-offsite/', userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    { referer: 'https://www.reddit.com/r/news/', userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36' },
    
    // More referral traffic
    { referer: 'https://blog.example.org/interesting-article', userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15' },
    { referer: 'https://news-portal.com/featured', userAgent: 'Mozilla/5.0 (Android 11; Mobile; rv:68.0) Gecko/68.0 Firefox/68.0' }
  ];
  
  // Import the analytics middleware functions
  const { trackPageView } = await import('./middleware/analytics.mjs');
  
  // Simulate each request
  testRequests.forEach((request, index) => {
    const mockReq = {
      path: `/test-page-${index + 1}`,
      get: (header) => {
        if (header === 'Referer') return request.referer;
        if (header === 'User-Agent') return request.userAgent;
        if (header === 'Host') return 'localhost:5001';
        return null;
      },
      ip: `192.168.1.${index + 1}`,
      user: null
    };
    
    const mockRes = {};
    const mockNext = () => {};
    
    // Track the page view
    trackPageView(mockReq, mockRes, mockNext);
  });
  
  logger.info('✅ Traffic simulation completed!');
  logger.info('📊 Check the analytics dashboard to see real traffic data.');
};

// Run the simulation
simulateTraffic(); 