import dotenv from 'dotenv';
import connectDB from './config/db.mjs';
import News from './models/News.mjs';
import logger from '../utils/logger.mjs';

// Load environment variables
dotenv.config({ path: './backend/.env' });

async function checkWhatHappened() {
  try {
    // Connect to database
    await connectDB();
    logger.info('✅ Connected to database\n');
    
    // Check a few articles to see what content they have now
    const testArticles = [
      'australia-s-environmental-law-overhaul-a-critical-step',
      'cambodia-thailand-strengthen-border-peace-talks',
      'cambodia-demands-thailand-release-18-soldiers'
    ];
    
    for (const slug of testArticles) {
      const article = await News.findOne({ slug });
      
      if (!article) {
        logger.info(`❌ Article not found: ${slug}`);
        continue;
      }
      
      logger.info(`\n📄 Article: ${article.title?.en || 'No title'}`);
      logger.info(`   Slug: ${article.slug}`);
      logger.info(`   Status: ${article.status}`);
      logger.info(`   Created: ${article.createdAt}`);
      logger.info(`   Updated: ${article.updatedAt}`);
      
      // Check current content
      if (article.content?.en) {
        logger.info(`   English content length: ${article.content.en.length} characters`);
        logger.info(`   English content: "${article.content.en}"`);
      }
      
      if (article.content?.kh) {
        logger.info(`   Khmer content length: ${article.content.kh.length} characters`);
        logger.info(`   Khmer content: "${article.content.kh}"`);
      }
      
      // Check description
      if (article.description?.en) {
        logger.info(`   English description length: ${article.description.en.length} characters`);
        logger.info(`   English description: "${article.description.en}"`);
      }
      
      if (article.description?.kh) {
        logger.info(`   Khmer description length: ${article.description.kh.length} characters`);
        logger.info(`   Khmer description: "${article.description.kh}"`);
      }
      
      // Check if content and description are the same (which would indicate I just copied description)
      if (article.content?.en && article.description?.en) {
        if (article.content.en === article.description.en) {
          logger.info(`   ⚠️  English content is just the description (not original content)`);
        }
      }
      
      if (article.content?.kh && article.description?.kh) {
        if (article.content.kh === article.description.kh) {
          logger.info(`   ⚠️  Khmer content is just the description (not original content)`);
        }
      }
    }
    
    // Check if there are any articles with longer content (original content)
    const articlesWithLongContent = await News.find({
      $and: [
        { 'content.en': { $exists: true, $ne: '' } },
        { 'content.en': { $regex: /.{200,}/ } } // At least 200 characters
      ]
    }).limit(3);
    
    logger.info(`\n📊 Found ${articlesWithLongContent.length} articles with longer content (might be original)`);
    
    for (const article of articlesWithLongContent) {
      logger.info(`\n📄 Article with longer content: ${article.title?.en || 'No title'}`);
      logger.info(`   English content length: ${article.content.en.length} characters`);
      logger.info(`   English content preview: "${article.content.en.substring(0, 200)}..."`);
    }
    
    // Check database backup or version history
    // Check if there are any other fields that might contain the original content
    const sampleArticle = await News.findOne();
    if (sampleArticle) {
      const allFields = Object.keys(sampleArticle.toObject());
      logger.info(`   All available fields: ${allFields.join(', ')}`);
      
      // Look for any fields that might contain backup content
      const potentialContentFields = allFields.filter(field => 
        field.includes('content') || 
        field.includes('body') || 
        field.includes('text') ||
        field.includes('article') ||
        field.includes('full') ||
        field.includes('original') ||
        field.includes('backup')
      );
      
      logger.info(`   Potential content fields: ${potentialContentFields.join(', ')}`);
    }
    
  } catch (error) {
    logger.error('💥 Script failed:', error);
  } finally {
    process.exit(0);
  }
}

checkWhatHappened();
