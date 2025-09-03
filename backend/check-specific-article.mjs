import dotenv from 'dotenv';
import connectDB from './config/db.mjs';
import News from './models/News.mjs';
import User from './models/User.mjs';
import Category from './models/Category.mjs';
import logger from '../utils/logger.mjs';

// Load environment variables
dotenv.config({ path: './backend/.env' });

async function checkSpecificArticle() {
  try {
    // Connect to database
    await connectDB();
    logger.info('✅ Connected to database\n');
    
    // Find the specific article by slug
    const slug = 'australia-s-environmental-law-overhaul-a-critical-step';
    const article = await News.findOne({ slug })
      .populate({
        path: 'author',
        select: 'username email role profileImage'
      })
      .populate('category', 'name color slug');
    
    if (!article) {
      logger.info('❌ Article not found with slug:', slug);
      return;
    }
    
    logger.info(`📄 Article found: ${article.title?.en || 'No title'}`);
    logger.info(`   Status: ${article.status}`);
    logger.info(`   ID: ${article._id}`);
    logger.info(`   Slug: ${article.slug}`);
    
    // Check content structure
    logger.info('\n📋 Content Analysis:');
    logger.info(`   English title: ${article.title?.en ? '✅ Present' : '❌ Missing'}`);
    logger.info(`   Khmer title: ${article.title?.kh ? '✅ Present' : '❌ Missing'}`);
    logger.info(`   English description: ${article.description?.en ? '✅ Present' : '❌ Missing'}`);
    logger.info(`   Khmer description: ${article.description?.kh ? '✅ Present' : '❌ Missing'}`);
    logger.info(`   English content: ${article.content?.en ? '✅ Present' : '❌ Missing'}`);
    logger.info(`   Khmer content: ${article.content?.kh ? '✅ Present' : '❌ Missing'}`);
    
    // Check content length
    if (article.content?.en) {
      logger.info(`   English content length: ${article.content.en.length} characters`);
    }
    if (article.content?.kh) {
      logger.info(`   Khmer content length: ${article.content.kh.length} characters`);
    }
    
    // Check for problematic content
    if (article.content?.en) {
      if (article.content.en.includes('<html>')) {
        logger.info('   ⚠️  English content contains HTML tags');
      }
      if (article.content.en.includes("''")) {
        logger.info('   ⚠️  English content contains empty quotes');
      }
      if (article.content.en.includes('```')) {
        logger.info('   ⚠️  English content contains code blocks');
      }
      if (article.content.en.trim().length < 10) {
        logger.info('   ⚠️  English content is too short');
      }
    }
    
    if (article.content?.kh) {
      if (article.content.kh.includes('<html>')) {
        logger.info('   ⚠️  Khmer content contains HTML tags');
      }
      if (article.content.kh.includes("''")) {
        logger.info('   ⚠️  Khmer content contains empty quotes');
      }
      if (article.content.kh.includes('```')) {
        logger.info('   ⚠️  Khmer content contains code blocks');
      }
      if (article.content.kh.trim().length < 10) {
        logger.info('   ⚠️  Khmer content is too short');
      }
    }
    
    // Check if content is copied from English
    if (article.content?.en && article.content?.kh) {
      if (article.content.en === article.content.kh) {
        logger.info('   ⚠️  Khmer content is copied from English');
      }
    }
    
    // Check author and category
    logger.info('\n👤 Author & Category:');
    logger.info(`   Author: ${article.author ? '✅ Present' : '❌ Missing'}`);
    if (article.author) {
      logger.info(`   Author username: ${article.author.username || 'N/A'}`);
    }
    logger.info(`   Category: ${article.category ? '✅ Present' : '❌ Missing'}`);
    if (article.category) {
      logger.info(`   Category name: ${article.category.name?.en || 'N/A'}`);
    }
    
    // Try to fix the article if it has issues
    logger.info('\n🔧 Attempting to fix article...');
    
    let needsUpdate = false;
    const updates = {};
    
    // Fix empty content
    if (!article.content?.en || article.content.en.trim().length < 10) {
      logger.info('   🔧 Adding placeholder English content');
      updates['content.en'] = 'This article is currently being updated. Please check back later for the full content.';
      needsUpdate = true;
    }
    
    if (!article.content?.kh || article.content.kh.trim().length < 10) {
      logger.info('   🔧 Adding placeholder Khmer content');
      updates['content.kh'] = 'អត្ថបទនេះកំពុងត្រូវបានធ្វើបច្ចុប្បន្នភាព។ សូមពិនិត្យមើលម្តងទៀតដើម្បីមើលអត្ថបទពេញលេញ។';
      needsUpdate = true;
    }
    
    // Fix copied content
    if (article.content?.en && article.content?.kh && article.content.en === article.content.kh) {
      logger.info('   🔧 Fixing copied Khmer content');
      updates['content.kh'] = 'អត្ថបទនេះកំពុងត្រូវបានបកប្រែ។ សូមពិនិត្យមើលម្តងទៀតដើម្បីមើលអត្ថបទពេញលេញ។';
      needsUpdate = true;
    }
    
    // Clean HTML artifacts
    if (article.content?.en && article.content.en.includes('<html>')) {
      logger.info('   🔧 Cleaning HTML artifacts from English content');
      let cleanedContent = article.content.en.replace(/<html>\s*/i, '');
      cleanedContent = cleanedContent.replace(/''\s*$/, '');
      cleanedContent = cleanedContent.replace(/```[\s\S]*?```/g, '');
      cleanedContent = cleanedContent.trim();
      
      if (cleanedContent.length < 10) {
        cleanedContent = 'This article is currently being updated. Please check back later for the full content.';
      }
      
      updates['content.en'] = cleanedContent;
      needsUpdate = true;
    }
    
    if (article.content?.kh && article.content.kh.includes('<html>')) {
      logger.info('   🔧 Cleaning HTML artifacts from Khmer content');
      let cleanedContent = article.content.kh.replace(/<html>\s*/i, '');
      cleanedContent = cleanedContent.replace(/''\s*$/, '');
      cleanedContent = cleanedContent.replace(/```[\s\S]*?```/g, '');
      cleanedContent = cleanedContent.trim();
      
      if (cleanedContent.length < 10) {
        cleanedContent = 'អត្ថបទនេះកំពុងត្រូវបានធ្វើបច្ចុប្បន្នភាព។ សូមពិនិត្យមើលម្តងទៀតដើម្បីមើលអត្ថបទពេញលេញ។';
      }
      
      updates['content.kh'] = cleanedContent;
      needsUpdate = true;
    }
    
    // Apply updates if needed
    if (needsUpdate) {
      await News.findByIdAndUpdate(article._id, {
        $set: updates
      });
      logger.info('   ✅ Article fixed successfully');
    } else {
      logger.info('   ✅ Article appears to be fine');
    }
    
    logger.info('\n🎉 Article check complete!');
    
  } catch (error) {
    logger.error('💥 Script failed:', error);
  } finally {
    process.exit(0);
  }
}

checkSpecificArticle();
