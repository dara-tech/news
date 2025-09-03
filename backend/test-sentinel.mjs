import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import sentinelService from './services/sentinelService.mjs';
import logger from '../utils/logger.mjs';

dotenv.config();

async function testSentinel() {
  // Check environment variables
  logger.info('📋 Environment Check:');
  logger.info('- GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? '✅ Set' : '❌ Missing');
  logger.info('- GOOGLE_API_KEY:', process.env.GOOGLE_API_KEY ? '✅ Set' : '❌ Missing');
  logger.info('- SENTINEL_ENABLED:', process.env.SENTINEL_ENABLED);
  logger.info('- SENTINEL_FREQUENCY_MS:', process.env.SENTINEL_FREQUENCY_MS);
  logger.info('- SENTINEL_MAX_PER_RUN:', process.env.SENTINEL_MAX_PER_RUN);
  logger.info('');

  // Test Gemini API connection
  logger.info('🤖 Testing Gemini API...');
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  
  if (!apiKey) {
    logger.info('❌ No API key found. Please set GEMINI_API_KEY in your .env file');
    return;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const result = await model.generateContent('Hello, this is a test message.');
    const response = await result.response;
    const text = response.text();
    
    logger.info('✅ Gemini API test successful');
    logger.info('Response:', text.substring(0, 100) + '...');
    logger.info('');
  } catch (error) {
    logger.info('❌ Gemini API test failed:', error.message);
    logger.info('');
    return;
  }

  // Test Sentinel service
  logger.info('🛡️ Testing Sentinel Service...');
  
  try {
    // Test configuration loading
    logger.info('📖 Loading configuration...');
    const config = await sentinelService.loadConfig();
    logger.info('✅ Configuration loaded:', {
      enabled: config.enabled,
      autoPersist: config.autoPersist,
      frequencyMs: config.frequencyMs,
      sourcesCount: config.sources?.length || 0
    });
    logger.info('');

    // Test source fetching
    logger.info('📡 Testing source fetching...');
    const items = await sentinelService.fetchAllSources();
    logger.info(`✅ Fetched ${items.length} items from sources`);
    
    if (items.length > 0) {
      logger.info('Sample item:', {
        title: items[0].title,
        source: items[0].sourceName,
        link: items[0].link
      });
    }
    logger.info('');

    // Test significance filtering
    logger.info('🎯 Testing significance filtering...');
    const significant = await sentinelService.filterSignificant(items);
    logger.info(`✅ Found ${significant.length} significant items out of ${items.length} total`);
    logger.info('');

    // Test run-once (preview mode)
    logger.info('🚀 Testing run-once (preview mode)...');
    const result = await sentinelService.runOnce({ persistOverride: false });
    logger.info('✅ Run-once completed:', {
      processed: result.processed,
      created: result.created,
      previews: result.previews?.length || 0
    });
    
    if (result.previews && result.previews.length > 0) {
      logger.info('Sample preview:', {
        title: result.previews[0].title,
        category: result.previews[0].category,
        source: result.previews[0].source.name
      });
    }
    logger.info('');

  } catch (error) {
    logger.info('❌ Sentinel service test failed:', error.message);
    logger.info('Stack trace:', error.stack);
    logger.info('');
  }

  // Test logs
  logger.info('📝 Recent logs:');
  const logs = sentinelService.logBuffer || [];
  logs.slice(-5).forEach(log => {
    logger.info(`[${log.level.toUpperCase()}] ${log.message}`);
  });
  logger.info('');

  logger.info('✅ Sentinel test completed!');
}

// Run the test
testSentinel().catch(console.error);
