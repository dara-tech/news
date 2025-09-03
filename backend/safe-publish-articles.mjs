#!/usr/bin/env node

/**
 * Safe Article Publishing Script
 * Carefully reviews and publishes draft articles without affecting content
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import News from './models/News.mjs';
import logger from './utils/logger.mjs';

dotenv.config();

async function safePublishArticles() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    logger.info('✅ Connected to MongoDB');

    // Get draft articles that are ready for publishing
    const draftArticles = await News.find({ 
      status: 'draft',
      // Only articles with both English and Khmer content
      'content.en': { $exists: true, $ne: '' },
      'content.kh': { $exists: true, $ne: '' },
      // Only articles with titles
      'title.en': { $exists: true, $ne: '' },
      'title.kh': { $exists: true, $ne: '' }
    }).sort({ createdAt: -1 }).limit(10);

    if (draftArticles.length === 0) {
      logger.info('📰 No draft articles ready for publishing');
      return;
    }

    logger.info(`📰 Found ${draftArticles.length} draft articles ready for review`);

    let publishedCount = 0;
    let skippedCount = 0;

    for (const article of draftArticles) {
      try {
        logger.info(`\n🔄 Reviewing: ${article.title?.en || 'No title'}`);
        logger.info(`   Created: ${article.createdAt?.toISOString().split('T')[0]}`);
        logger.info(`   English content length: ${article.content?.en?.length || 0} chars`);
        logger.info(`   Khmer content length: ${article.content?.kh?.length || 0} chars`);

        // Check if content is clean (no HTML tags)
        const hasHTML = /<[^>]*>/.test(article.content?.en || '') || /<[^>]*>/.test(article.content?.kh || '');
        
        if (hasHTML) {
          logger.info(`   ⚠️  Article has HTML content - skipping for safety`);
          skippedCount++;
          continue;
        }

        // Check content quality
        const enContentLength = article.content?.en?.length || 0;
        const khContentLength = article.content?.kh?.length || 0;
        
        if (enContentLength < 100 || khContentLength < 100) {
          logger.info(`   ⚠️  Article content too short - skipping`);
          skippedCount++;
          continue;
        }

        // Safe to publish
        await News.updateOne(
          { _id: article._id },
          { 
            $set: { 
              status: 'published',
              publishedAt: new Date()
            }
          }
        );

        publishedCount++;
        logger.info(`   ✅ Article published successfully`);

      } catch (articleError) {
        logger.error(`   ❌ Failed to publish article ${article._id}:`, articleError);
        skippedCount++;
      }
    }

    logger.info(`\n📊 Safe Publishing Summary:`);
    logger.info(`   ✅ Articles published: ${publishedCount}`);
    logger.info(`   ⏭️  Articles skipped: ${skippedCount}`);
    logger.info(`   📰 Total reviewed: ${publishedCount + skippedCount}`);

    // Show final status
    const finalPublishedCount = await News.countDocuments({ status: 'published' });
    const finalDraftCount = await News.countDocuments({ status: 'draft' });
    
    logger.info(`\n📊 Final Status:`);
    logger.info(`   Published articles: ${finalPublishedCount}`);
    logger.info(`   Draft articles: ${finalDraftCount}`);

  } catch (error) {
    logger.error('❌ Safe publishing failed:', error);
  } finally {
    await mongoose.disconnect();
    logger.info('✅ Disconnected from MongoDB');
    logger.info('🎉 Safe publishing completed');
  }
}

// Add command line argument support
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');

if (dryRun) {
  logger.info('🔍 DRY RUN MODE - No articles will be published');
  // Modify the function to only show what would be published
  const originalUpdateOne = mongoose.Model.updateOne;
  mongoose.Model.updateOne = function() {
    logger.info('   🔍 [DRY RUN] Would publish this article');
    return Promise.resolve({ acknowledged: true, modifiedCount: 1 });
  };
}

safePublishArticles();
