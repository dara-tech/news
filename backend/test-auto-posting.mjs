import socialMediaService from './services/socialMediaService.mjs';

// Test the auto-posting functionality
async function testAutoPosting() {
  console.log('🧪 Testing Auto-Posting Functionality...\n');

  // Simulate a news article
  const testNewsArticle = {
    title: { en: 'Test Article: Auto-Posting Feature' },
    description: { en: 'This is a test article to demonstrate the auto-posting functionality to social media platforms.' },
    content: { en: 'This article tests the automatic social media posting feature that shares content when articles are published.' },
    slug: 'test-auto-posting-article',
    category: { name: { en: 'Technology' } },
    thumbnail: 'https://example.com/test-image.jpg',
    author: { username: 'testuser' }
  };

  const testUser = {
    _id: 'test-user-id',
    username: 'testuser',
    email: 'test@example.com'
  };

  try {
    console.log('📝 Test Article:');
    console.log(`Title: ${testNewsArticle.title.en}`);
    console.log(`Description: ${testNewsArticle.description.en}`);
    console.log(`Category: ${testNewsArticle.category.name.en}`);
    console.log(`Slug: ${testNewsArticle.slug}\n`);

    console.log('🚀 Attempting auto-post to social media...\n');

    // Test the auto-posting service
    const result = await socialMediaService.autoPostContent(testNewsArticle, testUser);

    console.log('📊 Auto-Posting Results:');
    console.log(`Success: ${result.success}`);
    console.log(`Message: ${result.message}`);
    console.log(`Total Platforms: ${result.totalPlatforms}`);
    console.log(`Successful Posts: ${result.successfulPosts}\n`);

    if (result.results && result.results.length > 0) {
      console.log('📱 Platform Results:');
      result.results.forEach((platformResult, index) => {
        console.log(`${index + 1}. ${platformResult.platform.toUpperCase()}:`);
        console.log(`   Success: ${platformResult.success}`);
        console.log(`   Message: ${platformResult.message}`);
        if (platformResult.url) {
          console.log(`   URL: ${platformResult.url}`);
        }
        console.log('');
      });
    }

    // Test content generation for different platforms
    console.log('📝 Testing Content Generation for Different Platforms:\n');
    
    const platforms = ['facebook', 'twitter', 'linkedin', 'instagram'];
    platforms.forEach(platform => {
      const content = socialMediaService.generatePostContent(testNewsArticle, platform);
      console.log(`${platform.toUpperCase()} Content:`);
      console.log(`"${content}"`);
      console.log(`Length: ${content.length} characters\n`);
    });

    console.log('✅ Auto-posting test completed successfully!');
    console.log('\n💡 Note: This is a simulation. In production, you would need to:');
    console.log('   1. Configure real API credentials for each platform');
    console.log('   2. Uncomment the actual API calls in socialMediaService.mjs');
    console.log('   3. Set up proper authentication and permissions');

  } catch (error) {
    console.error('❌ Auto-posting test failed:', error.message);
  }
}

// Run the test
testAutoPosting(); 