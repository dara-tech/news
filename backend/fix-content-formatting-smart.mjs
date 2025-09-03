import dotenv from 'dotenv';
import connectDB from './config/db.mjs';
import News from './models/News.mjs';
import logger from '../utils/logger.mjs';

// Load environment variables
dotenv.config({ path: './backend/.env' });

// Smart content cleaning patterns
const CLEANING_PATTERNS = {
  // Remove HTML artifacts
  htmlTags: /<[^>]*>/g,
  htmlStart: /^<html>\s*/i,
  htmlEnd: /<\/html>\s*$/i,
  
  // Remove empty quotes and artifacts
  emptyQuotes: /''\s*$/,
  doubleQuotes: /""\s*$/,
  singleQuotes: /'\s*$/,
  
  // Remove common artifacts
  codeBlocks: /```[^`]*```/g,
  markdownHeaders: /^#{1,6}\s+/gm,
  markdownLinks: /\[([^\]]+)\]\([^)]+\)/g,
  
  // Clean up whitespace
  multipleSpaces: /\s{2,}/g,
  multipleNewlines: /\n{3,}/g,
  leadingTrailingWhitespace: /^\s+|\s+$/gm,
  
  // Remove common text artifacts
  bulletPoints: /^[\s]*[•·▪▫]\s*/gm,
  numberedLists: /^[\s]*\d+\.\s*/gm,
  
  // Remove common formatting artifacts
  boldMarkers: /\*\*([^*]+)\*\*/g,
  italicMarkers: /\*([^*]+)\*/g,
  underlineMarkers: /__([^_]+)__/g,
  
  // Remove common code artifacts
  codeInline: /`([^`]+)`/g,
  codeBlocks: /```[\s\S]*?```/g,
  
  // Remove common HTML entities
  htmlEntities: /&[a-zA-Z0-9#]+;/g,
  
  // Remove common punctuation artifacts
  multiplePunctuation: /[.!?]{2,}/g,
  multipleCommas: /,{2,}/g,
  
  // Remove common formatting artifacts
  brackets: /\[([^\]]*)\]/g,
  parentheses: /\(([^)]*)\)/g,
  
  // Remove common text artifacts
  extraSpaces: /\s+/g,
  trailingSpaces: /\s+$/gm,
  leadingSpaces: /^\s+/gm
};

