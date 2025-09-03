import dotenv from 'dotenv';
import connectDB from './config/db.mjs';
import News from './models/News.mjs';
import logger from '../utils/logger.mjs';

// Load environment variables
dotenv.config();

async function checkAllArticles() {
  try {
    // Connect to database
    await connectDB();
    logger.info('✅ Connected to database\n');
    
    // Get all articles
    const allArticles = await News.find({
      status: { $in: ['draft', 'published'] }
    }).sort({ updatedAt: -1 });
    
    logger.info(`📊 Found ${allArticles.length} total articles\n`);
    
    let formattedCount = 0;
    let unformattedCount = 0;
    let withKhmerContent = 0;
    let withKhmerTitle = 0;
    let withKhmerDescription = 0;
    
    const unformattedArticles = [];
    
    allArticles.forEach((article, index) => {
      const hasHtmlFormatting = article.content?.en?.includes('<');
      const hasKhmerContent = !!article.content?.kh;
      const hasKhmerTitle = !!article.title?.kh;
      const hasKhmerDescription = !!article.description?.kh;
      
      if (hasHtmlFormatting) {
        formattedCount++;
      } else {
        unformattedCount++;
        unformattedArticles.push({
          title: article.title?.en || article.title,
          status: article.status,
          id: article._id
        });
      }
      
      if (hasKhmerContent) withKhmerContent++;
      if (hasKhmerTitle) withKhmerTitle++;
      if (hasKhmerDescription) withKhmerDescription++;
    });
    
    logger.info('📈 Overall Statistics:');
    logger.info(`   Total articles: ${allArticles.length}`);
    logger.info(`   ✅ With HTML formatting: ${formattedCount}`);
    logger.info(`   ❌ Without HTML formatting: ${unformattedCount}`);
    logger.info(`   🌏 With Khmer content: ${withKhmerContent}`);
    logger.info(`   🌏 With Khmer title: ${withKhmerTitle}`);
    logger.info(`   🌏 With Khmer description: ${withKhmerDescription}`);
    
    if (unformattedArticles.length > 0) {
      logger.info('\n📝 Articles that need formatting:');
      unformattedArticles.slice(0, 10).forEach((article, index) => {
        logger.info(`   ${index + 1}. ${article.title} (${article.status})`);
      });
      
      if (unformattedArticles.length > 10) {
        logger.info(`   ... and ${unformattedArticles.length - 10} more articles`);
      }
    } else {
      logger.info('\n🎉 All articles are properly formatted!');
    }
    
    // Check for articles without Khmer translations
    const articlesWithoutKhmer = await News.find({
      status: { $in: ['draft', 'published'] },
      $or: [
        { 'content.kh': { $exists: false } },
        { 'content.kh': '' },
        { 'content.kh': null },
        { 'title.kh': { $exists: false } },
        { 'title.kh': '' },
        { 'title.kh': null },
        { 'description.kh': { $exists: false } },
        { 'description.kh': '' },
        { 'description.kh': null }
      ]
    }).limit(10);
    
    if (articlesWithoutKhmer.length > 0) {
      logger.info('\n🌏 Articles that need Khmer translation:');
      articlesWithoutKhmer.forEach((article, index) => {
        logger.info(`   ${index + 1}. ${article.title?.en || article.title} (${article.status})`);
      });
    } else {
      logger.info('\n🎉 All articles have Khmer translations!');
    }
    
  } catch (error) {
    logger.error('💥 Script failed:', error);
  } finally {
    process.exit(0);
  }
}

checkAllArticles();
