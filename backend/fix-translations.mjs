import dotenv from 'dotenv';
import connectDB from './config/db.mjs';
import News from './models/News.mjs';
import User from './models/User.mjs';
import Category from './models/Category.mjs';
import { GoogleGenerativeAI } from '@google/generative-ai';
import logger from '../utils/logger.mjs';

// Load environment variables
dotenv.config({ path: './backend/.env' });

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// Rate limiting configuration
const RATE_LIMIT_CONFIG = {
  delayBetweenCalls: 3000, // 3 seconds between API calls
  delayBetweenArticles: 5000, // 5 seconds between articles
  maxRetries: 3,
  retryDelay: 10000, // 10 seconds on error
  batchSize: 10, // Process articles in batches
  batchDelay: 30000 // 30 seconds between batches
};

// Rate limiting state
let lastApiCall = 0;
let apiCallCount = 0;
let hourlyCallCount = 0;
let lastHourReset = Date.now();

// Rate limiting function
function checkRateLimit() {
  const now = Date.now();
  
  // Reset hourly counter if an hour has passed
  if (now - lastHourReset > 60 * 60 * 1000) {
    hourlyCallCount = 0;
    lastHourReset = now;
  }
  
  // Check if we need to wait between API calls
  const timeSinceLastCall = now - lastApiCall;
  if (timeSinceLastCall < RATE_LIMIT_CONFIG.delayBetweenCalls) {
    const waitTime = RATE_LIMIT_CONFIG.delayBetweenCalls - timeSinceLastCall;
    return { shouldWait: true, waitTime };
  }
  
  // Check hourly limit (conservative: 50 calls per hour)
  if (hourlyCallCount >= 50) {
    const timeUntilReset = 60 * 60 * 1000 - (now - lastHourReset);
    return { shouldWait: true, waitTime: timeUntilReset };
  }
  
  return { shouldWait: false };
}

// Update rate limit counters
function updateRateLimit() {
  const now = Date.now();
  lastApiCall = now;
  apiCallCount++;
  hourlyCallCount++;
}

// Sleep function
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function translateToKhmer(text, type = 'content') {
  try {
    if (!text || !text.trim()) return '';
    
    // Clean the text first (remove HTML tags for translation)
    const cleanText = text.replace(/<[^>]*>/g, '').trim();
    if (!cleanText) return '';
    
    // Check rate limits before making API call
    const rateLimitCheck = checkRateLimit();
    if (rateLimitCheck.shouldWait) {
      logger.info(`   ⏳ Rate limit check: waiting ${Math.ceil(rateLimitCheck.waitTime / 1000)}s before API call`);
      await sleep(rateLimitCheck.waitTime);
    }
    
    const prompt = `
      Translate the following ${type} from English to Khmer (Cambodian language). 
      
      Requirements:
      - Maintain the original meaning, tone, and context
      - Use proper Khmer grammar and vocabulary
      - Ensure cultural appropriateness for Cambodian readers
      - Maintain professional journalistic style
      - Keep the same paragraph structure
      - Translate numbers and dates appropriately
      
      ${type === 'title' ? 'Make it engaging and SEO-friendly for Khmer readers. Keep it concise (30-70 characters).' : ''}
      ${type === 'description' ? 'Keep it concise and compelling for Khmer readers (120-160 characters).' : ''}
      ${type === 'content' ? 'Preserve the original structure and flow. Translate all paragraphs properly.' : ''}
      
      English text:
      ${cleanText}
      
      Provide only the Khmer translation without any additional text or explanations.
    `;

    // Update rate limit before making the call
    updateRateLimit();
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    logger.error(`Translation error for ${type}:`, error.message);
    
    // Handle rate limiting errors
    if (error.message?.includes('429') || 
        error.message?.includes('quota') || 
        error.message?.includes('rate limit') ||
        error.message?.includes('too many requests')) {
      logger.info(`   ⚠️  Rate limit hit, waiting ${RATE_LIMIT_CONFIG.retryDelay / 1000}s before retry`);
      await sleep(RATE_LIMIT_CONFIG.retryDelay);
      // Reset hourly counter on rate limit
      hourlyCallCount = 0;
      lastHourReset = Date.now();
    }
    
    return '';
  }
}

