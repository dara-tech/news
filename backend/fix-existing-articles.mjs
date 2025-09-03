import dotenv from 'dotenv';
import connectDB from './config/db.mjs';
import News from './models/News.mjs';
import sentinelService from './services/sentinelService.mjs';
import logger from '../utils/logger.mjs';

// Load environment variables
dotenv.config();

async function fixExistingArticles() {
  logger.info('🔧 Starting to fix existing articles with enhanced formatting and translation...\n');
  
  try {
    // Connect to database
    await connectDB();
    logger.info('✅ Connected to database\n');
    
    // Find articles that need fixing (those without HTML formatting)
    const articlesToFix = await News.find({
      status: { $in: ['draft', 'published'] },
      'content.en': { $not: /<[^>]*>/ }
    }).sort({ createdAt: -1 }); // Process all articles
    
    logger.info(`📊 Found ${articlesToFix.length} articles that need fixing\n`);
    
    if (articlesToFix.length === 0) {
      logger.info('✅ No articles need fixing!');
      return;
    }
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const article of articlesToFix) {
      try {
        logger.info(`\n🔄 Processing: ${article.title?.en || article.title || 'Untitled'}`);
        logger.info(`   Status: ${article.status}`);
        logger.info(`   Created: ${article.createdAt}`);
        
        // Check current state
        const hasKhmerContent = !!article.content?.kh;
        const hasKhmerTitle = !!article.title?.kh;
        const hasKhmerDescription = !!article.description?.kh;
        const hasHtmlFormatting = article.content?.en?.includes('<');
        
        logger.info(`   Current state:`);
        logger.info(`     - Khmer content: ${hasKhmerContent ? '✅' : '❌'}`);
        logger.info(`     - Khmer title: ${hasKhmerTitle ? '✅' : '❌'}`);
        logger.info(`     - Khmer description: ${hasKhmerDescription ? '✅' : '❌'}`);
        logger.info(`     - HTML formatting: ${hasHtmlFormatting ? '✅' : '❌'}`);
        
        // Get English content
        const englishContent = article.content?.en || article.content || '';
        const englishTitle = article.title?.en || article.title || '';
        
        if (!englishContent || !englishTitle) {
          logger.info(`   ⏭️  Skipping - missing English content or title`);
          continue;
        }
        
        // Apply enhanced processing
        logger.info(`   🎨 Applying enhanced formatting and translation...`);
        
        const autoProcessedContent = await sentinelService.autoProcessContent(englishContent, englishTitle);
        
        if (autoProcessedContent) {
          // Prepare update data
          const updateData = {
            content: {
              en: autoProcessedContent.en,
              kh: autoProcessedContent.kh || article.content?.kh || ''
            },
            autoProcessingMetadata: {
              formatted: true,
              translated: !!autoProcessedContent.kh,
              titleTranslated: !!autoProcessedContent.khmerTitle,
              descriptionTranslated: !!autoProcessedContent.khmerDescription,
              analyzed: !!autoProcessedContent.analysis,
              analysis: autoProcessedContent.analysis,
              processedAt: new Date().toISOString(),
              originalProcessing: true
            }
          };
          
          // Add Khmer title and description if available
          if (autoProcessedContent.khmerTitle) {
            updateData.title = {
              en: article.title?.en || article.title,
              kh: autoProcessedContent.khmerTitle
            };
          }
          
          if (autoProcessedContent.khmerDescription) {
            updateData.description = {
              en: article.description?.en || article.description,
              kh: autoProcessedContent.khmerDescription
            };
          }
          
          // Update the article
          await News.findByIdAndUpdate(article._id, updateData);
          
          logger.info(`   ✅ Successfully updated article`);
          logger.info(`     - Formatted content: ${!!autoProcessedContent.en}`);
          logger.info(`     - Khmer content: ${!!autoProcessedContent.kh}`);
          logger.info(`     - Khmer title: ${!!autoProcessedContent.khmerTitle}`);
          logger.info(`     - Khmer description: ${!!autoProcessedContent.khmerDescription}`);
          
          successCount++;
        } else {
          logger.info(`   ❌ Failed to process content`);
          errorCount++;
        }
        
        // Add delay to prevent rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (error) {
        logger.info(`   💥 Error processing article: ${error.message}`);
        errorCount++;
      }
    }
    
    logger.info(`\n📈 Summary:`);
    logger.info(`   ✅ Successfully fixed: ${successCount} articles`);
    logger.info(`   ❌ Errors: ${errorCount} articles`);
    logger.info(`   📊 Total processed: ${successCount + errorCount} articles`);
    
  } catch (error) {
    logger.error('💥 Script failed:', error);
  } finally {
    process.exit(0);
  }
}

// Run the script
fixExistingArticles();
