import dotenv from 'dotenv';
import connectDB from './config/db.mjs';
import News from './models/News.mjs';
import User from './models/User.mjs';
import Category from './models/Category.mjs';
import logger from '../utils/logger.mjs';

// Load environment variables
dotenv.config({ path: './backend/.env' });

async function checkTranslations() {
  logger.info('🌏 Checking translation status for all articles...\n');
  
  try {
    // Connect to database
    await connectDB();
    logger.info('✅ Connected to database\n');
    
    // Find all articles
    const allArticles = await News.find({
      status: { $in: ['draft', 'published'] }
    }).sort({ createdAt: -1 });
    
    logger.info(`📊 Found ${allArticles.length} articles to check\n`);
    
    let totalArticles = 0;
    let articlesWithKhmerTitle = 0;
    let articlesWithKhmerDescription = 0;
    let articlesWithKhmerContent = 0;
    let articlesWithTranslatedTitle = 0;
    let articlesWithTranslatedDescription = 0;
    let articlesWithTranslatedContent = 0;
    
    const articlesNeedingTranslation = [];
    
    for (const article of allArticles) {
      totalArticles++;
      
      // Check if Khmer content exists
      const hasKhmerTitle = !!article.title?.kh && article.title.kh.length > 0;
      const hasKhmerDescription = !!article.description?.kh && article.description.kh.length > 0;
      const hasKhmerContent = !!article.content?.kh && article.content.kh.length > 0;
      
      if (hasKhmerTitle) articlesWithKhmerTitle++;
      if (hasKhmerDescription) articlesWithKhmerDescription++;
      if (hasKhmerContent) articlesWithKhmerContent++;
      
      // Check if content is actually translated (not just copied from English)
      const titleIsTranslated = hasKhmerTitle && article.title.kh !== article.title.en;
      const descriptionIsTranslated = hasKhmerDescription && article.description.kh !== article.description.en;
      const contentIsTranslated = hasKhmerContent && article.content.kh !== article.content.en;
      
      if (titleIsTranslated) articlesWithTranslatedTitle++;
      if (descriptionIsTranslated) articlesWithTranslatedDescription++;
      if (contentIsTranslated) articlesWithTranslatedContent++;
      
      // Check if article needs translation
      if (!hasKhmerTitle || !hasKhmerDescription || !hasKhmerContent || 
          !titleIsTranslated || !descriptionIsTranslated || !contentIsTranslated) {
        articlesNeedingTranslation.push({
          id: article._id,
          title: article.title?.en || 'No title',
          status: article.status,
          issues: []
        });
        
        if (!hasKhmerTitle) articlesNeedingTranslation[articlesNeedingTranslation.length - 1].issues.push('Missing Khmer title');
        if (!hasKhmerDescription) articlesNeedingTranslation[articlesNeedingTranslation.length - 1].issues.push('Missing Khmer description');
        if (!hasKhmerContent) articlesNeedingTranslation[articlesNeedingTranslation.length - 1].issues.push('Missing Khmer content');
        if (hasKhmerTitle && !titleIsTranslated) articlesNeedingTranslation[articlesNeedingTranslation.length - 1].issues.push('Title not translated (copied from English)');
        if (hasKhmerDescription && !descriptionIsTranslated) articlesNeedingTranslation[articlesNeedingTranslation.length - 1].issues.push('Description not translated (copied from English)');
        if (hasKhmerContent && !contentIsTranslated) articlesNeedingTranslation[articlesNeedingTranslation.length - 1].issues.push('Content not translated (copied from English)');
      }
    }
    
    // Display statistics
    logger.info(`📈 Translation Statistics:`);
    logger.info(`  📊 Total articles: ${totalArticles}`);
    logger.info(`  🌏 Articles with Khmer title: ${articlesWithKhmerTitle} (${Math.round(articlesWithKhmerTitle/totalArticles*100)}%)`);
    logger.info(`  🌏 Articles with Khmer description: ${articlesWithKhmerDescription} (${Math.round(articlesWithKhmerDescription/totalArticles*100)}%)`);
    logger.info(`  🌏 Articles with Khmer content: ${articlesWithKhmerContent} (${Math.round(articlesWithKhmerContent/totalArticles*100)}%)`);
    logger.info(`  ✅ Articles with translated title: ${articlesWithTranslatedTitle} (${Math.round(articlesWithTranslatedTitle/totalArticles*100)}%)`);
    logger.info(`  ✅ Articles with translated description: ${articlesWithTranslatedDescription} (${Math.round(articlesWithTranslatedDescription/totalArticles*100)}%)`);
    logger.info(`  ✅ Articles with translated content: ${articlesWithTranslatedContent} (${Math.round(articlesWithTranslatedContent/totalArticles*100)}%)`);
    
    logger.info(`\n⚠️  Articles needing translation: ${articlesNeedingTranslation.length} (${Math.round(articlesNeedingTranslation.length/totalArticles*100)}%)`);
    
    if (articlesNeedingTranslation.length > 0) {
      logger.info(`\n📝 Articles that need translation fixes:`);
      articlesNeedingTranslation.slice(0, 10).forEach((article, index) => {
        logger.info(`   ${index + 1}. ${article.title} (${article.status})`);
        logger.info(`      Issues: ${article.issues.join(', ')}`);
      });
      
      if (articlesNeedingTranslation.length > 10) {
        logger.info(`   ... and ${articlesNeedingTranslation.length - 10} more articles`);
      }
    } else {
      logger.info(`\n🎉 All articles are properly translated!`);
    }
    
    // Show some examples of copied content
    const copiedExamples = allArticles.filter(article => 
      (article.title?.kh === article.title?.en) || 
      (article.description?.kh === article.description?.en) || 
      (article.content?.kh === article.content?.en)
    ).slice(0, 3);
    
    if (copiedExamples.length > 0) {
      logger.info(`\n📋 Examples of articles with copied content (not translated):`);
      copiedExamples.forEach((article, index) => {
        logger.info(`   ${index + 1}. ${article.title?.en || 'No title'}`);
        if (article.title?.kh === article.title?.en) {
          logger.info(`      Title: "${article.title?.en}" (copied to Khmer)`);
        }
        if (article.description?.kh === article.description?.en) {
          logger.info(`      Description: "${article.description?.en}" (copied to Khmer)`);
        }
        if (article.content?.kh === article.content?.en) {
          logger.info(`      Content: Same as English (copied)`);
        }
      });
    }
    
  } catch (error) {
    logger.error('💥 Script failed:', error);
  } finally {
    process.exit(0);
  }
}

checkTranslations();

