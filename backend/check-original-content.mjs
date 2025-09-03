import dotenv from 'dotenv';
import connectDB from './config/db.mjs';
import News from './models/News.mjs';
import logger from '../utils/logger.mjs';

// Load environment variables
dotenv.config({ path: './backend/.env' });

async function checkOriginalContent() {
  try {
    // Connect to database
    await connectDB();
    logger.info('✅ Connected to database\n');
    
    // Check articles that have placeholder content
    const placeholderArticles = await News.find({
      $or: [
        { 'content.en': { $regex: /This article is currently being updated/ } },
        { 'content.kh': { $regex: /អត្ថបទនេះកំពុងត្រូវបានធ្វើបច្ចុប្បន្នភាព/ } }
      ]
    }).limit(5);
    
    logger.info(`📊 Found ${placeholderArticles.length} articles with placeholder content\n`);
    
    // Check if these articles have any other content fields
    for (const article of placeholderArticles) {
      logger.info(`\n📄 Article: ${article.title?.en || 'No title'}`);
      logger.info(`   Slug: ${article.slug}`);
      logger.info(`   Status: ${article.status}`);
      logger.info(`   Created: ${article.createdAt}`);
      logger.info(`   Updated: ${article.updatedAt}`);
      
      // Check if there are any other content-related fields
      const allFields = Object.keys(article.toObject());
      const contentFields = allFields.filter(field => 
        field.includes('content') || 
        field.includes('body') || 
        field.includes('text') ||
        field.includes('description')
      );
      
      logger.info(`   Content-related fields: ${contentFields.join(', ')}`);
      
      // Check if there's any content in other fields
      if (article.description?.en && article.description.en.length > 50) {
        logger.info(`   ✅ Has long English description: ${article.description.en.substring(0, 100)}...`);
      }
      
      if (article.description?.kh && article.description.kh.length > 50) {
        logger.info(`   ✅ Has long Khmer description: ${article.description.kh.substring(0, 100)}...`);
      }
    }
    
    // Check if there are any articles with proper content that we can use as reference
    const properArticles = await News.find({
      $and: [
        { 'content.en': { $exists: true, $ne: '' } },
        { 'content.kh': { $exists: true, $ne: '' } },
        { 'content.en': { $not: { $regex: /This article is currently being updated/ } } },
        { 'content.kh': { $not: { $regex: /អត្ថបទនេះកំពុងត្រូវបានធ្វើបច្ចុប្បន្នភាព/ } } }
      ]
    }).limit(3);
    
    logger.info(`\n📊 Found ${properArticles.length} articles with proper content\n`);
    
    for (const article of properArticles) {
      logger.info(`\n📄 Article with proper content: ${article.title?.en || 'No title'}`);
      logger.info(`   English content length: ${article.content.en.length} characters`);
      logger.info(`   Khmer content length: ${article.content.kh.length} characters`);
      logger.info(`   English preview: ${article.content.en.substring(0, 100)}...`);
    }
    
  } catch (error) {
    logger.error('💥 Script failed:', error);
  } finally {
    process.exit(0);
  }
}

checkOriginalContent();
