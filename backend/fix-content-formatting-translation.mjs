import dotenv from 'dotenv';
import connectDB from './config/db.mjs';
import News from './models/News.mjs';
import User from './models/User.mjs';
import Category from './models/Category.mjs';
import { formatContentAdvanced } from './utils/advancedContentFormatter.mjs';
import { GoogleGenerativeAI } from '@google/generative-ai';
import logger from '../utils/logger.mjs';

// Load environment variables
dotenv.config();

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

async function translateToKhmer(text, type = 'content') {
  try {
    if (!text || !text.trim()) return '';
    
    const prompt = `
      Translate the following ${type} from English to Khmer (Cambodian language). 
      
      Requirements:
      - Maintain the original meaning, tone, and context
      - Use proper Khmer grammar and vocabulary
      - Ensure cultural appropriateness for Cambodian readers
      - Maintain professional journalistic style
      - If the text contains HTML tags, preserve them in the translation
      - Keep the same paragraph structure and headings
      - Translate numbers and dates appropriately
      
      ${type === 'title' ? 'Make it engaging and SEO-friendly for Khmer readers.' : ''}
      ${type === 'description' ? 'Keep it concise and compelling for Khmer readers.' : ''}
      
      English text:
      ${text}
      
      Provide only the Khmer translation without any additional text or explanations.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    logger.error(`Translation error for ${type}:`, error.message);
    return '';
  }
}

async function fixContentFormattingAndTranslation() {
  logger.info('🔧 Starting comprehensive content formatting and translation fix...\n');
  
  try {
    // Connect to database
    await connectDB();
    logger.info('✅ Connected to database\n');
    
    // Find articles that need fixing
    const articlesToFix = await News.find({
      status: { $in: ['draft', 'published'] }
    }).sort({ createdAt: -1 });
    
    logger.info(`📊 Found ${articlesToFix.length} articles to process\n`);
    
    let successCount = 0;
    let errorCount = 0;
    let skippedCount = 0;
    
    for (const article of articlesToFix) {
      try {
        logger.info(`\n🔄 Processing: ${article.title?.en || 'No title'}`);
        logger.info(`   Status: ${article.status}`);
        logger.info(`   Created: ${article.createdAt}`);
        
        // Check current state
        const hasKhmerContent = !!article.content?.kh && article.content.kh.length > 0;
        const hasKhmerTitle = !!article.title?.kh && article.title.kh.length > 0;
        const hasKhmerDescription = !!article.description?.kh && article.description.kh.length > 0;
        const hasEnglishHtml = article.content?.en?.includes('<');
        const hasKhmerHtml = article.content?.kh?.includes('<');
        
        logger.info(`   Current state:`);
        logger.info(`     - Khmer content: ${hasKhmerContent ? '✅' : '❌'}`);
        logger.info(`     - Khmer title: ${hasKhmerTitle ? '✅' : '❌'}`);
        logger.info(`     - Khmer description: ${hasKhmerDescription ? '✅' : '❌'}`);
        logger.info(`     - English HTML: ${hasEnglishHtml ? '✅' : '❌'}`);
        logger.info(`     - Khmer HTML: ${hasKhmerHtml ? '✅' : '❌'}`);
        
        // Get English content
        const englishContent = article.content?.en || '';
        const englishTitle = article.title?.en || '';
        const englishDescription = article.description?.en || '';
        
        if (!englishContent || !englishTitle) {
          logger.info(`   ⏭️  Skipping - missing English content or title`);
          skippedCount++;
          continue;
        }
        
        let needsUpdate = false;
        const updates = {};
        
        // Fix 1: Format English content if not formatted
        if (!hasEnglishHtml && englishContent.trim()) {
          logger.info(`   🎨 Formatting English content...`);
          try {
            const enResult = await formatContentAdvanced(englishContent, {
              enableAIEnhancement: true,
              enableReadabilityOptimization: true,
              enableSEOOptimization: true,
              enableVisualEnhancement: true,
              addSectionHeadings: true,
              enhanceQuotes: true,
              optimizeLists: true,
              enableContentAnalysis: false
            });
            
            if (enResult.success) {
              updates['content.en'] = enResult.content;
              logger.info(`   ✅ English content formatted`);
              needsUpdate = true;
            }
          } catch (error) {
            logger.info(`   ⚠️  English formatting failed: ${error.message}`);
          }
        }
        
        // Fix 2: Translate title if missing
        if (!hasKhmerTitle && englishTitle.trim()) {
          logger.info(`   🌏 Translating title...`);
          const khmerTitle = await translateToKhmer(englishTitle, 'title');
          if (khmerTitle) {
            updates['title.kh'] = khmerTitle;
            logger.info(`   ✅ Title translated`);
            needsUpdate = true;
          }
        }
        
        // Fix 3: Translate description if missing
        if (!hasKhmerDescription && englishDescription.trim()) {
          logger.info(`   🌏 Translating description...`);
          const khmerDescription = await translateToKhmer(englishDescription, 'description');
          if (khmerDescription) {
            updates['description.kh'] = khmerDescription;
            logger.info(`   ✅ Description translated`);
            needsUpdate = true;
          }
        }
        
        // Fix 4: Translate and format Khmer content
        if (englishContent.trim()) {
          let khmerContent = article.content?.kh || '';
          
          // If no Khmer content, translate from English
          if (!hasKhmerContent) {
            logger.info(`   🌏 Translating content...`);
            khmerContent = await translateToKhmer(englishContent, 'content');
          }
          
          // If Khmer content exists but not formatted, format it
          if (khmerContent && !hasKhmerHtml) {
            logger.info(`   🎨 Formatting Khmer content...`);
            try {
              const khResult = await formatContentAdvanced(khmerContent, {
                enableAIEnhancement: true,
                enableReadabilityOptimization: true,
                enableSEOOptimization: true,
                enableVisualEnhancement: true,
                addSectionHeadings: true,
                enhanceQuotes: true,
                optimizeLists: true,
                enableContentAnalysis: false
              });
              
              if (khResult.success) {
                updates['content.kh'] = khResult.content;
                logger.info(`   ✅ Khmer content formatted`);
                needsUpdate = true;
              }
            } catch (error) {
              logger.info(`   ⚠️  Khmer formatting failed: ${error.message}`);
              // If formatting fails, at least save the translated content
              if (khmerContent && !article.content?.kh) {
                updates['content.kh'] = khmerContent;
                needsUpdate = true;
              }
            }
          } else if (khmerContent && !article.content?.kh) {
            // Save translated content even if formatting fails
            updates['content.kh'] = khmerContent;
            needsUpdate = true;
          }
        }
        
        // Apply updates if needed
        if (needsUpdate) {
          await News.findByIdAndUpdate(article._id, {
            $set: updates
          });
          logger.info(`   💾 Article updated successfully`);
          successCount++;
        } else {
          logger.info(`   ✅ Article already properly formatted and translated`);
          skippedCount++;
        }
        
        // Add a small delay to avoid overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        logger.error(`   💥 Error processing article: ${error.message}`);
        errorCount++;
      }
    }
    
    logger.info(`\n📈 Processing Summary:`);
    logger.info(`  ✅ Successfully processed: ${successCount}`);
    logger.info(`  ⏭️  Skipped (already good): ${skippedCount}`);
    logger.info(`  ❌ Errors: ${errorCount}`);
    logger.info(`  📊 Total articles: ${articlesToFix.length}`);
    
  } catch (error) {
    logger.error('💥 Script failed:', error);
  } finally {
    process.exit(0);
  }
}

fixContentFormattingAndTranslation();

