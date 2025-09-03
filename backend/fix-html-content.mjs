#!/usr/bin/env node

/**
 * Fix HTML Content Issues in Articles
 * Removes unwanted HTML tags and structures from existing articles
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import News from './models/News.mjs';
import { cleanContentObject, needsCleaning } from './utils/contentCleaner.mjs';
import logger from './utils/logger.mjs';

dotenv.config();

async function fixHtmlContent() {
  try {
    logger.info('🔧 Starting HTML content cleanup for articles...\n');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    logger.info('✅ Connected to MongoDB');

    // Find articles that need cleaning
    const articles = await News.find({
      $or: [
        { 'content.en': { $regex: /<html|<head|<body|<script|<style|<meta|<p>|<h2>|<blockquote>|```html/i } },
        { 'content.kh': { $regex: /<html|<head|<body|<script|<style|<meta|<p>|<h2>|<blockquote>|```html/i } },
        { 'content.en': { $regex: /''\s*$|"\s*$|'\s*$/ } },
        { 'content.kh': { $regex: /''\s*$|"\s*$|'\s*$/ } }
      ]
    }).limit(50); // Process in batches

    if (articles.length === 0) {
      logger.info('✅ No articles found that need HTML content cleanup');
      return;
    }

    logger.info(`📰 Found ${articles.length} articles that need HTML content cleanup\n`);

    let fixedCount = 0;
    let skippedCount = 0;
    
    for (const article of articles) {
      try {
        logger.info(`\n🔄 Processing: ${article.title?.en || 'No title'}`);
        logger.info(`   Status: ${article.status}`);
        
        let needsUpdate = false;
        const updates = {};
        
        // Check and fix English content
        if (article.content?.en && needsCleaning(article.content.en)) {
          const cleanedEn = cleanContentObject({ en: article.content.en });
          if (cleanedEn.en !== article.content.en) {
            updates['content.en'] = cleanedEn.en;
            needsUpdate = true;
            logger.info(`   ✅ English content cleaned`);
          }
        }
        
        // Check and fix Khmer content
        if (article.content?.kh && needsCleaning(article.content.kh)) {
          const cleanedKh = cleanContentObject({ kh: article.content.kh });
          if (cleanedKh.kh !== article.content.kh) {
            updates['content.kh'] = cleanedKh.kh;
            needsUpdate = true;
            logger.info(`   ✅ Khmer content cleaned`);
          }
        }
        
        if (needsUpdate) {
          await News.findByIdAndUpdate(article._id, updates);
          fixedCount++;
          logger.info(`   🎯 Article updated successfully`);
        } else {
          skippedCount++;
          logger.info(`   ⏭️  No changes needed`);
        }
        
      } catch (error) {
        logger.error(`   ❌ Error processing article ${article._id}:`, error.message);
        skippedCount++;
      }
    }

    logger.info(`\n📊 HTML Content Cleanup Summary:`);
    logger.info(`   ✅ Articles fixed: ${fixedCount}`);
    logger.info(`   ⏭️  Articles skipped: ${skippedCount}`);
    logger.info(`   📰 Total processed: ${articles.length}`);

  } catch (error) {
    logger.error('❌ HTML content cleanup failed:', error);
  } finally {
    await mongoose.disconnect();
    logger.info('✅ Disconnected from MongoDB');
  }
}

// Run the fix
fixHtmlContent().then(() => {
  logger.info('🎉 HTML content cleanup completed');
  process.exit(0);
}).catch((error) => {
  logger.error('💥 HTML content cleanup failed:', error);
  process.exit(1);
});
