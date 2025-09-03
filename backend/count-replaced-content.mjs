import dotenv from 'dotenv';
import connectDB from './config/db.mjs';
import News from './models/News.mjs';
import logger from '../utils/logger.mjs';

// Load environment variables
dotenv.config({ path: './backend/.env' });

async function countReplacedContent() {
  try {
    // Connect to database
    await connectDB();
    logger.info('✅ Connected to database\n');
    
    // Count articles with placeholder content
    const placeholderArticles = await News.find({
      $or: [
        { 'content.en': { $regex: /This article is currently being updated/ } },
        { 'content.kh': { $regex: /អត្ថបទនេះកំពុងត្រូវបានធ្វើបច្ចុប្បន្នភាព/ } }
      ]
    });
    
    logger.info(`📊 Articles with placeholder content: ${placeholderArticles.length}`);
    
    // Count articles where content = description (meaning I replaced with description)
    const descriptionReplacedArticles = await News.find({
      $and: [
        { 'content.en': { $exists: true, $ne: '' } },
        { 'description.en': { $exists: true, $ne: '' } },
        { $expr: { $eq: ['$content.en', '$description.en'] } }
      ]
    });
    
    logger.info(`📊 Articles where content = description: ${descriptionReplacedArticles.length}`);
    
    // Count articles with short content (likely replaced)
    const shortContentArticles = await News.find({
      $and: [
        { 'content.en': { $exists: true, $ne: '' } },
        { 'content.en': { $regex: /^.{0,200}$/ } } // Less than 200 characters
      ]
    });
    
    logger.info(`📊 Articles with short content (<200 chars): ${shortContentArticles.length}`);
    
    // Count articles with original long content
    const originalContentArticles = await News.find({
      $and: [
        { 'content.en': { $exists: true, $ne: '' } },
        { 'content.en': { $regex: /.{200,}/ } }, // More than 200 characters
        { 'content.en': { $not: { $regex: /This article is currently being updated/ } } }
      ]
    });
    
    logger.info(`📊 Articles with original long content (>200 chars): ${originalContentArticles.length}`);
    
    // Total articles
    const totalArticles = await News.countDocuments({ status: { $in: ['draft', 'published'] } });
    logger.info(`📊 Total articles: ${totalArticles}`);
    
    // Show breakdown
    logger.info(`\n📋 Breakdown:`);
    logger.info(`  - Total articles: ${totalArticles}`);
    logger.info(`  - Articles with placeholder: ${placeholderArticles.length}`);
    logger.info(`  - Articles with description as content: ${descriptionReplacedArticles.length}`);
    logger.info(`  - Articles with short content: ${shortContentArticles.length}`);
    logger.info(`  - Articles with original content: ${originalContentArticles.length}`);
    
    // Show some examples of replaced articles
    logger.info(`\n📝 Examples of articles with replaced content:`);
    const examples = await News.find({
      $and: [
        { 'content.en': { $exists: true, $ne: '' } },
        { 'description.en': { $exists: true, $ne: '' } },
        { $expr: { $eq: ['$content.en', '$description.en'] } }
      ]
    }).limit(5);
    
    for (const article of examples) {
      logger.info(`  - ${article.title?.en || 'No title'}`);
      logger.info(`    Content length: ${article.content.en.length} characters`);
      logger.info(`    Content: "${article.content.en}"`);
    }
    
  } catch (error) {
    logger.error('💥 Script failed:', error);
  } finally {
    process.exit(0);
  }
}

countReplacedContent();
