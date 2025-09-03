/**
 * Content Cleaner Utility
 * Removes unwanted HTML tags and structures from content
 */

import logger from './logger.mjs';

/**
 * Clean content by removing unwanted HTML tags and structures
 * @param {string} content - Raw content that may contain HTML
 * @returns {string} - Cleaned content
 */
export function cleanContent(content) {
  if (!content || typeof content !== 'string') {
    return '';
  }

  let cleaned = content;
  let changes = [];

  // Remove HTML document structure
  if (cleaned.includes('<html>')) {
    cleaned = cleaned.replace(/<html[^>]*>/gi, '');
    changes.push('removed <html> tag');
  }
  
  if (cleaned.includes('<head>')) {
    cleaned = cleaned.replace(/<head[^>]*>[\s\S]*?<\/head>/gi, '');
    changes.push('removed <head> section');
  }
  
  if (cleaned.includes('<body>')) {
    cleaned = cleaned.replace(/<body[^>]*>/gi, '');
    changes.push('removed <body> tag');
  }
  
  if (cleaned.includes('</body>')) {
    cleaned = cleaned.replace(/<\/body>/gi, '');
    changes.push('removed </body> tag');
  }
  
  if (cleaned.includes('</html>')) {
    cleaned = cleaned.replace(/<\/html>/gi, '');
    changes.push('removed </html> tag');
  }

  // Remove specific problematic text patterns that appear in content
  cleaned = cleaned.replace(/Former U\. S\. Background\s*/gi, '');
  if (cleaned !== content) { changes.push('removed "Former U.S. Background" text'); }
  
  // Remove "Background" text in HTML tags (like <h2>Background</h2>)
  cleaned = cleaned.replace(/<[^>]*>Background\s*<\/[^>]*>/gi, '');
  if (cleaned !== content) { changes.push('removed "Background" text in HTML tags'); }
  
  // Also remove standalone "Background" text that might be left over
  cleaned = cleaned.replace(/\bBackground\b\s*/gi, '');
  if (cleaned !== content) { changes.push('removed standalone "Background" text'); }
  
  // Remove "Background" at the beginning of content
  cleaned = cleaned.replace(/^Background\s*/gi, '');
  if (cleaned !== content) { changes.push('removed "Background" text from beginning'); }
  
  // Remove Khmer "Background" text (ផ្ទៃខាងក្រោយ)
  cleaned = cleaned.replace(/ផ្ទៃខាងក្រោយ\s*/gi, '');
  if (cleaned !== content) { changes.push('removed Khmer "Background" text'); }
  
  // Remove triple quotes at the end
  cleaned = cleaned.replace(/'''\s*$/g, '');
  if (cleaned !== content) { changes.push('removed triple quotes at end'); }
  
  // Remove double triple quotes
  cleaned = cleaned.replace(/"""/g, '');
  if (cleaned !== content) { changes.push('removed double triple quotes'); }

  // Remove markdown code blocks
  cleaned = cleaned.replace(/```html\s*/gi, '');
  cleaned = cleaned.replace(/```\s*$/gi, '');
  cleaned = cleaned.replace(/^```\s*/gi, '');

  // Remove script and style tags
  cleaned = cleaned.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  cleaned = cleaned.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');

  // Remove meta tags
  cleaned = cleaned.replace(/<meta[^>]*>/gi, '');

  // Remove title tags (but keep the text)
  cleaned = cleaned.replace(/<title[^>]*>([\s\S]*?)<\/title>/gi, '$1');

  // Remove HTML tags but keep the content
  cleaned = cleaned.replace(/<[^>]*>/g, '');

  // Remove malformed markdown/HTML combinations
  cleaned = cleaned.replace(/\*\*[^<]*dark:[^<]*>/g, '');
  if (cleaned !== content) { changes.push('removed malformed markdown/HTML combinations'); }

  // Remove CSS class references
  cleaned = cleaned.replace(/class="[^"]*"/g, '');
  if (cleaned !== content) { changes.push('removed CSS class references'); }

  // Remove CSS style references
  cleaned = cleaned.replace(/style="[^"]*"/g, '');
  if (cleaned !== content) { changes.push('removed CSS style references'); }

  // Remove empty quotes at the end
  cleaned = cleaned.replace(/''\s*$/, '');
  if (cleaned !== content && !cleaned.includes("''")) {
    changes.push('removed empty quotes');
  }

  // Remove double quotes at the end
  cleaned = cleaned.replace(/"\s*$/, '');
  
  // Remove single quotes at the end
  cleaned = cleaned.replace(/'\s*$/, '');

  // Clean up extra whitespace
  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  // Remove any remaining unwanted HTML attributes
  cleaned = cleaned.replace(/\s+class="[^"]*"/gi, '');
  cleaned = cleaned.replace(/\s+id="[^"]*"/gi, '');
  cleaned = cleaned.replace(/\s+style="[^"]*"/gi, '');

  if (changes.length > 0) {
    logger.info(`Content cleaned: ${changes.join(', ')}`);
  }

  return cleaned;
}

/**
 * Clean content for both English and Khmer
 * @param {object} contentObj - Content object with en and kh properties
 * @returns {object} - Cleaned content object
 */
export function cleanContentObject(contentObj) {
  if (!contentObj || typeof contentObj !== 'object') {
    return contentObj;
  }

  const cleaned = {};
  
  if (contentObj.en) {
    cleaned.en = cleanContent(contentObj.en);
  }
  
  if (contentObj.kh) {
    cleaned.kh = cleanContent(contentObj.kh);
  }

  return cleaned;
}

/**
 * Check if content needs cleaning
 * @param {string} content - Content to check
 * @returns {boolean} - True if content needs cleaning
 */
export function needsCleaning(content) {
  if (!content || typeof content !== 'string') {
    return false;
  }

  const cleaningPatterns = [
    /<html[^>]*>/i,
    /<head[^>]*>/i,
    /<body[^>]*>/i,
    /<\/body>/i,
    /<\/html>/i,
    /<script[^>]*>/i,
    /<style[^>]*>/i,
    /<meta[^>]*>/i,
    /<[^>]*>/i,  // Any HTML tag
    /```html/i,  // Markdown code blocks
    /```\s*$/i,  // End of code blocks
    /''\s*$/,
    /"\s*$/,
    /'\s*$/,
    /\*\*[^<]*dark:[^<]*>/i,  // Malformed markdown/HTML combinations
    /class="[^"]*"/i,  // CSS class references
    /style="[^"]*"/i   // CSS style references
  ];

  return cleaningPatterns.some(pattern => pattern.test(content));
}

export default {
  cleanContent,
  cleanContentObject,
  needsCleaning
};
