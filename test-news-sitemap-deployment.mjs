import fs from 'fs';

async function testNewsSitemapDeployment() {
  console.log('🔍 Testing News Sitemap Deployment...\n');

  try {
    // Check if news sitemap file exists
    if (!fs.existsSync('frontend/src/app/news-sitemap.ts')) {
      console.log('❌ news-sitemap.ts not found');
      return;
    }

    console.log('✅ News sitemap file exists');

    // Read the file content
    const content = fs.readFileSync('frontend/src/app/news-sitemap.ts', 'utf8');

    // Check for key improvements
    const checks = [
      {
        name: 'Fallback function',
        pattern: /function getFallbackNewsSitemap/,
        description: 'Robust fallback system'
      },
      {
        name: 'Reduced timeout',
        pattern: /timeoutId = setTimeout\(\(\) => controller\.abort\(\), 8000\)/,
        description: 'Faster fallback (8 seconds)'
      },
      {
        name: 'Reduced limit',
        pattern: /limit: 100/,
        description: 'Faster API response (100 articles)'
      },
      {
        name: 'Fallback return',
        pattern: /return getFallbackNewsSitemap\(\)/,
        description: 'Always returns content'
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

    console.log('\n📋 Checking News Sitemap Improvements:');
    let passedChecks = 0;

    checks.forEach(check => {
      if (check.pattern.test(content)) {
        console.log(`✅ ${check.name}: ${check.description}`);
        passedChecks++;
      } else {
        console.log(`❌ ${check.name}: Missing`);
      }
    });

    console.log(`\n📊 Results: ${passedChecks}/${checks.length} improvements applied`);

    if (passedChecks >= 5) {
      console.log('\n🎉 News sitemap is ready for deployment!');
      
      console.log('\n🚀 Deployment Steps:');
      console.log('1. Commit the changes:');
      console.log('   git add .');
      console.log('   git commit -m "Add robust fallback to news sitemap"');
      console.log('   git push');
      
      console.log('\n2. Wait for deployment (5-10 minutes)');
      
      console.log('\n3. Test the news sitemap:');
      console.log('   https://www.razewire.online/news-sitemap.xml');
      
      console.log('\n4. Submit to Google Search Console:');
      console.log('   - Go to Google Search Console');
      console.log('   - Add sitemap: news-sitemap.xml');
      console.log('   - Monitor indexing status');
      
      console.log('\n📈 Expected Results:');
      console.log('- ✅ News sitemap accessible');
      console.log('- ✅ 10+ news URLs available');
      console.log('- ✅ Google News optimization');
      console.log('- ✅ Better news search rankings');
      
    } else {
      console.log('\n⚠️ Some improvements are missing. Please check the file.');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testNewsSitemapDeployment();
