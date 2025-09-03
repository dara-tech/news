#!/usr/bin/env node

/**
 * Fix Article Content Formatting Issues
 * 
 * This script fixes common content formatting issues in existing articles:
 * - Removes HTML head tags and unwanted HTML structure
 * - Removes triple quotes (''') at the end of content
 * - Removes "Former U.S. Background" text
 * - Adds proper paragraph structure
 * - Fixes content formatting for both English and Khmer content
 */

import mongoose from 'mongoose';
import { cleanContent } from './utils/contentCleaner.mjs';
import { formatContentAdvanced } from './utils/advancedContentFormatter.mjs';
import logger from './utils/logger.mjs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import models
import News from './models/News.mjs';

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/news-app');
    logger.info('Connected to MongoDB');
  } catch (error) {
    logger.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Check if content needs fixing
function needsContentFix(content) {
  if (!content || typeof content !== 'string') return false;
  
  const problematicPatterns = [
    /Former U\. S\. Background/i,
    /'''\s*$/,
    /"""/,
    /<head[^>]*>/i,
    /<html[^>]*>/i,
    /<body[^>]*>/i,
    /<\/body>/i,
    /<\/html>/i,
    /<script[^>]*>/i,
    /<style[^>]*>/i,
    /<meta[^>]*>/i,
    /^Background/i,  // Content starting with "Background"
    /^Former U\. S\. Background/i  // Content starting with "Former U.S. Background"
  ];
  
  // Also check for formatting issues
  const hasNoParagraphs = content.length > 500 && !content.includes('<p>');
  const hasLongParagraphs = content.length > 2000 && !content.includes('<p>');
  
  return problematicPatterns.some(pattern => pattern.test(content)) || hasNoParagraphs || hasLongParagraphs;
}

// Fix content formatting
async function fixContentFormatting(content) {
  try {
    // Step 1: Clean the content
    let cleanedContent = cleanContent(content);
    
    // Step 2: Format with advanced formatter
    const formattingResult = await formatContentAdvanced(cleanedContent, {
      enableAIEnhancement: false, // Disable AI to avoid API calls
      enableReadabilityOptimization: true,
      enableSEOOptimization: true,
      enableVisualEnhancement: true,
      addSectionHeadings: true,
      enhanceQuotes: true,
      optimizeLists: true,
      preserveOriginalStructure: false
    });
    
    return formattingResult.success ? formattingResult.content : cleanedContent;
  } catch (error) {
    logger.error('Error fixing content formatting:', error);
    return content; // Return original content if fixing fails
  }
}

// Main function to fix articles
async function fixArticles() {
  try {
    await connectDB();
    
    logger.info('Starting article content formatting fix...');
    
    // Find articles that need fixing - use a broader search
    const articles = await News.find({
      $or: [
        { 'content.en': { $regex: /Former U\. S\. Background|Background|'''|"""|<head|<html|<body|<script|<style|<meta/i } },
        { 'content.kh': { $regex: /Former U\. S\. Background|Background|'''|"""|<head|<html|<body|<script|<style|<meta/i } }
      ]
    }).limit(50); // Process in batches
    
    // Also find articles with formatting issues (no paragraph structure)
    const formattingIssues = await News.find({
      $and: [
        { 'content.en': { $exists: true } },
        { 'content.en': { $not: { $regex: /<p>/i } } },
        { 'content.en': { $regex: /.{500,}/ } } // Content longer than 500 chars
      ]
    }).limit(50);
    
    // Combine and deduplicate
    const allArticles = [...articles, ...formattingIssues];
    const uniqueArticles = allArticles.filter((article, index, self) => 
      index === self.findIndex(a => a._id.toString() === article._id.toString())
    );
    
    logger.info(`Found ${uniqueArticles.length} articles that may need content formatting fixes`);
    
    let fixedCount = 0;
    let skippedCount = 0;
    
    for (const article of uniqueArticles) {
      try {
        let needsFix = false;
        let updatedContent = { ...article.content };
        
        // Check and fix English content
        if (article.content.en && needsContentFix(article.content.en)) {
          logger.info(`Fixing English content for article: ${article.title.en}`);
          updatedContent.en = await fixContentFormatting(article.content.en);
          needsFix = true;
        }
        
        // Check and fix Khmer content
        if (article.content.kh && needsContentFix(article.content.kh)) {
          logger.info(`Fixing Khmer content for article: ${article.title.en}`);
          updatedContent.kh = await fixContentFormatting(article.content.kh);
          needsFix = true;
        }
        
        if (needsFix) {
          // Update the article
          await News.findByIdAndUpdate(article._id, {
            content: updatedContent,
            updatedAt: new Date()
          });
          
          fixedCount++;
          logger.info(`✅ Fixed article: ${article.title.en} (ID: ${article._id})`);
        } else {
          skippedCount++;
          logger.info(`⏭️ Skipped article (no fixes needed): ${article.title.en}`);
        }
        
        // Add small delay to avoid overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        logger.error(`Error fixing article ${article._id}:`, error);
      }
    }
    
    logger.info(`\n📊 Content formatting fix completed:`);
    logger.info(`   - Articles fixed: ${fixedCount}`);
    logger.info(`   - Articles skipped: ${skippedCount}`);
    logger.info(`   - Total processed: ${uniqueArticles.length}`);
    
  } catch (error) {
    logger.error('Error in fixArticles:', error);
  } finally {
    await mongoose.disconnect();
    logger.info('Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the fix
if (import.meta.url === `file://${process.argv[1]}`) {
  fixArticles().catch(error => {
    logger.error('Script failed:', error);
    process.exit(1);
  });
}

export { fixArticles, needsContentFix, fixContentFormatting };
