import fs from 'fs';

async function testNewsSitemapFix() {
  console.log('🔍 Testing News Sitemap Fix After Rename...\n');

  try {
    // Check if the renamed file exists
    if (!fs.existsSync('frontend/src/app/news-sitemap.xml.ts')) {
      console.log('❌ news-sitemap.xml.ts not found');
      return;
    }

    console.log('✅ news-sitemap.xml.ts file exists');

    // Check if the old file is gone
    if (fs.existsSync('frontend/src/app/news-sitemap.ts')) {
      console.log('❌ Old news-sitemap.ts still exists (should be renamed)');
    } else {
      console.log('✅ Old news-sitemap.ts has been properly renamed');
    }

    // Read the file content to verify it's correct
    const content = fs.readFileSync('frontend/src/app/news-sitemap.xml.ts', 'utf8');

    // Check for key components
    const checks = [
      {
        name: 'MetadataRoute import',
        pattern: /import.*MetadataRoute.*from.*next/,
        description: 'Proper Next.js sitemap import'
      },
      {
        name: 'Fallback function',
        pattern: /function getFallbackNewsSitemap/,
        description: 'Robust fallback system'
      },
      {
        name: 'News URLs',
        pattern: /url: \`\$\{URL\}\/news\`/,
        description: 'Main news page included'
      },
      {
        name: 'Category URLs',
        pattern: /category=technology/,
        description: 'Category pages included'
      }
    ];

    console.log('\n📋 Checking News Sitemap Content:');
    let passedChecks = 0;

    checks.forEach(check => {
      if (check.pattern.test(content)) {
        console.log(`✅ ${check.name}: ${check.description}`);
        passedChecks++;
      } else {
        console.log(`❌ ${check.name}: Missing`);
      }
    });

    console.log(`\n📊 Results: ${passedChecks}/${checks.length} checks passed`);

    if (passedChecks >= 3) {
      console.log('\n🎉 News sitemap file is properly configured!');
      
      console.log('\n🚀 Next Steps:');
      console.log('1. Wait for deployment (5-10 minutes)');
      
      console.log('\n2. Test the news sitemap:');
      console.log('   curl -I https://www.razewire.online/news-sitemap.xml');
      console.log('   Expected: 200 OK with Content-Type: application/xml');
      
      console.log('\n3. Check the XML content:');
      console.log('   curl https://www.razewire.online/news-sitemap.xml');
      console.log('   Expected: XML sitemap with news URLs');
      
      console.log('\n4. Submit to Google Search Console:');
      console.log('   - Add sitemap: news-sitemap.xml');
      console.log('   - Monitor indexing status');
      
      console.log('\n📈 Expected Results:');
      console.log('- ✅ News sitemap accessible at /news-sitemap.xml');
      console.log('- ✅ Proper XML format (not HTML)');
      console.log('- ✅ 10+ news URLs available');
      console.log('- ✅ Google News optimization');
      
    } else {
      console.log('\n⚠️ Some components are missing. Please check the file.');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testNewsSitemapFix();
