import dotenv from 'dotenv';
import connectDB from './config/db.mjs';
import News from './models/News.mjs';
import logger from '../utils/logger.mjs';

// Load environment variables
dotenv.config({ path: './backend/.env' });

async function fixContentFormatting() {
  logger.info('🔧 Starting content formatting fix for articles...\n');
  
  try {
    // Connect to database
    await connectDB();
    logger.info('✅ Connected to database\n');
    
    // Find articles with formatting issues
    const articlesToFix = await News.find({
      status: { $in: ['draft', 'published'] },
      $or: [
        // Articles with HTML tags in content
        { 'content.en': { $regex: /<html>/i } },
        { 'content.kh': { $regex: /<html>/i } },
        // Articles with empty quotes at the end
        { 'content.en': { $regex: /''\s*$/ } },
        { 'content.kh': { $regex: /''\s*$/ } },
        // Articles with other HTML artifacts
        { 'content.en': { $regex: /<[^>]*>/ } },
        { 'content.kh': { $regex: /<[^>]*>/ } }
      ]
    }).sort({ createdAt: -1 });
    
    logger.info(`📊 Found ${articlesToFix.length} articles with formatting issues\n`);
    
    if (articlesToFix.length === 0) {
      logger.info('🎉 No articles with formatting issues found!');
      return;
    }
    
    let successCount = 0;
    let errorCount = 0;
    let skippedCount = 0;
    
    for (const article of articlesToFix) {
      try {
        logger.info(`\n🔄 Processing: ${article.title?.en || 'No title'}`);
        logger.info(`   Status: ${article.status}`);
        
        let needsUpdate = false;
        const updates = {};
        
        // Fix English content
        if (article.content?.en) {
          let fixedContent = article.content.en;
          let originalContent = fixedContent;
          
          // Remove HTML tags at the beginning
          if (fixedContent.startsWith('<html>')) {
            fixedContent = fixedContent.replace(/^<html>\s*/i, '');
            logger.info(`   🔧 Removed <html> tag from English content`);
          }
          
          // Remove empty quotes at the end
          fixedContent = fixedContent.replace(/''\s*$/, '');
          if (fixedContent !== originalContent && !fixedContent.includes("''")) {
            logger.info(`   🔧 Removed empty quotes from end of English content`);
          }
          
          // Remove any other HTML tags
          const htmlTagRegex = /<[^>]*>/g;
          if (htmlTagRegex.test(fixedContent)) {
            fixedContent = fixedContent.replace(htmlTagRegex, '');
            logger.info(`   🔧 Removed HTML tags from English content`);
          }
          
          // Clean up extra whitespace
          fixedContent = fixedContent.trim();
          
          if (fixedContent !== originalContent) {
            updates['content.en'] = fixedContent;
            needsUpdate = true;
            logger.info(`   ✅ English content cleaned`);
          }
        }
        
        // Fix Khmer content
        if (article.content?.kh) {
          let fixedContent = article.content.kh;
          let originalContent = fixedContent;
          
          // Remove HTML tags at the beginning
          if (fixedContent.startsWith('<html>')) {
            fixedContent = fixedContent.replace(/^<html>\s*/i, '');
            logger.info(`   🔧 Removed <html> tag from Khmer content`);
          }
          
          // Remove empty quotes at the end
          fixedContent = fixedContent.replace(/''\s*$/, '');
          if (fixedContent !== originalContent && !fixedContent.includes("''")) {
            logger.info(`   🔧 Removed empty quotes from end of Khmer content`);
          }
          
          // Remove any other HTML tags
          const htmlTagRegex = /<[^>]*>/g;
          if (htmlTagRegex.test(fixedContent)) {
            fixedContent = fixedContent.replace(htmlTagRegex, '');
            logger.info(`   🔧 Removed HTML tags from Khmer content`);
          }
          
          // Clean up extra whitespace
          fixedContent = fixedContent.trim();
          
          if (fixedContent !== originalContent) {
            updates['content.kh'] = fixedContent;
            needsUpdate = true;
            logger.info(`   ✅ Khmer content cleaned`);
          }
        }
        
        // Apply updates if needed
        if (needsUpdate) {
          await News.findByIdAndUpdate(article._id, {
            $set: updates
          });
          logger.info(`   💾 Article formatting updated successfully`);
          successCount++;
        } else {
          logger.info(`   ✅ Article already properly formatted`);
          skippedCount++;
        }
        
        // Add a small delay between articles
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        logger.error(`   💥 Error processing article: ${error.message}`);
        errorCount++;
      }
    }
    
    logger.info(`\n📈 Content Formatting Fix Summary:`);
    logger.info(`  ✅ Successfully fixed: ${successCount}`);
    logger.info(`  ⏭️  Skipped (already good): ${skippedCount}`);
    logger.info(`  ❌ Errors: ${errorCount}`);
    logger.info(`  📊 Total articles processed: ${articlesToFix.length}`);
    
  } catch (error) {
    logger.error('💥 Script failed:', error);
  } finally {
    process.exit(0);
  }
}

fixContentFormatting();