async function processArticleBatch(articles, startIndex) {
  const batchResults = {
    successCount: 0,
    errorCount: 0,
    skippedCount: 0
  };
  
  for (let i = 0; i < articles.length; i++) {
    const article = articles[i];
    const articleIndex = startIndex + i;
    
    try {
      logger.info(`\n🔄 Processing article ${articleIndex + 1}: ${article.title?.en || 'No title'}`);
      logger.info(`   Status: ${article.status}`);
      
      // Check current translation state
      const hasKhmerTitle = !!article.title?.kh && article.title.kh.length > 0;
      const hasKhmerDescription = !!article.description?.kh && article.description.kh.length > 0;
      const hasKhmerContent = !!article.content?.kh && article.content.kh.length > 0;
      
      // Check if Khmer content is actually translated (not just copied from English)
      const titleIsTranslated = hasKhmerTitle && article.title.kh !== article.title.en;
      const descriptionIsTranslated = hasKhmerDescription && article.description.kh !== article.description.en;
      const contentIsTranslated = hasKhmerContent && article.content.kh !== article.content.en;
      
      logger.info(`   Current translation state:`);
      logger.info(`     - Khmer title: ${hasKhmerTitle ? (titleIsTranslated ? '✅' : '⚠️  (copied)') : '❌'}`);
      logger.info(`     - Khmer description: ${hasKhmerDescription ? (descriptionIsTranslated ? '✅' : '⚠️  (copied)') : '❌'}`);
      logger.info(`     - Khmer content: ${hasKhmerContent ? (contentIsTranslated ? '✅' : '⚠️  (copied)') : '❌'}`);
      
      // Get English content
      const englishTitle = article.title?.en || '';
      const englishDescription = article.description?.en || '';
      const englishContent = article.content?.en || '';
      
      if (!englishTitle || !englishDescription || !englishContent) {
        logger.info(`   ⏭️  Skipping - missing English content`);
        batchResults.skippedCount++;
        continue;
      }
      
      let needsUpdate = false;
      const updates = {};
      
      // Fix 1: Translate title if missing or copied
      if (!hasKhmerTitle || !titleIsTranslated) {
        logger.info(`   🌏 Translating title...`);
        const khmerTitle = await translateToKhmer(englishTitle, 'title');
        if (khmerTitle) {
          updates['title.kh'] = khmerTitle;
          logger.info(`   ✅ Title translated: "${khmerTitle}"`);
          needsUpdate = true;
        }
        
        // Add delay between API calls within the same article
        await sleep(1000);
      }
      
      // Fix 2: Translate description if missing or copied
      if (!hasKhmerDescription || !descriptionIsTranslated) {
        logger.info(`   🌏 Translating description...`);
        const khmerDescription = await translateToKhmer(englishDescription, 'description');
        if (khmerDescription) {
          updates['description.kh'] = khmerDescription;
          logger.info(`   ✅ Description translated: "${khmerDescription}"`);
          needsUpdate = true;
        }
        
        // Add delay between API calls within the same article
        await sleep(1000);
      }
      
      // Fix 3: Translate content if missing or copied
      if (!hasKhmerContent || !contentIsTranslated) {
        logger.info(`   🌏 Translating content...`);
        const khmerContent = await translateToKhmer(englishContent, 'content');
        if (khmerContent) {
          updates['content.kh'] = khmerContent;
          logger.info(`   ✅ Content translated (${khmerContent.length} characters)`);
          needsUpdate = true;
        }
      }
      
      // Apply updates if needed
      if (needsUpdate) {
        await News.findByIdAndUpdate(article._id, {
          $set: updates
        });
        logger.info(`   💾 Article translation updated successfully`);
        batchResults.successCount++;
      } else {
        logger.info(`   ✅ Article already properly translated`);
        batchResults.skippedCount++;
      }
      
      // Add delay between articles
      if (i < articles.length - 1) {
        logger.info(`   ⏳ Waiting ${RATE_LIMIT_CONFIG.delayBetweenArticles / 1000}s before next article...`);
        await sleep(RATE_LIMIT_CONFIG.delayBetweenArticles);
      }
      
    } catch (error) {
      logger.error(`   💥 Error processing article: ${error.message}`);
      batchResults.errorCount++;
      
      // Add extra delay on error
      await sleep(RATE_LIMIT_CONFIG.retryDelay);
    }
  }
  
  return batchResults;
}