// Smart content cleaning function
function cleanContentSmart(content) {
  if (!content || typeof content !== 'string') {
    return content;
  }
  
  let cleaned = content;
  let changes = [];
  
  // Remove HTML tags at the beginning
  if (cleaned.match(CLEANING_PATTERNS.htmlStart)) {
    cleaned = cleaned.replace(CLEANING_PATTERNS.htmlStart, '');
    changes.push('removed HTML start tag');
  }
  
  // Remove HTML tags at the end
  if (cleaned.match(CLEANING_PATTERNS.htmlEnd)) {
    cleaned = cleaned.replace(CLEANING_PATTERNS.htmlEnd, '');
    changes.push('removed HTML end tag');
  }
  
  // Remove empty quotes at the end
  if (cleaned.match(CLEANING_PATTERNS.emptyQuotes)) {
    cleaned = cleaned.replace(CLEANING_PATTERNS.emptyQuotes, '');
    changes.push('removed empty quotes');
  }
  
  // Remove double quotes at the end
  if (cleaned.match(CLEANING_PATTERNS.doubleQuotes)) {
    cleaned = cleaned.replace(CLEANING_PATTERNS.doubleQuotes, '');
    changes.push('removed double quotes');
  }
  
  // Remove single quotes at the end
  if (cleaned.match(CLEANING_PATTERNS.singleQuotes)) {
    cleaned = cleaned.replace(CLEANING_PATTERNS.singleQuotes, '');
    changes.push('removed single quotes');
  }
  
  // Remove code blocks
  if (cleaned.match(CLEANING_PATTERNS.codeBlocks)) {
    cleaned = cleaned.replace(CLEANING_PATTERNS.codeBlocks, '');
    changes.push('removed code blocks');
  }
  
  // Remove markdown headers
  if (cleaned.match(CLEANING_PATTERNS.markdownHeaders)) {
    cleaned = cleaned.replace(CLEANING_PATTERNS.markdownHeaders, '');
    changes.push('removed markdown headers');
  }
  
  // Remove markdown links but keep the text
  if (cleaned.match(CLEANING_PATTERNS.markdownLinks)) {
    cleaned = cleaned.replace(CLEANING_PATTERNS.markdownLinks, '$1');
    changes.push('removed markdown links');
  }
  
  // Remove bullet points
  if (cleaned.match(CLEANING_PATTERNS.bulletPoints)) {
    cleaned = cleaned.replace(CLEANING_PATTERNS.bulletPoints, '');
    changes.push('removed bullet points');
  }
  
  // Remove numbered lists
  if (cleaned.match(CLEANING_PATTERNS.numberedLists)) {
    cleaned = cleaned.replace(CLEANING_PATTERNS.numberedLists, '');
    changes.push('removed numbered lists');
  }
  
  // Remove bold markers but keep the text
  if (cleaned.match(CLEANING_PATTERNS.boldMarkers)) {
    cleaned = cleaned.replace(CLEANING_PATTERNS.boldMarkers, '$1');
    changes.push('removed bold markers');
  }
  
  // Remove italic markers but keep the text
  if (cleaned.match(CLEANING_PATTERNS.italicMarkers)) {
    cleaned = cleaned.replace(CLEANING_PATTERNS.italicMarkers, '$1');
    changes.push('removed italic markers');
  }
  
  // Remove underline markers but keep the text
  if (cleaned.match(CLEANING_PATTERNS.underlineMarkers)) {
    cleaned = cleaned.replace(CLEANING_PATTERNS.underlineMarkers, '$1');
    changes.push('removed underline markers');
  }
  
  // Remove inline code markers but keep the text
  if (cleaned.match(CLEANING_PATTERNS.codeInline)) {
    cleaned = cleaned.replace(CLEANING_PATTERNS.codeInline, '$1');
    changes.push('removed inline code markers');
  }
  
  // Remove brackets but keep the content
  if (cleaned.match(CLEANING_PATTERNS.brackets)) {
    cleaned = cleaned.replace(CLEANING_PATTERNS.brackets, '$1');
    changes.push('removed brackets');
  }
  
  // Remove parentheses but keep the content
  if (cleaned.match(CLEANING_PATTERNS.parentheses)) {
    cleaned = cleaned.replace(CLEANING_PATTERNS.parentheses, '$1');
    changes.push('removed parentheses');
  }
  
  // Remove multiple punctuation
  if (cleaned.match(CLEANING_PATTERNS.multiplePunctuation)) {
    cleaned = cleaned.replace(CLEANING_PATTERNS.multiplePunctuation, '.');
    changes.push('fixed multiple punctuation');
  }
  
  // Remove multiple commas
  if (cleaned.match(CLEANING_PATTERNS.multipleCommas)) {
    cleaned = cleaned.replace(CLEANING_PATTERNS.multipleCommas, ',');
    changes.push('fixed multiple commas');
  }
  
  // Clean up whitespace
  if (cleaned.match(CLEANING_PATTERNS.multipleSpaces)) {
    cleaned = cleaned.replace(CLEANING_PATTERNS.multipleSpaces, ' ');
    changes.push('fixed multiple spaces');
  }
  
  if (cleaned.match(CLEANING_PATTERNS.multipleNewlines)) {
    cleaned = cleaned.replace(CLEANING_PATTERNS.multipleNewlines, '\n\n');
    changes.push('fixed multiple newlines');
  }
  
  // Remove leading/trailing whitespace from each line
  if (cleaned.match(CLEANING_PATTERNS.leadingTrailingWhitespace)) {
    cleaned = cleaned.replace(CLEANING_PATTERNS.leadingTrailingWhitespace, '');
    changes.push('removed leading/trailing whitespace');
  }
  
  // Final trim
  cleaned = cleaned.trim();
  
  return {
    content: cleaned,
    changes: changes,
    wasModified: changes.length > 0
  };
}

// Smart paragraph formatting
function formatParagraphsSmart(content) {
  if (!content || typeof content !== 'string') {
    return {
      content: content,
      changes: [],
      wasModified: false
    };
  }
  
  let formatted = content;
  let changes = [];
  
  // Split into paragraphs
  const paragraphs = formatted.split(/\n\s*\n/);
  
  // Clean each paragraph
  const cleanedParagraphs = paragraphs.map(paragraph => {
    const cleaned = paragraph.trim();
    return cleaned;
  }).filter(paragraph => paragraph.length > 0);
  
  // Join paragraphs with proper spacing
  formatted = cleanedParagraphs.join('\n\n');
  
  if (formatted !== content) {
    changes.push('formatted paragraphs');
  }
  
  return {
    content: formatted,
    changes: changes,
    wasModified: changes.length > 0
  };
}

// Smart content validation
function validateContentSmart(content) {
  if (!content || typeof content !== 'string') {
    return { isValid: false, issues: ['Content is empty or invalid'] };
  }
  
  const issues = [];
  
  // Check for minimum length
  if (content.length < 10) {
    issues.push('Content too short');
  }
  
  // Check for maximum length (reasonable limit)
  if (content.length > 50000) {
    issues.push('Content too long');
  }
  
  // Check for common artifacts
  if (content.includes('<html>')) {
    issues.push('Contains HTML tags');
  }
  
  if (content.includes("''")) {
    issues.push('Contains empty quotes');
  }
  
  if (content.includes('```')) {
    issues.push('Contains code blocks');
  }
  
  // Check for excessive whitespace
  if (content.match(/\s{5,}/)) {
    issues.push('Contains excessive whitespace');
  }
  
  // Check for excessive newlines
  if (content.match(/\n{5,}/)) {
    issues.push('Contains excessive newlines');
  }
  
  return {
    isValid: issues.length === 0,
    issues: issues
  };
}

