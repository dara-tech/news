import { trackPageView, getAnalyticsData, resetAnalyticsData } from './middleware/analytics.mjs';

console.log('🚀 Initializing analytics with test data...');

// Reset analytics data
resetAnalyticsData();

// Simulate some realistic traffic
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

// Generate realistic test data
console.log('📊 Generating test traffic...');

// Direct traffic (40% - users typing URL directly)
for (let i = 0; i < 20; i++) {
  simulateRequest(`/page-${i}`, null, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
  simulateRequest(`/article-${i}`, null, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36');
}

// Search traffic (35% - from search engines)
for (let i = 0; i < 18; i++) {
  simulateRequest(`/search-result-${i}`, 'https://www.google.com/search?q=news+website', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
  simulateRequest(`/search-result-${i}`, 'https://www.bing.com/search?q=latest+news', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36');
}

// Social traffic (20% - from social media)
for (let i = 0; i < 10; i++) {
  simulateRequest(`/social-${i}`, 'https://www.facebook.com/sharer/sharer.php', 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15');
  simulateRequest(`/social-${i}`, 'https://twitter.com/intent/tweet', 'Mozilla/5.0 (Android 11; Mobile; rv:68.0) Gecko/68.0 Firefox/68.0');
}

// Referral traffic (5% - from other websites)
for (let i = 0; i < 3; i++) {
  simulateRequest(`/referral-${i}`, 'https://example.com/blog', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
  simulateRequest(`/referral-${i}`, 'https://news-site.com/article', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36');
}

// Add some mobile and tablet traffic
for (let i = 0; i < 15; i++) {
  simulateRequest(`/mobile-${i}`, null, 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15');
  simulateRequest(`/tablet-${i}`, null, 'Mozilla/5.0 (iPad; CPU OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15');
}

console.log('✅ Analytics initialized with test data!');
console.log('📊 Current analytics data:');
console.log(JSON.stringify(getAnalyticsData(), null, 2)); 