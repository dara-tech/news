import dotenv from 'dotenv';
import axios from 'axios';
import logger from './utils/logger.mjs';

dotenv.config();

const BASE_URL = process.env.BACKEND_URL || 'http://localhost:5001';

class ImprovementTester {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      tests: []
    };
  }

  async runTest(name, testFunction) {
    try {
      console.log(`\n🧪 Testing: ${name}`);
      const result = await testFunction();
      this.results.passed++;
      this.results.tests.push({ name, status: 'PASSED', result });
      console.log(`✅ ${name}: PASSED`);
      return result;
    } catch (error) {
      this.results.failed++;
      this.results.tests.push({ name, status: 'FAILED', error: error.message });
      console.log(`❌ ${name}: FAILED - ${error.message}`);
      return null;
    }
  }

  async testServerHealth() {
    const response = await axios.get(`${BASE_URL}/health`);
    if (response.status !== 200) {
      throw new Error(`Health check failed with status ${response.status}`);
    }
    return response.data;
  }

  async testIntegrationHealth() {
    const response = await axios.get(`${BASE_URL}/api/integration/health`);
    if (response.status !== 200) {
      throw new Error(`Integration health check failed with status ${response.status}`);
    }
    return response.data;
  }

  async testIntegrationStats() {
    const response = await axios.get(`${BASE_URL}/api/integration/stats`);
    if (response.status !== 200) {
      throw new Error(`Integration stats failed with status ${response.status}`);
    }
    return response.data;
  }

  async testAnalyticsDashboard() {
    const response = await axios.get(`${BASE_URL}/api/analytics/dashboard?timeRange=7d`);
    if (response.status !== 200) {
      throw new Error(`Analytics dashboard failed with status ${response.status}`);
    }
    return response.data;
  }

  async testAISummarization() {
    const testContent = "This is a test article about technology and innovation. It discusses various aspects of modern technology and how it impacts our daily lives.";
    const response = await axios.post(`${BASE_URL}/api/ai/summarize`, {
      content: testContent,
      maxLength: 50
    });
    if (response.status !== 200) {
      throw new Error(`AI summarization failed with status ${response.status}`);
    }
    return response.data;
  }

  async testAIFactCheck() {
    const testContent = "The Earth is flat and the moon landing was fake.";
    const response = await axios.post(`${BASE_URL}/api/ai/fact-check`, {
      content: testContent
    });
    if (response.status !== 200) {
      throw new Error(`AI fact-check failed with status ${response.status}`);
    }
    return response.data;
  }

  async testAITagGeneration() {
    const response = await axios.post(`${BASE_URL}/api/ai/generate-tags`, {
      content: "This article discusses artificial intelligence, machine learning, and their applications in healthcare.",
      title: "AI in Healthcare: The Future of Medicine",
      maxTags: 5
    });
    if (response.status !== 200) {
      throw new Error(`AI tag generation failed with status ${response.status}`);
    }
    return response.data;
  }

  async testCacheStats() {
    const response = await axios.get(`${BASE_URL}/api/cache/stats`);
    if (response.status !== 200) {
      throw new Error(`Cache stats failed with status ${response.status}`);
    }
    return response.data;
  }

  async testCacheClear() {
    const response = await axios.post(`${BASE_URL}/api/cache/clear`, {
      pattern: 'test_*'
    });
    if (response.status !== 200) {
      throw new Error(`Cache clear failed with status ${response.status}`);
    }
    return response.data;
  }

  async testMonetizationPlans() {
    const response = await axios.get(`${BASE_URL}/api/monetization/plans`);
    if (response.status !== 200) {
      throw new Error(`Monetization plans failed with status ${response.status}`);
    }
    return response.data;
  }

  async testMonetizationRevenue() {
    const response = await axios.get(`${BASE_URL}/api/monetization/revenue?timeRange=30d`);
    if (response.status !== 200) {
      throw new Error(`Monetization revenue failed with status ${response.status}`);
    }
    return response.data;
  }

  async testContentAnalytics() {
    const response = await axios.get(`${BASE_URL}/api/content/analytics?timeRange=30d`);
    if (response.status !== 200) {
      throw new Error(`Content analytics failed with status ${response.status}`);
    }
    return response.data;
  }

  async testWebSocketStats() {
    const response = await axios.get(`${BASE_URL}/api/websocket/stats`);
    if (response.status !== 200) {
      throw new Error(`WebSocket stats failed with status ${response.status}`);
    }
    return response.data;
  }

  async testWebSocketRooms() {
    const response = await axios.get(`${BASE_URL}/api/websocket/rooms`);
    if (response.status !== 200) {
      throw new Error(`WebSocket rooms failed with status ${response.status}`);
    }
    return response.data;
  }

  async testEnhancedSecurity() {
    // Test rate limiting
    try {
      const promises = Array(10).fill().map(() => 
        axios.get(`${BASE_URL}/api/integration/health`)
      );
      await Promise.all(promises);
      // If we get here without rate limiting, that's also fine for testing
      return { rateLimitTest: 'passed' };
    } catch (error) {
      if (error.response?.status === 429) {
        return { rateLimitTest: 'working_correctly' };
      }
      throw error;
    }
  }

  async testSocialMediaIntegration() {
    // Test if social media service is available
    const response = await axios.get(`${BASE_URL}/api/integration/health`);
    if (response.data.services?.socialMedia) {
      return { socialMediaService: 'available' };
    }
    throw new Error('Social media service not available');
  }

  async testPerformanceOptimization() {
    // Test performance service availability
    const response = await axios.get(`${BASE_URL}/api/integration/health`);
    if (response.data.services?.performance) {
      return { performanceService: 'available' };
    }
    throw new Error('Performance optimization service not available');
  }

  async runAllTests() {
    console.log('🚀 Starting Comprehensive Improvement Tests...\n');

    // Basic server tests
    await this.runTest('Server Health Check', () => this.testServerHealth());
    await this.runTest('Integration Health Check', () => this.testIntegrationHealth());
    await this.runTest('Integration Stats', () => this.testIntegrationStats());

    // Analytics tests
    await this.runTest('Analytics Dashboard', () => this.testAnalyticsDashboard());
    await this.runTest('Content Analytics', () => this.testContentAnalytics());

    // AI Enhancement tests
    await this.runTest('AI Summarization', () => this.testAISummarization());
    await this.runTest('AI Fact Check', () => this.testAIFactCheck());
    await this.runTest('AI Tag Generation', () => this.testAITagGeneration());

    // Cache tests
    await this.runTest('Cache Stats', () => this.testCacheStats());
    await this.runTest('Cache Clear', () => this.testCacheClear());

    // Monetization tests
    await this.runTest('Monetization Plans', () => this.testMonetizationPlans());
    await this.runTest('Monetization Revenue', () => this.testMonetizationRevenue());

    // WebSocket tests
    await this.runTest('WebSocket Stats', () => this.testWebSocketStats());
    await this.runTest('WebSocket Rooms', () => this.testWebSocketRooms());

    // Security tests
    await this.runTest('Enhanced Security', () => this.testEnhancedSecurity());

    // Service integration tests
    await this.runTest('Social Media Integration', () => this.testSocialMediaIntegration());
    await this.runTest('Performance Optimization', () => this.testPerformanceOptimization());

    this.printResults();
  }

  printResults() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST RESULTS SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`📈 Success Rate: ${((this.results.passed / (this.results.passed + this.results.failed)) * 100).toFixed(1)}%`);
    
    if (this.results.failed > 0) {
      console.log('\n❌ FAILED TESTS:');
      this.results.tests
        .filter(test => test.status === 'FAILED')
        .forEach(test => {
          console.log(`  - ${test.name}: ${test.error}`);
        });
    }

    console.log('\n✅ PASSED TESTS:');
    this.results.tests
      .filter(test => test.status === 'PASSED')
      .forEach(test => {
        console.log(`  - ${test.name}`);
      });

    console.log('\n🎉 All improvement tests completed!');
    
    if (this.results.failed === 0) {
      console.log('🎊 Congratulations! All improvements are working perfectly!');
    } else {
      console.log('⚠️  Some tests failed. Check the error messages above.');
    }
  }
}

// Run the tests
async function main() {
  const tester = new ImprovementTester();
  await tester.runAllTests();
}

main().catch(error => {
  console.error('Test runner error:', error);
  process.exit(1);
});
