import sentinelService from './services/sentinelService.mjs';

async function testSentinelFixes() {
  console.log('🧪 Testing Sentinel-PP-01 Fixes...\n');

  try {
    // 1. Reset the system to clear cache
    console.log('1️⃣ Resetting system...');
    sentinelService.resetSystem();
    
    // 2. Check cache stats
    console.log('2️⃣ Cache statistics:');
    const cacheStats = sentinelService.getCacheStats();
    console.log('   - Last seen GUIDs:', cacheStats.lastSeenGuidsSize);
    console.log('   - Content hash cache:', cacheStats.contentHashCacheSize);
    console.log('   - In cooldown:', cacheStats.isInCooldown);

    // 3. Test RSS fetching
    console.log('\n3️⃣ Testing RSS fetching...');
    const items = await sentinelService.fetchAllSources();
    console.log(`   - Total items fetched: ${items.length}`);

    // 4. Test content filtering
    console.log('\n4️⃣ Testing content filtering...');
    const significant = await sentinelService.filterSignificant(items);
    console.log(`   - Significant items: ${significant.length}`);
    console.log(`   - Average quality score: ${Math.round(significant.reduce((sum, item) => sum + (item.qualityScore || 0), 0) / Math.max(1, significant.length))}`);

    // 5. Test content analysis (on first item if available)
    if (significant.length > 0) {
      console.log('\n5️⃣ Testing content analysis...');
      const firstItem = significant[0];
      console.log(`   - Testing with: ${firstItem.title?.slice(0, 60)}...`);
      
      const enhancedContent = await sentinelService.analyzeAndEnhanceContent(firstItem);
      if (enhancedContent) {
        console.log('   ✅ Content analysis successful');
        console.log(`   - Enhanced title: ${enhancedContent.enhancedTitle?.slice(0, 60)}...`);
        console.log(`   - Relevance score: ${enhancedContent.relevanceScore}`);
        console.log(`   - Sentiment: ${enhancedContent.sentiment}`);
        console.log(`   - Impact level: ${enhancedContent.impactLevel}`);
      } else {
        console.log('   ❌ Content analysis failed');
      }
    }

    // 6. Test Khmer translation (if enabled)
    if (process.env.SENTINEL_TRANSLATE_KH === 'true' && significant.length > 0) {
      console.log('\n6️⃣ Testing Khmer translation...');
      const firstItem = significant[0];
      const enhancedContent = await sentinelService.analyzeAndEnhanceContent(firstItem);
      
      if (enhancedContent) {
        const translation = await sentinelService.translateToKhmer(enhancedContent);
        if (translation) {
          console.log('   ✅ Khmer translation successful');
          console.log(`   - Khmer title: ${translation.khmerTitle?.slice(0, 30)}...`);
          console.log(`   - Translation quality: ${translation.translationQuality}`);
        } else {
          console.log('   ❌ Khmer translation failed');
        }
      }
    }

    // 7. Test draft generation (preview mode)
    console.log('\n7️⃣ Testing draft generation (preview mode)...');
    const result = await sentinelService.runOnce({ persistOverride: false });
    console.log(`   - Processed: ${result.processed}`);
    console.log(`   - Created: ${result.created}`);
    console.log(`   - Previews: ${result.previews?.length || 0}`);
    console.log(`   - Processing time: ${Math.round(result.performance?.processingTime / 1000)}s`);

    console.log('\n✅ Sentinel-PP-01 test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  }
}

// Run the test
testSentinelFixes();