async function fixTranslations() {
  logger.info('🌏 Starting translation fix for all articles...\n');
  logger.info(`📊 Rate limit configuration:`);
  logger.info(`   - Delay between API calls: ${RATE_LIMIT_CONFIG.delayBetweenCalls}ms`);
  logger.info(`   - Delay between articles: ${RATE_LIMIT_CONFIG.delayBetweenArticles}ms`);
  logger.info(`   - Batch size: ${RATE_LIMIT_CONFIG.batchSize} articles`);
  logger.info(`   - Delay between batches: ${RATE_LIMIT_CONFIG.batchDelay}ms`);
  logger.info(`   - Max retries: ${RATE_LIMIT_CONFIG.maxRetries}\n`);
  
  try {
    // Connect to database
    await connectDB();
    logger.info('✅ Connected to database\n');
    
    // Find articles that need translation fixes
    const articlesToFix = await News.find({
      status: { $in: ['draft', 'published'] }
    }).sort({ createdAt: -1 });
    
    logger.info(`📊 Found ${articlesToFix.length} articles to check for translation issues\n`);
    
    let totalSuccessCount = 0;
    let totalErrorCount = 0;
    let totalSkippedCount = 0;
    
    // Process articles in batches
    for (let i = 0; i < articlesToFix.length; i += RATE_LIMIT_CONFIG.batchSize) {
      const batch = articlesToFix.slice(i, i + RATE_LIMIT_CONFIG.batchSize);
      const batchNumber = Math.floor(i / RATE_LIMIT_CONFIG.batchSize) + 1;
      const totalBatches = Math.ceil(articlesToFix.length / RATE_LIMIT_CONFIG.batchSize);
      
      logger.info(`\n📦 Processing batch ${batchNumber}/${totalBatches} (${batch.length} articles)`);
      logger.info(`📊 Progress: ${i + 1}-${Math.min(i + RATE_LIMIT_CONFIG.batchSize, articlesToFix.length)} of ${articlesToFix.length} articles`);
      
      const batchResults = await processArticleBatch(batch, i);
      
      totalSuccessCount += batchResults.successCount;
      totalErrorCount += batchResults.errorCount;
      totalSkippedCount += batchResults.skippedCount;
      
      logger.info(`\n📈 Batch ${batchNumber} Summary:`);
      logger.info(`  ✅ Successfully translated: ${batchResults.successCount}`);
      logger.info(`  ⏭️  Skipped (already good): ${batchResults.skippedCount}`);
      logger.info(`  ❌ Errors: ${batchResults.errorCount}`);
      
      // Add delay between batches (except for the last batch)
      if (i + RATE_LIMIT_CONFIG.batchSize < articlesToFix.length) {
        logger.info(`\n⏳ Waiting ${RATE_LIMIT_CONFIG.batchDelay / 1000}s before next batch...`);
        await sleep(RATE_LIMIT_CONFIG.batchDelay);
      }
    }
    
    logger.info(`\n🎉 Translation Fix Complete!`);
    logger.info(`📈 Final Summary:`);
    logger.info(`  ✅ Successfully translated: ${totalSuccessCount}`);
    logger.info(`  ⏭️  Skipped (already good): ${totalSkippedCount}`);
    logger.info(`  ❌ Errors: ${totalErrorCount}`);
    logger.info(`  📊 Total articles processed: ${articlesToFix.length}`);
    logger.info(`  🌏 Total API calls made: ${apiCallCount}`);
    
  } catch (error) {
    logger.error('💥 Script failed:', error);
  } finally {
    process.exit(0);
  }
}

fixTranslations();