async function fixContentFormattingSmart() {
  logger.info('🔧 Starting smart content formatting fix...\n');
  
  try {
    // Connect to database
    await connectDB();
    logger.info('✅ Connected to database\n');
    
    // Find articles with potential formatting issues
    const articlesToFix = await News.find({
      status: { $in: ['draft', 'published'] },
      $or: [
        // Articles with HTML tags
        { 'content.en': { $regex: /<[^>]*>/ } },
        { 'content.kh': { $regex: /<[^>]*>/ } },
        // Articles with empty quotes
        { 'content.en': { $regex: /''\s*$/ } },
        { 'content.kh': { $regex: /''\s*$/ } },
        // Articles with code blocks
        { 'content.en': { $regex: /```/ } },
        { 'content.kh': { $regex: /```/ } },
        // Articles with markdown
        { 'content.en': { $regex: /^#{1,6}\s+/m } },
        { 'content.kh': { $regex: /^#{1,6}\s+/m } },
        // Articles with excessive whitespace
        { 'content.en': { $regex: /\s{5,}/ } },
        { 'content.kh': { $regex: /\s{5,}/ } }
      ]
    }).sort({ createdAt: -1 });
    
    logger.info(`📊 Found ${articlesToFix.length} articles with potential formatting issues\n`);
    
    if (articlesToFix.length === 0) {
      logger.info('🎉 No articles with formatting issues found!');
      return;
    }
    
    let successCount = 0;
    let errorCount = 0;
    let skippedCount = 0;
    let totalChanges = 0;
    
    for (const article of articlesToFix) {
      try {
        logger.info(`\n🔄 Processing: ${article.title?.en || 'No title'}`);
        logger.info(`   Status: ${article.status}`);
        
        let needsUpdate = false;
        const updates = {};
        let articleChanges = [];
        
        // Fix English content
        if (article.content?.en) {
          const originalEn = article.content.en;
          
          // Clean content
          const cleanedEn = cleanContentSmart(originalEn);
          
          // Format paragraphs
          const formattedEn = formatParagraphsSmart(cleanedEn.content);
          
          // Validate content
          const validationEn = validateContentSmart(formattedEn.content);
          
          if (cleanedEn.wasModified || formattedEn.wasModified) {
            updates['content.en'] = formattedEn.content;
            needsUpdate = true;
            
            const allChanges = [...cleanedEn.changes, ...formattedEn.changes];
            articleChanges.push(`English: ${allChanges.join(', ')}`);
            
            if (validationEn.issues.length > 0) {
              logger.info(`   ⚠️  English content issues: ${validationEn.issues.join(', ')}`);
            }
          }
        }
        
        // Fix Khmer content
        if (article.content?.kh) {
          const originalKh = article.content.kh;
          
          // Clean content
          const cleanedKh = cleanContentSmart(originalKh);
          
          // Format paragraphs
          const formattedKh = formatParagraphsSmart(cleanedKh.content);
          
          // Validate content
          const validationKh = validateContentSmart(formattedKh.content);
          
          if (cleanedKh.wasModified || formattedKh.wasModified) {
            updates['content.kh'] = formattedKh.content;
            needsUpdate = true;
            
            const allChanges = [...cleanedKh.changes, ...formattedKh.changes];
            articleChanges.push(`Khmer: ${allChanges.join(', ')}`);
            
            if (validationKh.issues.length > 0) {
              logger.info(`   ⚠️  Khmer content issues: ${validationKh.issues.join(', ')}`);
            }
          }
        }
        
        // Apply updates if needed
        if (needsUpdate) {
          await News.findByIdAndUpdate(article._id, {
            $set: updates
          });
          logger.info(`   ✅ Content cleaned: ${articleChanges.join('; ')}`);
          successCount++;
          totalChanges += articleChanges.length;
        } else {
          logger.info(`   ✅ Content already properly formatted`);
          skippedCount++;
        }
        
        // Add a small delay between articles
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        logger.error(`   💥 Error processing article: ${error.message}`);
        errorCount++;
      }
    }
    
    logger.info(`\n📈 Smart Content Formatting Fix Summary:`);
    logger.info(`  ✅ Successfully fixed: ${successCount}`);
    logger.info(`  ⏭️  Skipped (already good): ${skippedCount}`);
    logger.info(`  ❌ Errors: ${errorCount}`);
    logger.info(`  📊 Total articles processed: ${articlesToFix.length}`);
    logger.info(`  🔧 Total formatting changes: ${totalChanges}`);
    
  } catch (error) {
    logger.error('💥 Script failed:', error);
  } finally {
    process.exit(0);
  }
}

fixContentFormattingSmart();
