/**
 * Content Formatter Utility for Backend
 * Formats plain text content into well-structured HTML for better readability
 */

/**
 * Format article content with proper HTML structure
 * @param {string} content - Raw content text
 * @returns {string} - Formatted HTML content
 */
export function formatArticleContent(content) {
  if (!content || typeof content !== 'string') {
    return '';
  }

  // Remove any existing HTML tags to start fresh
  const cleanContent = content.replace(/<[^>]*>/g, '').trim();
  
  if (!cleanContent) {
    return '';
  }

  // Split content into paragraphs
  const paragraphs = cleanContent.split(/\n\s*\n/).filter(p => p.trim());
  
  if (paragraphs.length === 0) {
    return `<p>${cleanContent}</p>`;
  }

  let formattedContent = '';
  let currentSection = '';

  paragraphs.forEach((paragraph, index) => {
    const trimmedParagraph = paragraph.trim();
    
    if (!trimmedParagraph) return;

    // Check if this paragraph should be a heading
    if (isHeading(trimmedParagraph, index)) {
      // If we have a current section, close it
      if (currentSection) {
        formattedContent += currentSection;
        currentSection = '';
      }
      
      // Start new section with heading
      const headingText = trimmedParagraph.replace(/^[#\s]+/, '').trim();
      formattedContent += `<h2>${headingText}</h2>`;
      currentSection = '';
    }
    // Check if this is a quote
    else if (isQuote(trimmedParagraph)) {
      if (currentSection) {
        formattedContent += currentSection;
        currentSection = '';
      }
      const quoteText = trimmedParagraph.replace(/^["'`]|["'`]$/g, '').trim();
      formattedContent += `<blockquote>${quoteText}</blockquote>`;
    }
    // Check if this is a list
    else if (isList(trimmedParagraph)) {
      if (currentSection) {
        formattedContent += currentSection;
        currentSection = '';
      }
      formattedContent += formatList(trimmedParagraph);
    }
    // Regular paragraph
    else {
      const enhancedParagraph = enhanceParagraphText(trimmedParagraph);
      currentSection += `<p>${enhancedParagraph}</p>`;
    }
  });

  // Add any remaining content
  if (currentSection) {
    formattedContent += currentSection;
  }

  // If no headings were found, add some structure
  if (!formattedContent.includes('<h2>')) {
    formattedContent = addDefaultStructure(formattedContent);
  }

  return formattedContent;
}

/**
 * Check if a paragraph should be a heading
 */
function isHeading(text, index) {
  // First paragraph is often a good candidate for a heading
  if (index === 0 && text.length < 100 && !text.includes('.')) {
    return true;
  }
  
  // Check for common heading patterns
  const headingPatterns = [
    /^(background|context|overview|introduction|summary)/i,
    /^(current|present|latest|recent|ongoing)/i,
    /^(impact|effect|consequence|result|outcome)/i,
    /^(future|next|upcoming|planned|expected)/i,
    /^(analysis|examination|investigation|study)/i,
    /^(response|reaction|comment|statement)/i,
    /^(conclusion|summary|final|ending)/i
  ];

  return headingPatterns.some(pattern => pattern.test(text.toLowerCase()));
}

/**
 * Check if text is a quote
 */
function isQuote(text) {
  return text.startsWith('"') || text.startsWith("'") || text.startsWith('`') ||
         text.endsWith('"') || text.endsWith("'") || text.endsWith('`') ||
         text.includes(' said ') || text.includes(' stated ') || text.includes(' according to ');
}

/**
 * Check if text is a list
 */
function isList(text) {
  return /^[\s]*[-*•]\s/.test(text) || /^[\s]*\d+\.\s/.test(text);
}

/**
 * Format list text
 */
function formatList(text) {
  const items = text.split(/\n/).filter(item => item.trim());
  if (items.length === 1) {
    // Single item, just format as paragraph with bullet
    const itemText = items[0].replace(/^[\s]*[-*•]\s/, '').trim();
    return `<p><strong>• ${itemText}</strong></p>`;
  } else {
    // Multiple items, format as proper list
    const listItems = items.map(item => {
      const itemText = item.replace(/^[\s]*[-*•]\s/, '').trim();
      return `<li>${itemText}</li>`;
    }).join('');
    return `<ul>${listItems}</ul>`;
  }
}

/**
 * Enhance paragraph text with emphasis
 */
function enhanceParagraphText(text) {
  // Add emphasis to key terms
  let enhanced = text;
  
  // Emphasize important terms
  const importantTerms = [
    /(\b(?:Cambodia|Thailand|ASEAN|UN|government|official|minister|president|prime minister)\b)/gi,
    /(\b(?:announced|confirmed|reported|stated|revealed|declared)\b)/gi,
    /(\b(?:important|significant|major|key|critical|essential)\b)/gi
  ];
  
  importantTerms.forEach(pattern => {
    enhanced = enhanced.replace(pattern, '<strong>$1</strong>');
  });
  
  // Add subtle emphasis to descriptive terms
  const descriptiveTerms = [
    /(\b(?:according to|based on|in response to|following)\b)/gi,
    /(\b(?:however|nevertheless|meanwhile|furthermore|additionally)\b)/gi
  ];
  
  descriptiveTerms.forEach(pattern => {
    enhanced = enhanced.replace(pattern, '<em>$1</em>');
  });
  
  return enhanced;
}

/**
 * Add default structure if no headings were found
 */
function addDefaultStructure(content) {
  const paragraphs = content.split('</p><p>');
  
  if (paragraphs.length <= 2) {
    return content;
  }
  
  // Add headings to break up content
  let structuredContent = '';
  let headingIndex = 0;
  const headings = ['Background', 'Current Situation', 'Implications'];
  
  paragraphs.forEach((paragraph, index) => {
    if (index === 0) {
      // First paragraph
      structuredContent += `<h2>${headings[headingIndex] || 'Overview'}</h2>`;
      structuredContent += `<p>${paragraph.replace(/^<p>|<\/p>$/g, '')}</p>`;
      headingIndex++;
    } else if (index === Math.floor(paragraphs.length / 2)) {
      // Middle paragraph - add heading
      structuredContent += `<h2>${headings[headingIndex] || 'Details'}</h2>`;
      structuredContent += `<p>${paragraph.replace(/^<p>|<\/p>$/g, '')}</p>`;
      headingIndex++;
    } else {
      // Other paragraphs
      structuredContent += `<p>${paragraph.replace(/^<p>|<\/p>$/g, '')}</p>`;
    }
  });
  
  return structuredContent;
}

/**
 * Extract content information for SEO and summaries
 */
export function extractContentInfo(content) {
  if (!content) {
    return {
      summary: '',
      keyPoints: [],
      wordCount: 0
    };
  }

  const cleanContent = content.replace(/<[^>]*>/g, '');
  const words = cleanContent.split(/\s+/).filter(word => word.length > 0);
  const wordCount = words.length;

  // Generate summary (first 2-3 sentences)
  const sentences = cleanContent.split(/[.!?]+/).filter(s => s.trim().length > 10);
  const summary = sentences.slice(0, 3).join('. ').trim();

  // Extract key points (important sentences)
  const keyPoints = sentences
    .filter(sentence => 
      sentence.length > 20 && 
      sentence.length < 150 &&
      (sentence.includes('Cambodia') || 
       sentence.includes('announced') || 
       sentence.includes('confirmed') ||
       sentence.includes('important'))
    )
    .slice(0, 5)
    .map(point => point.trim());

  return {
    summary,
    keyPoints,
    wordCount
  };
}

/**
 * Calculate estimated read time
 */
export function calculateReadTime(content) {
  if (!content) return 0;
  
  const cleanContent = content.replace(/<[^>]*>/g, '');
  const words = cleanContent.split(/\s+/).filter(word => word.length > 0);
  const wordCount = words.length;
  
  // Average reading speed: 200-250 words per minute
  const wordsPerMinute = 225;
  const readTimeMinutes = Math.ceil(wordCount / wordsPerMinute);
  
  return Math.max(1, readTimeMinutes); // Minimum 1 minute
}
