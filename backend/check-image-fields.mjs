import dotenv from 'dotenv';
import connectDB from './config/db.mjs';
import News from './models/News.mjs';
import logger from '../utils/logger.mjs';

// Load environment variables
dotenv.config({ path: './backend/.env' });

async function checkImageFields() {
  logger.info('🖼️ Checking image fields structure...\n');
  
  try {
    // Connect to database
    await connectDB();
    logger.info('✅ Connected to database\n');
    
    // Get a sample article to see the structure
    const sampleArticle = await News.findOne({}).sort({ createdAt: -1 });
    
    if (!sampleArticle) {
      logger.info('❌ No articles found');
      return;
    }
    
    logger.info('📝 Sample article structure:');
    logger.info(`  Title: ${sampleArticle.title?.en}`);
    logger.info(`  Slug: ${sampleArticle.slug}`);
    logger.info(`  Status: ${sampleArticle.status}`);
    logger.info(`  Thumbnail: ${sampleArticle.thumbnail || 'None'}`);
    logger.info(`  Images array: ${JSON.stringify(sampleArticle.images, null, 2)}`);
    logger.info(`  Images length: ${sampleArticle.images?.length || 0}`);
    
    // Check all field names
    logger.info('\n📋 All available fields:');
    const fieldNames = Object.keys(sampleArticle.toObject());
    fieldNames.forEach(field => {
      logger.info(`  - ${field}`);
    });
    
    // Count articles with different image scenarios
    const withThumbnail = await News.countDocuments({ 
      thumbnail: { $exists: true, $ne: null, $ne: '' } 
    });
    
    const withImages = await News.countDocuments({ 
      images: { $exists: true, $ne: null, $ne: [] } 
    });
    
    const withBoth = await News.countDocuments({
      $and: [
        { thumbnail: { $exists: true, $ne: null, $ne: '' } },
        { images: { $exists: true, $ne: null, $ne: [] } }
      ]
    });
    
    const total = await News.countDocuments({ status: { $in: ['draft', 'published'] } });
    
    logger.info('\n📊 Image field statistics:');
    logger.info(`  - Total articles: ${total}`);
    logger.info(`  - Articles with thumbnail: ${withThumbnail}`);
    logger.info(`  - Articles with images array: ${withImages}`);
    logger.info(`  - Articles with both: ${withBoth}`);
    logger.info(`  - Articles with only thumbnail: ${withThumbnail - withBoth}`);
    logger.info(`  - Articles with only images: ${withImages - withBoth}`);
    logger.info(`  - Articles with neither: ${total - withThumbnail - withImages + withBoth}`);
    
  } catch (error) {
    logger.error('💥 Script failed:', error);
  } finally {
    process.exit(0);
  }
}

checkImageFields();
