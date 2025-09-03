import dotenv from 'dotenv';
import connectDB from './config/db.mjs';
import News from './models/News.mjs';
import User from './models/User.mjs';
import Category from './models/Category.mjs';
import logger from '../utils/logger.mjs';

// Load environment variables
dotenv.config({ path: './backend/.env' });

async function fixMissingContent() {
  logger.info('🔧 Fixing articles with missing content that could cause 500 errors...\n');
  
  try {
    // Connect to database
    await connectDB();
    logger.info('✅ Connected to database\n');
    
    // Find articles with missing content
    const articlesToFix = await News.find({
      status: { $in: ['draft', 'published'] },
      $or: [
        // Missing English content
        { 'content.en': { $exists: false } },
        { 'content.en': null },
        { 'content.en': '' },
        // Missing Khmer content
        { 'content.kh': { $exists: false } },
        { 'content.kh': null },
        { 'content.kh': '' },
        // Content too short (less than 10 characters)
        { 'content.en': { $regex: /^.{0,9}$/ } },
        { 'content.kh': { $regex: /^.{0,9}$/ } },
        // Content with only whitespace
        { 'content.en': { $regex: /^\s*$/ } },
        { 'content.kh': { $regex: /^\s*$/ } }
      ]
    }).sort({ createdAt: -1 });
    
    logger.info(`📊 Found ${articlesToFix.length} articles with missing content\n`);
    
    if (articlesToFix.length === 0) {
      logger.info('🎉 No articles with missing content found!');
      return;
    }
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const article of articlesToFix) {
      try {
        logger.info(`\n🔄 Processing: ${article.title?.en || 'No title'}`);
        logger.info(`   Status: ${article.status}`);
        logger.info(`   Slug: ${article.slug}`);
        
        let needsUpdate = false;
        const updates = {};
        
        // Check and fix English content
        const hasEnglishContent = article.content?.en && 
                                 article.content.en.trim().length >= 10 && 
                                 !article.content.en.match(/^\s*$/);
        
        if (!hasEnglishContent) {
          logger.info(`   🔧 Adding placeholder English content`);
          updates['content.en'] = 'This article is currently being updated. Please check back later for the full content.';
          needsUpdate = true;
        }
        
        // Check and fix Khmer content
        const hasKhmerContent = article.content?.kh && 
                               article.content.kh.trim().length >= 10 && 
                               !article.content.kh.match(/^\s*$/);
        
        if (!hasKhmerContent) {
          logger.info(`   🔧 Adding placeholder Khmer content`);
          updates['content.kh'] = 'អត្ថបទនេះកំពុងត្រូវបានធ្វើបច្ចុប្បន្នភាព។ សូមពិនិត្យមើលម្តងទៀតដើម្បីមើលអត្ថបទពេញលេញ។';
          needsUpdate = true;
        }
        
        // Apply updates if needed
        if (needsUpdate) {
          await News.findByIdAndUpdate(article._id, {
            $set: updates
          });
          logger.info(`   ✅ Article fixed successfully`);
          successCount++;
        } else {
          logger.info(`   ✅ Article already has proper content`);
        }
        
        // Add a small delay between articles
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        logger.error(`   💥 Error processing article: ${error.message}`);
        errorCount++;
      }
    }
    
    logger.info(`\n📈 Missing Content Fix Summary:`);
    logger.info(`  ✅ Successfully fixed: ${successCount}`);
    logger.info(`  ❌ Errors: ${errorCount}`);
    logger.info(`  📊 Total articles processed: ${articlesToFix.length}`);
    
  } catch (error) {
    logger.error('💥 Script failed:', error);
  } finally {
    process.exit(0);
  }
}

fixMissingContent();
