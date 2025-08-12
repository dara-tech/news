import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import sentinelService from './services/sentinelService.mjs';

dotenv.config();

async function testSentinel() {
  console.log('🔍 Testing Sentinel System...\n');

  // Check environment variables
  console.log('📋 Environment Check:');
  console.log('- GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? '✅ Set' : '❌ Missing');
  console.log('- GOOGLE_API_KEY:', process.env.GOOGLE_API_KEY ? '✅ Set' : '❌ Missing');
  console.log('- SENTINEL_ENABLED:', process.env.SENTINEL_ENABLED);
  console.log('- SENTINEL_FREQUENCY_MS:', process.env.SENTINEL_FREQUENCY_MS);
  console.log('- SENTINEL_MAX_PER_RUN:', process.env.SENTINEL_MAX_PER_RUN);
  console.log('');

  // Test Gemini API connection
  console.log('🤖 Testing Gemini API...');
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  
  if (!apiKey) {
    console.log('❌ No API key found. Please set GEMINI_API_KEY in your .env file');
    return;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const result = await model.generateContent('Hello, this is a test message.');
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ Gemini API test successful');
    console.log('Response:', text.substring(0, 100) + '...');
    console.log('');
  } catch (error) {
    console.log('❌ Gemini API test failed:', error.message);
    console.log('');
    return;
  }

  // Test Sentinel service
  console.log('🛡️ Testing Sentinel Service...');
  
  try {
    // Test configuration loading
    console.log('📖 Loading configuration...');
    const config = await sentinelService.loadConfig();
    console.log('✅ Configuration loaded:', {
      enabled: config.enabled,
      autoPersist: config.autoPersist,
      frequencyMs: config.frequencyMs,
      sourcesCount: config.sources?.length || 0
    });
    console.log('');

    // Test source fetching
    console.log('📡 Testing source fetching...');
    const items = await sentinelService.fetchAllSources();
    console.log(`✅ Fetched ${items.length} items from sources`);
    
    if (items.length > 0) {
      console.log('Sample item:', {
        title: items[0].title,
        source: items[0].sourceName,
        link: items[0].link
      });
    }
    console.log('');

    // Test significance filtering
    console.log('🎯 Testing significance filtering...');
    const significant = await sentinelService.filterSignificant(items);
    console.log(`✅ Found ${significant.length} significant items out of ${items.length} total`);
    console.log('');

    // Test run-once (preview mode)
    console.log('🚀 Testing run-once (preview mode)...');
    const result = await sentinelService.runOnce({ persistOverride: false });
    console.log('✅ Run-once completed:', {
      processed: result.processed,
      created: result.created,
      previews: result.previews?.length || 0
    });
    
    if (result.previews && result.previews.length > 0) {
      console.log('Sample preview:', {
        title: result.previews[0].title,
        category: result.previews[0].category,
        source: result.previews[0].source.name
      });
    }
    console.log('');

  } catch (error) {
    console.log('❌ Sentinel service test failed:', error.message);
    console.log('Stack trace:', error.stack);
    console.log('');
  }

  // Test logs
  console.log('📝 Recent logs:');
  const logs = sentinelService.logBuffer || [];
  logs.slice(-5).forEach(log => {
    console.log(`[${log.level.toUpperCase()}] ${log.message}`);
  });
  console.log('');

  console.log('✅ Sentinel test completed!');
}

// Run the test
testSentinel().catch(console.error);
