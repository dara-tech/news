import dotenv from 'dotenv';
import connectDB from './config/db.mjs';
import News from './models/News.mjs';
import logger from '../utils/logger.mjs';

// Load environment variables
dotenv.config({ path: './backend/.env' });

async function checkArticleContent() {
  try {
    // Connect to database
    await connectDB();
    logger.info('✅ Connected to database\n');
    
    // Check a few articles to see their content
    const articlesToCheck = [
      'australia-s-environmental-law-overhaul-a-critical-step',
      'cambodia-thailand-strengthen-border-peace-talks',
      'cambodia-demands-thailand-release-18-soldiers'
    ];
    
    for (const slug of articlesToCheck) {
      const article = await News.findOne({ slug });
      
      if (!article) {
        logger.info(`❌ Article not found: ${slug}`);
        continue;
      }
      
      logger.info(`\n📄 Article: ${article.title?.en || 'No title'}`);
      logger.info(`   Slug: ${article.slug}`);
      logger.info(`   Status: ${article.status}`);
      
      // Check English content
      if (article.content?.en) {
        const enLength = article.content.en.length;
        const enPreview = article.content.en.substring(0, 100);
        logger.info(`   English content length: ${enLength} characters`);
        logger.info(`   English content preview: "${enPreview}..."`);
        
        if (article.content.en.includes('This article is currently being updated')) {
          logger.info(`   ⚠️  English content has placeholder text`);
        }
      } else {
        logger.info(`   ❌ No English content`);
      }
      
      // Check Khmer content
      if (article.content?.kh) {
        const khLength = article.content.kh.length;
        const khPreview = article.content.kh.substring(0, 100);
        logger.info(`   Khmer content length: ${khLength} characters`);
        logger.info(`   Khmer content preview: "${khPreview}..."`);
        
        if (article.content.kh.includes('អត្ថបទនេះកំពុងត្រូវបានធ្វើបច្ចុប្បន្នភាព')) {
          logger.info(`   ⚠️  Khmer content has placeholder text`);
        }
      } else {
        logger.info(`   ❌ No Khmer content`);
      }
    }
    
    // Check how many articles have placeholder content
    const placeholderArticles = await News.find({
      $or: [
        { 'content.en': { $regex: /This article is currently being updated/ } },
        { 'content.kh': { $regex: /អត្ថបទនេះកំពុងត្រូវបានធ្វើបច្ចុប្បន្នភាព/ } }
      ]
    });
    
    logger.info(`\n📊 Articles with placeholder content: ${placeholderArticles.length}`);
    
    // Check total articles with proper content
    const totalArticles = await News.countDocuments({ status: { $in: ['draft', 'published'] } });
    const articlesWithContent = await News.countDocuments({
      status: { $in: ['draft', 'published'] },
      'content.en': { $exists: true, $ne: '' },
      'content.kh': { $exists: true, $ne: '' }
    });
    
    logger.info(`📊 Total articles: ${totalArticles}`);
    logger.info(`📊 Articles with content: ${articlesWithContent}`);
    logger.info(`📊 Articles missing content: ${totalArticles - articlesWithContent}`);
    
  } catch (error) {
    logger.error('💥 Script failed:', error);
  } finally {
    process.exit(0);
  }
}

checkArticleContent();
