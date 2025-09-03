import dotenv from 'dotenv';
import connectDB from './config/db.mjs';
import News from './models/News.mjs';
import logger from '../utils/logger.mjs';

// Load environment variables
dotenv.config({ path: './backend/.env' });

async function checkMissingImages() {
  logger.info('🖼️ Checking articles with missing images...\n');
  
  try {
    // Connect to database
    await connectDB();
    logger.info('✅ Connected to database\n');
    
    // Find articles with missing images
    const articlesWithoutImages = await News.find({
      $or: [
        { thumbnail: { $exists: false } },
        { thumbnail: null },
        { thumbnail: '' },
        { images: { $exists: false } },
        { images: null },
        { images: [] }
      ]
    }).sort({ createdAt: -1 });
    
    logger.info(`📊 Found ${articlesWithoutImages.length} articles without images\n`);
    
    if (articlesWithoutImages.length === 0) {
      logger.info('🎉 All articles have images!');
      return;
    }
    
    // Show articles without images
    logger.info('📝 Articles missing images:');
    for (let i = 0; i < articlesWithoutImages.length; i++) {
      const article = articlesWithoutImages[i];
      logger.info(`  ${i + 1}. ${article.title?.en || 'No title'}`);
      logger.info(`     Slug: ${article.slug}`);
      logger.info(`     Status: ${article.status}`);
      logger.info(`     Thumbnail: ${article.thumbnail || 'Missing'}`);
      logger.info(`     Images: ${article.images?.length || 0} images`);
      logger.info(`     Created: ${article.createdAt}`);
      logger.info('');
    }
    
    // Count by status
    const draftCount = articlesWithoutImages.filter(a => a.status === 'draft').length;
    const publishedCount = articlesWithoutImages.filter(a => a.status === 'published').length;
    
    logger.info(`\n📊 Breakdown:`);
    logger.info(`  - Draft articles without images: ${draftCount}`);
    logger.info(`  - Published articles without images: ${publishedCount}`);
    logger.info(`  - Total articles without images: ${articlesWithoutImages.length}`);
    
    // Check total articles
    const totalArticles = await News.countDocuments({ status: { $in: ['draft', 'published'] } });
    logger.info(`  - Total articles: ${totalArticles}`);
    logger.info(`  - Articles with images: ${totalArticles - articlesWithoutImages.length}`);
    
    // Show categories affected
    const categories = {};
    for (const article of articlesWithoutImages) {
      if (article.category?.name?.en) {
        const catName = article.category.name.en;
        categories[catName] = (categories[catName] || 0) + 1;
      }
    }
    
    if (Object.keys(categories).length > 0) {
      logger.info(`\n📂 Categories with missing images:`);
      for (const [category, count] of Object.entries(categories)) {
        logger.info(`  - ${category}: ${count} articles`);
      }
    }
    
  } catch (error) {
    logger.error('💥 Script failed:', error);
  } finally {
    process.exit(0);
  }
}

checkMissingImages();
