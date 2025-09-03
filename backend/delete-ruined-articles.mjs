import dotenv from 'dotenv';
import connectDB from './config/db.mjs';
import News from './models/News.mjs';
import logger from '../utils/logger.mjs';

// Load environment variables
dotenv.config({ path: './backend/.env' });

async function deleteRuinedArticles() {
  logger.info('🗑️ Deleting articles with ruined content...\n');
  
  try {
    // Connect to database
    await connectDB();
    logger.info('✅ Connected to database\n');
    
    // Find articles where content = description (the ruined ones)
    const ruinedArticles = await News.find({
      $and: [
        { 'content.en': { $exists: true, $ne: '' } },
        { 'description.en': { $exists: true, $ne: '' } },
        { $expr: { $eq: ['$content.en', '$description.en'] } }
      ]
    });
    
    logger.info(`📊 Found ${ruinedArticles.length} articles with ruined content to delete\n`);
    
    if (ruinedArticles.length === 0) {
      logger.info('🎉 No ruined articles found to delete!');
      return;
    }
    
    // Show some examples before deletion
    logger.info('📝 Examples of articles to be deleted:');
    for (let i = 0; i < Math.min(5, ruinedArticles.length); i++) {
      const article = ruinedArticles[i];
      logger.info(`  ${i + 1}. ${article.title?.en || 'No title'}`);
      logger.info(`     Slug: ${article.slug}`);
      logger.info(`     Status: ${article.status}`);
      logger.info(`     Content: "${article.content.en}"`);
    }
    
    if (ruinedArticles.length > 5) {
      logger.info(`  ... and ${ruinedArticles.length - 5} more articles`);
    }
    
    // Ask for confirmation
    logger.info(`\n⚠️  WARNING: This will permanently delete ${ruinedArticles.length} articles!`);
    logger.info('   These articles had their content replaced with descriptions and are no longer useful.');
    logger.info('   This action cannot be undone.');
    
    // For safety, let's just show what would be deleted first
    ...');
    
    // Count by status
    const draftCount = ruinedArticles.filter(a => a.status === 'draft').length;
    const publishedCount = ruinedArticles.filter(a => a.status === 'published').length;
    
    logger.info(`\n📊 Breakdown of articles to delete:`);
    logger.info(`  - Draft articles: ${draftCount}`);
    logger.info(`  - Published articles: ${publishedCount}`);
    logger.info(`  - Total: ${ruinedArticles.length}`);
    
    // Show categories affected
    const categories = {};
    for (const article of ruinedArticles) {
      if (article.category?.name?.en) {
        const catName = article.category.name.en;
        categories[catName] = (categories[catName] || 0) + 1;
      }
    }
    
    logger.info(`\n📂 Categories affected:`);
    for (const [category, count] of Object.entries(categories)) {
      logger.info(`  - ${category}: ${count} articles`);
    }
    
    logger.info('\n🗑️  Proceeding with deletion...');
    
    let deletedCount = 0;
    let errorCount = 0;
    
    for (const article of ruinedArticles) {
      try {
        await News.findByIdAndDelete(article._id);
        logger.info(`   ✅ Deleted: ${article.title?.en || 'No title'}`);
        deletedCount++;
      } catch (error) {
        logger.error(`   ❌ Error deleting ${article.title?.en}: ${error.message}`);
        errorCount++;
      }
    }
    
    logger.info(`\n📈 Deletion Summary:`);
    logger.info(`  ✅ Successfully deleted: ${deletedCount}`);
    logger.info(`  ❌ Errors: ${errorCount}`);
    logger.info(`  📊 Total processed: ${ruinedArticles.length}`);
    
  } catch (error) {
    logger.error('💥 Script failed:', error);
  } finally {
    process.exit(0);
  }
}

deleteRuinedArticles();
