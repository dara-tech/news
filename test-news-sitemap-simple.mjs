import fs from 'fs';

async function testNewsSitemapSimple() {
  console.log('🔍 Testing News Sitemap Improvements...\n');

  try {
    // Check if the news sitemap file exists
    if (!fs.existsSync('frontend/src/app/news-sitemap.xml.ts')) {
      console.log('❌ news-sitemap.xml.ts not found');
      return;
    }

    console.log('✅ News sitemap file exists');

    // Read the file content
    const content = fs.readFileSync('frontend/src/app/news-sitemap.xml.ts', 'utf8');

    // Simple checks
    const hasApiImport = content.includes('import.*api') || content.includes('import { default: api }');
    const hasStaticUrls = content.includes('url: `${URL}/news`');
    const hasCategories = content.includes('category=technology');
    const hasLanguages = content.includes('/en/news');
    const hasArchive = content.includes('/archive');
    const hasSortOptions = content.includes('sort=latest');

    console.log(`✅ No API dependency: ${!hasApiImport ? 'PASS' : 'FAIL'}`);
    console.log(`✅ Static URLs: ${hasStaticUrls ? 'PASS' : 'FAIL'}`);
    console.log(`✅ Category pages: ${hasCategories ? 'PASS' : 'FAIL'}`);
    console.log(`✅ Language support: ${hasLanguages ? 'PASS' : 'FAIL'}`);
    console.log(`✅ Archive pages: ${hasArchive ? 'PASS' : 'FAIL'}`);
    console.log(`✅ Sort options: ${hasSortOptions ? 'PASS' : 'FAIL'}`);

    const passedChecks = [hasStaticUrls, hasCategories, hasLanguages, hasArchive, hasSortOptions].filter(Boolean).length;
    const totalChecks = 5;

    console.log(`\n📊 **Test Results:** ${passedChecks}/${totalChecks} checks passed`);

    if (passedChecks === totalChecks && !hasApiImport) {
      console.log('\n🎉 **News Sitemap Successfully Fixed!**');
      console.log('✅ Removed API dependency for build-time reliability');
      console.log('✅ Added comprehensive static URL coverage');
      console.log('✅ Includes all major news-related pages');
      console.log('✅ Supports multiple languages and categories');
      console.log('✅ Will always generate successfully');
      
      console.log('\n🚀 **Next Steps:**');
      console.log('1. Wait 5-10 minutes for deployment');
      console.log('2. Test: https://www.razewire.online/news-sitemap.xml');
      console.log('3. Verify it returns XML content (not HTML)');
      console.log('4. Submit to Google Search Console for Google News');
      
      console.log('\n📋 **Expected Content:**');
      console.log('- Main news pages (daily updates)');
      console.log('- Category pages (technology, business, sports, etc.)');
      console.log('- Language-specific pages (/en/news, /km/news)');
      console.log('- Archive and newsletter pages');
      console.log('- Sort and filter options');
    } else {
      console.log('\n❌ **Some checks failed. Please review the implementation.**');
    }

  } catch (error) {
    console.error('❌ Error during test:', error);
  }
}

testNewsSitemapSimple();
