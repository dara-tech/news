import fs from 'fs';

async function testNewsSitemapFix() {
  console.log('🔍 Testing News Sitemap Middleware Fix...\n');

  try {
    // Check if middleware file exists
    if (!fs.existsSync('frontend/src/middleware.ts')) {
      console.log('❌ middleware.ts not found');
      return;
    }

    console.log('✅ Middleware file exists');

    // Read the middleware content
    const content = fs.readFileSync('frontend/src/middleware.ts', 'utf8');

    // Check if news-sitemap.xml is excluded from language redirects
    if (content.includes('news-sitemap.xml')) {
      console.log('✅ news-sitemap.xml is excluded from language redirects');
      console.log('✅ This will prevent the 307 redirect to /en/news-sitemap.xml');
    } else {
      console.log('❌ news-sitemap.xml is NOT excluded from language redirects');
      console.log('❌ This will cause 307 redirects');
    }

    // Check the exact matcher pattern
    const matcherPattern = content.match(/matcher:\s*\[([\s\S]*?)\]/);
    if (matcherPattern) {
      console.log('\n📋 Current matcher pattern:');
      console.log(matcherPattern[1].trim());
    }

    console.log('\n🚀 Next Steps:');
    console.log('1. Deploy the middleware fix:');
    console.log('   git add .');
    console.log('   git commit -m "Fix news sitemap middleware redirect"');
    console.log('   git push');
    
    console.log('\n2. Wait for deployment (5-10 minutes)');
    
    console.log('\n3. Test the news sitemap:');
    console.log('   curl -I https://www.razewire.online/news-sitemap.xml');
    console.log('   Expected: 200 OK (not 307 redirect)');
    
    console.log('\n4. Check the content:');
    console.log('   curl https://www.razewire.online/news-sitemap.xml');
    console.log('   Expected: XML sitemap content');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testNewsSitemapFix();
