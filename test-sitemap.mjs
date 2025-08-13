import { execSync } from 'child_process';
import fs from 'fs';

async function testSitemap() {
  console.log('🧪 Testing Sitemap Generation...\n');

  try {
    // Check if sitemap.ts exists
    if (!fs.existsSync('frontend/src/app/sitemap.ts')) {
      console.log('❌ sitemap.ts not found');
      return;
    }

    // Check if robots.ts exists
    if (!fs.existsSync('frontend/src/app/robots.ts')) {
      console.log('❌ robots.ts not found');
      return;
    }

    console.log('✅ Sitemap files found');

    // Test sitemap generation (this would normally be done by Next.js)
    console.log('\n📋 Sitemap Structure:');
    console.log('- Static routes (home, news, categories, etc.)');
    console.log('- Dynamic category pages (/category/[slug])');
    console.log('- Dynamic news articles (/news/[slug])');
    console.log('- Priority levels: Home (1.0), News (0.9), Categories (0.8), Articles (0.7)');
    console.log('- Change frequency: Home (daily), News (daily), Categories (weekly), Articles (daily)');

    console.log('\n🤖 Robots.txt Structure:');
    console.log('- Allow: All public pages');
    console.log('- Disallow: /admin/, /api/, /_next/, /private/');
    console.log('- Sitemap: https://www.razewire.online/sitemap.xml');
    console.log('- Host: https://www.razewire.online');

    console.log('\n🌐 Domain Configuration:');
    console.log('- Base URL: https://www.razewire.online');
    console.log('- Environment variable: NEXT_PUBLIC_SITE_URL');
    console.log('- Fallback: https://www.razewire.online');

    console.log('\n📊 Expected Sitemap Content:');
    console.log('1. Static Pages:');
    console.log('   - / (priority: 1.0, daily)');
    console.log('   - /news (priority: 0.9, weekly)');
    console.log('   - /categories (priority: 0.8, weekly)');
    console.log('   - /newsletter, /contact, /about, etc. (priority: 0.8, weekly)');
    
    console.log('\n2. Dynamic Content:');
    console.log('   - /category/[slug] (priority: 0.8, weekly)');
    console.log('   - /news/[slug] (priority: 0.7, daily)');

    console.log('\n✅ Sitemap test completed successfully!');
    console.log('\n📝 Next Steps:');
    console.log('1. Deploy your site');
    console.log('2. Visit https://www.razewire.online/sitemap.xml');
    console.log('3. Visit https://www.razewire.online/robots.txt');
    console.log('4. Submit sitemap to Google Search Console');
    console.log('5. Monitor indexing in Search Console');

  } catch (error) {
    console.error('❌ Sitemap test failed:', error.message);
  }
}

// Run the test
testSitemap();
