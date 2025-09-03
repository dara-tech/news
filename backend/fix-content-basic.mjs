import dotenv from 'dotenv';
import connectDB from './config/db.mjs';
import News from './models/News.mjs';
import User from './models/User.mjs';
import Category from './models/Category.mjs';
import { formatArticleContent } from './utils/contentFormatter.mjs';
import logger from '../utils/logger.mjs';

// Load environment variables
dotenv.config();

async function fixContentFormattingBasic() {
  logger.info('🔧 Starting basic content formatting fix...\n');
  
  try {
    // Connect to database
    await connectDB();
    logger.info('✅ Connected to database\n');
    
    // Find articles that need fixing
    const articlesToFix = await News.find({
      status: { $in: ['draft', 'published'] }
    }).sort({ createdAt: -1 });
    
    logger.info(`📊 Found ${articlesToFix.length} articles to process\n`);
    
    let successCount = 0;
    let errorCount = 0;
    let skippedCount = 0;
    
    for (const article of articlesToFix) {
      try {
        logger.info(`\n🔄 Processing: ${article.title?.en || 'No title'}`);
        logger.info(`   Status: ${article.status}`);
        
        // Check current state
        const hasKhmerContent = !!article.content?.kh && article.content.kh.length > 0;
        const hasEnglishHtml = article.content?.en?.includes('<');
        const hasKhmerHtml = article.content?.kh?.includes('<');
        
        logger.info(`   Current state:`);
        logger.info(`     - Khmer content: ${hasKhmerContent ? '✅' : '❌'}`);
        logger.info(`     - English HTML: ${hasEnglishHtml ? '✅' : '❌'}`);
        logger.info(`     - Khmer HTML: ${hasKhmerHtml ? '✅' : '❌'}`);
        
        // Get content
        const englishContent = article.content?.en || '';
        const khmerContent = article.content?.kh || '';
        
        if (!englishContent) {
          logger.info(`   ⏭️  Skipping - missing English content`);
          skippedCount++;
          continue;
        }
        
        let needsUpdate = false;
        const updates = {};
        
        // Fix 1: Format English content if not formatted
        if (!hasEnglishHtml && englishContent.trim()) {
          logger.info(`   🎨 Formatting English content...`);
          const formattedEn = formatArticleContent(englishContent);
          updates['content.en'] = formattedEn;
          logger.info(`   ✅ English content formatted`);
          needsUpdate = true;
        }
        
        // Fix 2: Format Khmer content if not formatted
        if (khmerContent && !hasKhmerHtml) {
          logger.info(`   🎨 Formatting Khmer content...`);
          const formattedKh = formatArticleContent(khmerContent);
          updates['content.kh'] = formattedKh;
          logger.info(`   ✅ Khmer content formatted`);
          needsUpdate = true;
        }
        
        // Apply updates if needed
        if (needsUpdate) {
          await News.findByIdAndUpdate(article._id, {
            $set: updates
          });
          logger.info(`   💾 Article updated successfully`);
          successCount++;
        } else {
          logger.info(`   ✅ Article already properly formatted`);
          skippedCount++;
        }
        
      } catch (error) {
        logger.error(`   💥 Error processing article: ${error.message}`);
        errorCount++;
      }
    }
    
    logger.info(`\n📈 Processing Summary:`);
    logger.info(`  ✅ Successfully processed: ${successCount}`);
    logger.info(`  ⏭️  Skipped (already good): ${skippedCount}`);
    logger.info(`  ❌ Errors: ${errorCount}`);
    logger.info(`  📊 Total articles: ${articlesToFix.length}`);
    
  } catch (error) {
    logger.error('💥 Script failed:', error);
  } finally {
    process.exit(0);
  }
}

fixContentFormattingBasic();

