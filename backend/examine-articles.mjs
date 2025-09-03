import dotenv from 'dotenv';
import connectDB from './config/db.mjs';
import News from './models/News.mjs';
import User from './models/User.mjs';
import Category from './models/Category.mjs';
import logger from '../utils/logger.mjs';

// Load environment variables
dotenv.config();

async function examineArticles() {
  try {
    // Connect to database
    await connectDB();
    logger.info('✅ Connected to database\n');
    
    // Get a few sample articles
    const sampleArticles = await News.find({
      status: { $in: ['draft', 'published'] }
    })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('author', 'username email')
    .populate('category', 'name');
    
    logger.info(`📊 Examining ${sampleArticles.length} sample articles:\n`);
    
    sampleArticles.forEach((article, index) => {
      logger.info(`\n--- Article ${index + 1}: ${article.title?.en || 'No title'} ---`);
      logger.info(`Status: ${article.status}`);
      logger.info(`Category: ${article.category?.name || 'No category'}`);
      logger.info(`Author: ${article.author?.username || article.author?.email || 'Unknown'}`);
      logger.info(`Created: ${article.createdAt}`);
      
      // Check English content
      const enContent = article.content?.en || '';
      const enTitle = article.title?.en || '';
      const enDescription = article.description?.en || '';
      
      logger.info(`\n📝 English Content Analysis:`);
      logger.info(`  Title: "${enTitle}"`);
      logger.info(`  Description: "${enDescription}"`);
      logger.info(`  Content length: ${enContent.length} characters`);
      logger.info(`  Has HTML tags: ${enContent.includes('<') ? '✅' : '❌'}`);
      logger.info(`  Has headings: ${enContent.includes('<h') ? '✅' : '❌'}`);
      logger.info(`  Has paragraphs: ${enContent.includes('<p>') ? '✅' : '❌'}`);
      logger.info(`  Has quotes: ${enContent.includes('<blockquote>') ? '✅' : '❌'}`);
      logger.info(`  Has lists: ${enContent.includes('<ul>') || enContent.includes('<ol>') ? '✅' : '❌'}`);
      
      // Check Khmer content
      const khContent = article.content?.kh || '';
      const khTitle = article.title?.kh || '';
      const khDescription = article.description?.kh || '';
      
      logger.info(`\n🌏 Khmer Content Analysis:`);
      logger.info(`  Title: "${khTitle}"`);
      logger.info(`  Description: "${khDescription}"`);
      logger.info(`  Content length: ${khContent.length} characters`);
      logger.info(`  Has content: ${khContent.length > 0 ? '✅' : '❌'}`);
      logger.info(`  Has HTML tags: ${khContent.includes('<') ? '✅' : '❌'}`);
      logger.info(`  Has headings: ${khContent.includes('<h') ? '✅' : '❌'}`);
      logger.info(`  Has paragraphs: ${khContent.includes('<p>') ? '✅' : '❌'}`);
      logger.info(`  Has quotes: ${khContent.includes('<blockquote>') ? '✅' : '❌'}`);
      logger.info(`  Has lists: ${khContent.includes('<ul>') || khContent.includes('<ol>') ? '✅' : '❌'}`);
      
      // Show content preview
      logger.info(`\n📄 Content Preview (first 200 chars):`);
      logger.info(`  EN: "${enContent.substring(0, 200)}${enContent.length > 200 ? '...' : ''}"`);
      logger.info(`  KH: "${khContent.substring(0, 200)}${khContent.length > 200 ? '...' : ''}"`);
      
      // Check for issues
      const issues = [];
      if (!enContent.includes('<')) issues.push('English content not formatted');
      if (!khContent.includes('<')) issues.push('Khmer content not formatted');
      if (khContent.length === 0) issues.push('Missing Khmer translation');
      if (enContent.length < 100) issues.push('English content too short');
      if (khContent.length < 100) issues.push('Khmer content too short');
      
      if (issues.length > 0) {
        logger.info(`\n⚠️  Issues found:`);
        issues.forEach(issue => logger.info(`  - ${issue}`));
      } else {
        logger.info(`\n✅ No obvious issues found`);
      }
    });
    
    // Check overall statistics
    logger.info(`\n📈 Overall Statistics:`);
    
    const totalArticles = await News.countDocuments({ status: { $in: ['draft', 'published'] } });
    const articlesWithHtml = await News.countDocuments({
      status: { $in: ['draft', 'published'] },
      'content.en': { $regex: /<[^>]*>/ }
    });
    const articlesWithKhmer = await News.countDocuments({
      status: { $in: ['draft', 'published'] },
      'content.kh': { $exists: true, $ne: '' }
    });
    const articlesWithKhmerHtml = await News.countDocuments({
      status: { $in: ['draft', 'published'] },
      'content.kh': { $regex: /<[^>]*>/ }
    });
    
    logger.info(`  Total articles: ${totalArticles}`);
    logger.info(`  Articles with HTML formatting: ${articlesWithHtml} (${Math.round(articlesWithHtml/totalArticles*100)}%)`);
    logger.info(`  Articles with Khmer content: ${articlesWithKhmer} (${Math.round(articlesWithKhmer/totalArticles*100)}%)`);
    logger.info(`  Articles with Khmer HTML: ${articlesWithKhmerHtml} (${Math.round(articlesWithKhmerHtml/totalArticles*100)}%)`);
    
  } catch (error) {
    logger.error('💥 Script failed:', error);
  } finally {
    process.exit(0);
  }
}

examineArticles();
