import dotenv from 'dotenv';
import connectDB from './config/db.mjs';
import News from './models/News.mjs';
import imageGenerationService from './services/imageGenerationService.mjs';
import logger from '../utils/logger.mjs';

// Load environment variables
dotenv.config({ path: './backend/.env' });

// Rate limiting configuration
const RATE_LIMIT_CONFIG = {
  delayBetweenCalls: 3000, // 3 seconds between API calls
  delayBetweenArticles: 5000, // 5 seconds between articles
  maxRetries: 3,
  retryDelay: 10000, // 10 seconds on error
  batchSize: 5, // Process articles in batches
  batchDelay: 30000 // 30 seconds between batches
};

let hourlyCallCount = 0;
let lastHourReset = Date.now();

function checkRateLimit() {
  const now = Date.now();
  
  // Reset hourly counter if an hour has passed
  if (now - lastHourReset >= 60 * 60 * 1000) {
    hourlyCallCount = 0;
    lastHourReset = now;
  }
  
  // Check hourly limit (conservative: 50 calls per hour)
  if (hourlyCallCount >= 50) {
    const timeUntilReset = 60 * 60 * 1000 - (now - lastHourReset);
    return { shouldWait: true, waitTime: timeUntilReset };
  }
  
  return { shouldWait: false, waitTime: 0 };
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function generateImagesForArticles() {
  logger.info('🎨 Starting image generation for articles...\n');
  
  try {
    // Connect to database
    await connectDB();
    logger.info('✅ Connected to database\n');
    
    // Find articles that need images (have thumbnails but no images array or empty images array)
    const articlesNeedingImages = await News.find({
      status: { $in: ['draft', 'published'] },
      $or: [
        { images: { $exists: false } },
        { images: null },
        { images: [] }
      ]
    }).sort({ createdAt: -1 });
    
    logger.info(`📊 Found ${articlesNeedingImages.length} articles needing images\n`);
    
    if (articlesNeedingImages.length === 0) {
      logger.info('🎉 All articles already have images!');
      return;
    }
    
    let processedCount = 0;
    let successCount = 0;
    let errorCount = 0;
    
    // Process articles in batches
    for (let i = 0; i < articlesNeedingImages.length; i += RATE_LIMIT_CONFIG.batchSize) {
      const batch = articlesNeedingImages.slice(i, i + RATE_LIMIT_CONFIG.batchSize);
      
      logger.info(`\n📦 Processing batch ${Math.floor(i / RATE_LIMIT_CONFIG.batchSize) + 1}/${Math.ceil(articlesNeedingImages.length / RATE_LIMIT_CONFIG.batchSize)}`);
      logger.info(`   Articles ${i + 1}-${Math.min(i + RATE_LIMIT_CONFIG.batchSize, articlesNeedingImages.length)} of ${articlesNeedingImages.length}\n`);
      
      for (const article of batch) {
        try {
          // Check rate limit
          const rateLimitCheck = checkRateLimit();
          if (rateLimitCheck.shouldWait) {
            logger.info(`⏳ Rate limit reached. Waiting ${Math.round(rateLimitCheck.waitTime / 1000)} seconds...`);
            await sleep(rateLimitCheck.waitTime);
            hourlyCallCount = 0;
            lastHourReset = Date.now();
          }
          
          logger.info(`🖼️  Generating image for: ${article.title?.en || 'No title'}`);
          
          // Generate image using the service
          const imageResult = await imageGenerationService.generateImageForArticle(
            article.title?.en || '',
            article.content?.en || article.description?.en || ''
          );
          
          if (imageResult && imageResult.imageBuffer) {
            // Update article with generated image
            const updates = {};
            
            // Add the generated image to the images array
            if (!article.images) {
              updates.images = [];
            }
            
            // For now, we'll store the image description as a placeholder
            // In a full implementation, you'd upload the imageBuffer to Cloudinary or similar
            const imageData = {
              url: `data:image/png;base64,${imageResult.imageBuffer.toString('base64')}`,
              description: imageResult.description || 'AI-generated image',
              generated: true,
              timestamp: imageResult.timestamp,
              service: imageResult.service
            };
            
            updates.$push = { images: imageData };
            
            // Update the article
            await News.findByIdAndUpdate(article._id, updates);
            
            logger.info(`   ✅ Image generated successfully`);
            successCount++;
          } else {
            logger.info(`   ❌ Failed to generate image`);
            errorCount++;
          }
          
          processedCount++;
          hourlyCallCount++;
          
          // Delay between articles
          if (processedCount < articlesNeedingImages.length) {
            logger.info(`   ⏳ Waiting ${RATE_LIMIT_CONFIG.delayBetweenArticles / 1000} seconds...`);
            await sleep(RATE_LIMIT_CONFIG.delayBetweenArticles);
          }
          
        } catch (error) {
          logger.error(`   💥 Error processing article: ${error.message}`);
          errorCount++;
          processedCount++;
        }
      }
      
      // Delay between batches
      if (i + RATE_LIMIT_CONFIG.batchSize < articlesNeedingImages.length) {
        logger.info(`\n⏳ Batch complete. Waiting ${RATE_LIMIT_CONFIG.batchDelay / 1000} seconds before next batch...`);
        await sleep(RATE_LIMIT_CONFIG.batchDelay);
      }
    }
    
    logger.info(`\n📈 Image Generation Summary:`);
    logger.info(`  ✅ Successfully processed: ${successCount}`);
    logger.info(`  ❌ Errors: ${errorCount}`);
    logger.info(`  📊 Total processed: ${processedCount}`);
    logger.info(`  🎯 Total articles needing images: ${articlesNeedingImages.length}`);
    
  } catch (error) {
    logger.error('💥 Script failed:', error);
  } finally {
    process.exit(0);
  }
}

generateImagesForArticles();
