import sentinelService from './services/sentinelService.mjs';
import logger from '../utils/logger.mjs';

async function testSentinelFixes() {
  logger.info('🧪 Testing Sentinel-PP-01 Fixes...\n');

  try {
    // 1. Reset the system to clear cache
    logger.info('1️⃣ Resetting system...');
    sentinelService.resetSystem();
    
    // 2. Check cache stats
    logger.info('2️⃣ Cache statistics:');
    const cacheStats = sentinelService.getCacheStats();
    logger.info('   - Last seen GUIDs:', cacheStats.lastSeenGuidsSize);
    logger.info('   - Content hash cache:', cacheStats.contentHashCacheSize);
    logger.info('   - In cooldown:', cacheStats.isInCooldown);

    // 3. Test RSS fetching
    logger.info('\n3️⃣ Testing RSS fetching...');
    const items = await sentinelService.fetchAllSources();
    logger.info(`   - Total items fetched: ${items.length}`);

    // 4. Test content filtering
    logger.info('\n4️⃣ Testing content filtering...');
    const significant = await sentinelService.filterSignificant(items);
    logger.info(`   - Significant items: ${significant.length}`);
    logger.info(`   - Average quality score: ${Math.round(significant.reduce((sum, item) => sum + (item.qualityScore || 0), 0) / Math.max(1, significant.length))}`);

    // 5. Test content analysis (on first item if available)
    if (significant.length > 0) {
      logger.info('\n5️⃣ Testing content analysis...');
      const firstItem = significant[0];
      logger.info(`   - Testing with: ${firstItem.title?.slice(0, 60)}...`);
      
      const enhancedContent = await sentinelService.analyzeAndEnhanceContent(firstItem);
      if (enhancedContent) {
        logger.info('   ✅ Content analysis successful');
        logger.info(`   - Enhanced title: ${enhancedContent.enhancedTitle?.slice(0, 60)}...`);
        logger.info(`   - Relevance score: ${enhancedContent.relevanceScore}`);
        logger.info(`   - Sentiment: ${enhancedContent.sentiment}`);
        logger.info(`   - Impact level: ${enhancedContent.impactLevel}`);
      } else {
        logger.info('   ❌ Content analysis failed');
      }
    }

    // 6. Test Khmer translation (if enabled)
    if (process.env.SENTINEL_TRANSLATE_KH === 'true' && significant.length > 0) {
      logger.info('\n6️⃣ Testing Khmer translation...');
      const firstItem = significant[0];
      const enhancedContent = await sentinelService.analyzeAndEnhanceContent(firstItem);
      
      if (enhancedContent) {
        const translation = await sentinelService.translateToKhmer(enhancedContent);
        if (translation) {
          logger.info('   ✅ Khmer translation successful');
          logger.info(`   - Khmer title: ${translation.khmerTitle?.slice(0, 30)}...`);
          logger.info(`   - Translation quality: ${translation.translationQuality}`);
        } else {
          logger.info('   ❌ Khmer translation failed');
        }
      }
    }

    // 7. Test draft generation (preview mode)
    logger.info('\n7️⃣ Testing draft generation (preview mode)...');
    const result = await sentinelService.runOnce({ persistOverride: false });
    logger.info(`   - Processed: ${result.processed}`);
    logger.info(`   - Created: ${result.created}`);
    logger.info(`   - Previews: ${result.previews?.length || 0}`);
    logger.info(`   - Processing time: ${Math.round(result.performance?.processingTime / 1000)}s`);

    logger.info('\n✅ Sentinel-PP-01 test completed successfully!');

  } catch (error) {
    logger.error('❌ Test failed:', error.message);
    logger.error(error.stack);
  }
}

// Run the test
testSentinelFixes();
