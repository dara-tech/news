import dotenv from 'dotenv';
import connectDB from './config/db.mjs';
import News from './models/News.mjs';
import logger from '../utils/logger.mjs';

// Load environment variables
dotenv.config({ path: './backend/.env' });

async function restoreContentFromDescriptions() {
  logger.info('🔧 Restoring content from descriptions...\n');
  
  try {
    // Connect to database
    await connectDB();
    logger.info('✅ Connected to database\n');
    
    // Find articles with placeholder content but good descriptions
    const articlesToRestore = await News.find({
      $and: [
        // Has placeholder content
        {
          $or: [
            { 'content.en': { $regex: /This article is currently being updated/ } },
            { 'content.kh': { $regex: /អត្ថបទនេះកំពុងត្រូវបានធ្វើបច្ចុប្បន្នភាព/ } }
          ]
        },
        // Has good descriptions
        {
          $and: [
            { 'description.en': { $exists: true, $ne: '' } },
            { 'description.kh': { $exists: true, $ne: '' } },
            { 'description.en': { $regex: /.{50,}/ } }, // At least 50 characters
            { 'description.kh': { $regex: /.{50,}/ } }  // At least 50 characters
          ]
        }
      ]
    }).sort({ createdAt: -1 });
    
    logger.info(`📊 Found ${articlesToRestore.length} articles to restore from descriptions\n`);
    
    if (articlesToRestore.length === 0) {
      logger.info('🎉 No articles to restore!');
      return;
    }
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const article of articlesToRestore) {
      try {
        logger.info(`\n🔄 Restoring: ${article.title?.en || 'No title'}`);
        logger.info(`   Slug: ${article.slug}`);
        
        let needsUpdate = false;
        const updates = {};
        
        // Check if English content needs restoration
        if (article.content?.en && article.content.en.includes('This article is currently being updated')) {
          if (article.description?.en && article.description.en.length > 50) {
            logger.info(`   🔧 Restoring English content from description`);
            updates['content.en'] = article.description.en;
            needsUpdate = true;
          }
        }
        
        // Check if Khmer content needs restoration
        if (article.content?.kh && article.content.kh.includes('អត្ថបទនេះកំពុងត្រូវបានធ្វើបច្ចុប្បន្នភាព')) {
          if (article.description?.kh && article.description.kh.length > 50) {
            logger.info(`   🔧 Restoring Khmer content from description`);
            updates['content.kh'] = article.description.kh;
            needsUpdate = true;
          }
        }
        
        // Apply updates if needed
        if (needsUpdate) {
          await News.findByIdAndUpdate(article._id, {
            $set: updates
          });
          logger.info(`   ✅ Content restored successfully`);
          successCount++;
        } else {
          logger.info(`   ✅ Content already restored`);
        }
        
        // Add a small delay between articles
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        logger.error(`   💥 Error restoring article: ${error.message}`);
        errorCount++;
      }
    }
    
    logger.info(`\n📈 Content Restoration Summary:`);
    logger.info(`  ✅ Successfully restored: ${successCount}`);
    logger.info(`  ❌ Errors: ${errorCount}`);
    logger.info(`  📊 Total articles processed: ${articlesToRestore.length}`);
    
  } catch (error) {
    logger.error('💥 Script failed:', error);
  } finally {
    process.exit(0);
  }
}

restoreContentFromDescriptions();
