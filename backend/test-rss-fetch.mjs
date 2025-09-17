import Parser from 'rss-parser';

// Test RSS fetching without AI generation
async function testRSSFetch() {
  console.log('Testing RSS Feed Fetching...\n');
  
  const rssParser = new Parser({ 
    timeout: 20000,
    requestOptions: {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SentinelPP01/2.0; +https://news-app.local) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/rss+xml, application/xml;q=0.9, */*;q=0.8'
      }
    }
  });

  // Test sources from sentinel service
  const testSources = [
    { name: 'Khmer Times', url: 'https://www.khmertimeskh.com/feed/', enabled: true },
    { name: 'BBC World', url: 'https://feeds.bbci.co.uk/news/world/rss.xml', enabled: true },
    { name: 'Reuters World', url: 'https://www.reuters.com/world/rss', enabled: true },
    { name: 'Associated Press', url: 'https://apnews.com/hub/ap-top-news.rss', enabled: true },
    { name: 'Nikkei Asia', url: 'https://asia.nikkei.com/rss.xml', enabled: true }
  ];

  const allItems = [];

  for (const src of testSources) {
    if (src.enabled === false) {
      console.log(`⏭️  Skipping disabled source: ${src.name}`);
      continue;
    }

    try {
      console.log(`🔍 Fetching from ${src.name}...`);
      const feed = await rssParser.parseURL(src.url);
      
      if (!feed || !feed.items) {
        console.log(`❌ No items found for ${src.name}`);
        continue;
      }

      console.log(`✅ Successfully fetched ${feed.items.length} items from ${src.name}`);
      console.log(`   Feed Title: ${feed.title || 'Unknown'}`);
      console.log(`   Feed Description: ${feed.description || 'No description'}`);
      
      // Process first 3 items as example
      const sampleItems = feed.items.slice(0, 3);
      for (const it of sampleItems) {
        const guid = it.guid || it.id || it.link || `${src.name}-${it.title}`;
        const item = { 
          ...it, 
          sourceName: src.name, 
          guid,
          sourceReliability: 0.9,
          sourcePriority: 'high'
        };
        
        allItems.push(item);
        
        console.log(`   📰 Item: ${it.title?.slice(0, 60)}...`);
        console.log(`      Link: ${it.link}`);
        console.log(`      Published: ${it.isoDate || it.pubDate || 'Unknown'}`);
        console.log(`      Source: ${src.name}`);
        console.log(`      GUID: ${guid}`);
        console.log('');
      }
      
    } catch (e) {
      console.log(`❌ RSS fetch failed for ${src.name}: ${e.message}`);
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   Total items fetched: ${allItems.length}`);
  console.log(`   Sources tested: ${testSources.filter(s => s.enabled !== false).length}`);
  
  if (allItems.length > 0) {
    console.log(`\n🔍 Sample source information that would be saved:`);
    const sample = allItems[0];
    console.log(`   Source Name: ${sample.sourceName}`);
    console.log(`   Source URL: ${sample.link}`);
    console.log(`   Published At: ${sample.isoDate || sample.pubDate}`);
    console.log(`   GUID: ${sample.guid}`);
    console.log(`   Title: ${sample.title}`);
  }
}

testRSSFetch().catch(console.error);


