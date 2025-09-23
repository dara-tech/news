/**
 * Content Formatter for Improved Readability
 * Transforms plain text content into well-structured HTML with proper formatting
 */

export interface FormattedContent {
  html: string;
  readTime: number;
  wordCount: number;
  hasImages: boolean;
  hasQuotes: boolean;
}

interface Pattern {
  text: string;
  replacement: string;
  index: number;
}

/**
 * Format article content for better readability
 */
export function formatArticleContent(content: string): FormattedContent {
  if (!content) {
    return {
      html: '<p class="text-gray-500 italic">No content available.</p>',
      readTime: 1,
      wordCount: 0,
      hasImages: false,
      hasQuotes: false
    };
  }

  // Clean the content first
  let formattedContent = content.trim();

  // Check if content already has HTML tags
  if (formattedContent.includes('<') && formattedContent.match(/<[^>]+>/)) {
    // Content has HTML tags, enhance them
    formattedContent = enhanceExistingHTML(formattedContent);
  } else {
    // Convert plain text to structured HTML
    formattedContent = convertPlainTextToHTML(formattedContent);
  }

  // Calculate metrics
  const wordCount = countWords(formattedContent);
  const readTime = Math.max(1, Math.ceil(wordCount / 200)); // 200 words per minute
  const hasImages = formattedContent.includes('<img');
  const hasQuotes = formattedContent.includes('<blockquote');

  return {
    html: formattedContent,
    readTime,
    wordCount,
    hasImages,
    hasQuotes
  };
}

/**
 * Convert plain text to well-structured HTML with expert-level formatting
 */
function convertPlainTextToHTML(text: string): string {
  // Split into paragraphs
  let paragraphs = text
    .split(/\n\s*\n/) // Split on double line breaks
    .map(p => p.trim())
    .filter(p => p.length > 0);

  // If we only have one long paragraph, try to split it intelligently
  if (paragraphs.length === 1 && paragraphs[0].length > 500) {
    const longText = paragraphs[0];
    
    // Try to split on sentence boundaries
    const sentences = longText.split(/(?<=[.!?])\s+/);
    const newParagraphs = [];
    let currentParagraph = '';
    
    for (const sentence of sentences) {
      // If adding this sentence would make the paragraph too long, start a new one
      if (currentParagraph.length + sentence.length > 400 && currentParagraph.length > 0) {
        newParagraphs.push(currentParagraph.trim());
        currentParagraph = sentence;
      } else {
        currentParagraph += (currentParagraph ? ' ' : '') + sentence;
      }
    }
    
    // Add the last paragraph
    if (currentParagraph.trim()) {
      newParagraphs.push(currentParagraph.trim());
    }
    
    paragraphs = newParagraphs;
  }

  if (paragraphs.length === 0) {
    return '<p class="text-gray-500 italic">No content available.</p>';
  }

  // Process each paragraph with expert-level formatting
  const formattedParagraphs = paragraphs.map((paragraph, index) => {
    // Check if this looks like a heading (short, ends with colon, or is the first paragraph)
    if (isHeading(paragraph, index)) {
      return `<h2 class="text-3xl font-bold mb-6 mt-12 first:mt-0 leading-tight tracking-tight bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">${paragraph}</h2>`;
    }

    // Check if this looks like a quote
    if (isQuote(paragraph)) {
      return `<blockquote class="border-l-4 border-blue-600 pl-8 py-6 my-8 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20 italic text-gray-800 dark:text-gray-200 text-lg leading-relaxed rounded-r-lg shadow-sm">${paragraph}</blockquote>`;
    }

    // Check if this looks like a list
    if (isList(paragraph)) {
      return formatList(paragraph);
    }

    // Check if this is the lead paragraph (first substantial paragraph)
    if (index === 0 && paragraph.length > 100) {
      return `<p class="text-xl text-gray-800 dark:text-gray-200 leading-relaxed mb-8 font-medium tracking-wide">${enhanceParagraphText(paragraph)}</p>`;
    }

    // Regular paragraph with enhanced formatting
    return `<p class="text-gray-700 dark:text-gray-300 leading-relaxed mb-6 text-lg">${enhanceParagraphText(paragraph)}</p>`;
  });

  // Add section breaks and visual elements
  return addVisualElements(formattedParagraphs.join('\n'));
}

/**
 * Enhance existing HTML content with expert-level styling
 */
function enhanceExistingHTML(html: string): string {
  // Clean up existing HTML and apply expert styling
  let enhanced = html
    .replace(/<p>\s*<\/p>/g, '') // Remove empty paragraphs
    .replace(/<p>/g, '<p class="text-gray-700 dark:text-gray-300 leading-relaxed mb-6 text-lg">')
    .replace(/<h1>/g, '<h1 class="text-4xl font-bold mb-8 mt-12 first:mt-0 leading-tight tracking-tight bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">')
    .replace(/<h2>/g, '<h2 class="text-3xl font-bold mb-6 mt-12 first:mt-0 leading-tight tracking-tight bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">')
    .replace(/<h3>/g, '<h3 class="text-2xl font-bold mb-4 mt-8 first:mt-0 leading-tight text-gray-800 dark:text-gray-200">')
    .replace(/<strong>/g, '<strong class="font-bold text-gray-900 dark:text-white bg-yellow-100 dark:bg-yellow-900/30 px-1 rounded">')
    .replace(/<em>/g, '<em class="italic text-gray-600 dark:text-gray-400 font-medium">')
    .replace(/<blockquote>/g, '<blockquote class="border-l-4 border-blue-600 pl-8 py-6 my-8 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20 italic text-gray-800 dark:text-gray-200 text-lg leading-relaxed rounded-r-lg shadow-sm">')
    .replace(/<ul>/g, '<ul class="list-disc list-inside space-y-2 mb-6 text-lg text-gray-700 dark:text-gray-300">')
    .replace(/<ol>/g, '<ol class="list-decimal list-inside space-y-2 mb-6 text-lg text-gray-700 dark:text-gray-300">')
    .replace(/<li>/g, '<li class="text-gray-700 dark:text-gray-300 mb-2">');

  // Add visual elements
  enhanced = addVisualElements(enhanced);

  return enhanced;
}

/**
 * Check if a paragraph looks like a heading
 */
function isHeading(text: string, index: number): boolean {
  const trimmed = text.trim();
  
  // First paragraph is often a heading if it's short
  if (index === 0 && trimmed.length < 150) return true;
  
  // Short text that ends with colon
  if (trimmed.length < 100 && trimmed.endsWith(':')) return true;
  
  // Text that looks like a title (all caps, short)
  if (trimmed.length < 80 && trimmed === trimmed.toUpperCase()) return true;
  
  // Text that starts with common heading words
  const headingWords = ['breaking', 'update', 'latest', 'news', 'report', 'analysis', 'summary', 'background', 'overview', 'introduction'];
  const lowerText = trimmed.toLowerCase();
  return headingWords.some(word => lowerText.startsWith(word));
}

/**
 * Check if a paragraph looks like a quote
 */
function isQuote(text: string): boolean {
  const trimmed = text.trim();
  
  // Starts with quote marks
  if (trimmed.startsWith('"') || trimmed.startsWith('"') || trimmed.startsWith('"')) return true;
  
  // Contains attribution words
  const attributionWords = ['said', 'stated', 'announced', 'confirmed', 'reported', 'according to'];
  const lowerText = trimmed.toLowerCase();
  return attributionWords.some(word => lowerText.includes(word));
}

/**
 * Check if a paragraph looks like a list
 */
function isList(text: string): boolean {
  const lines = text.split('\n');
  if (lines.length < 2) return false;
  
  // Check if most lines start with numbers, bullets, or dashes
  const listPatterns = /^(\d+\.|\*|\-|\•)\s/;
  const listLines = lines.filter(line => listPatterns.test(line.trim()));
  
  return listLines.length >= lines.length * 0.7; // 70% of lines look like list items
}

/**
 * Format a list paragraph
 */
function formatList(text: string): string {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  const listItems = lines.map(line => {
    // Remove list markers and clean up
    const cleaned = line.replace(/^(\d+\.|\*|\-|\•)\s*/, '').trim();
    return `<li class="text-gray-700 dark:text-gray-300 mb-2">${cleaned}</li>`;
  });

  return `<ul class="list-disc list-inside space-y-2 mb-6 text-lg">${listItems.join('')}</ul>`;
}

/**
 * Enhance paragraph text with expert-level formatting
 */
function enhanceParagraphText(text: string): string {
  let enhanced = text;

  // Clean any existing malformed HTML first
  enhanced = enhanced.replace(/<[^>]*$/g, ''); // Remove incomplete HTML tags at the end
  enhanced = enhanced.replace(/^[^<]*>/g, ''); // Remove incomplete HTML tags at the beginning
  enhanced = enhanced.replace(/\*\*[^<]*dark:[^<]*>/g, ''); // Remove malformed markdown/HTML combinations

  // Skip enhancement if text already contains properly formed HTML tags
  if (enhanced.includes('<') && enhanced.includes('>') && enhanced.match(/<[^>]+>/)) {
    return enhanced;
  }

  // Use a more careful approach to avoid nested HTML issues
  // First, identify all the patterns we want to highlight
  const patterns: Pattern[] = [];
  
  // Find important terms with more comprehensive matching
  const importantMatches = enhanced.match(/\b(breaking|urgent|important|latest|update|confirmed|announced|exclusive|report|analysis|investigation|developing|emerging|critical|significant|major|unprecedented|historic|landmark)\b/gi);
  if (importantMatches) {
    importantMatches.forEach(match => {
      patterns.push({
        text: match,
        replacement: `<strong class="font-bold text-gray-900 dark:text-white bg-yellow-100 dark:bg-yellow-900/30 px-1 rounded">${match}</strong>`,
        index: enhanced.indexOf(match)
      });
    });
  }
  
  // Find numbers and statistics with enhanced styling
  const numberMatches = enhanced.match(/(\d+(?:\.\d+)?%?|billion|million|thousand|hundred)/gi);
  if (numberMatches) {
    numberMatches.forEach(match => {
      patterns.push({
        text: match,
        replacement: `<span class="font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 px-1.5 py-0.5 rounded-md">${match}</span>`,
        index: enhanced.indexOf(match)
      });
    });
  }
  
  // Find dates with enhanced styling
  const dateMatches = enhanced.match(/(\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{2}-\d{2}|today|yesterday|tomorrow|this week|last week|next week|this month|last month|next month|this year|last year|next year)/gi);
  if (dateMatches) {
    dateMatches.forEach(match => {
      patterns.push({
        text: match,
        replacement: `<time class="font-semibold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded-md">${match}</time>`,
        index: enhanced.indexOf(match)
      });
    });
  }

  // Find names and organizations
  const nameMatches = enhanced.match(/\b(Dr\.|Professor|Mr\.|Ms\.|Mrs\.|President|Prime Minister|Minister|CEO|Director|Spokesperson|Official|Expert|Analyst|Researcher|Author|Reporter|Journalist)\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*/g);
  if (nameMatches) {
    nameMatches.forEach(match => {
      patterns.push({
        text: match,
        replacement: `<span class="font-semibold text-gray-800 dark:text-gray-200 italic">${match}</span>`,
        index: enhanced.indexOf(match)
      });
    });
  }

  // Find locations and places
  const locationMatches = enhanced.match(/\b(United States|USA|US|United Kingdom|UK|China|Japan|Germany|France|Italy|Spain|Canada|Australia|India|Brazil|Russia|Cambodia|Phnom Penh|Siem Reap|Battambang|Kampong Cham|Kampong Thom|Kampot|Kep|Koh Kong|Mondulkiri|Ratanakiri|Stung Treng|Preah Vihear|Oddar Meanchey|Banteay Meanchey|Pailin|Pursat|Kampong Speu|Takeo|Kandal|Prey Veng|Svay Rieng|Tboung Khmum|Kampong Chhnang|Kampong Thom|Kratie|Mondulkiri|Ratanakiri|Stung Treng|Preah Vihear|Oddar Meanchey|Banteay Meanchey|Pailin|Pursat|Kampong Speu|Takeo|Kandal|Prey Veng|Svay Rieng|Tboung Khmum|Kampong Chhnang)\b/gi);
  if (locationMatches) {
    locationMatches.forEach(match => {
      patterns.push({
        text: match,
        replacement: `<span class="font-medium text-green-700 dark:text-green-300">${match}</span>`,
        index: enhanced.indexOf(match)
      });
    });
  }

  // Find technical terms and acronyms
  const techMatches = enhanced.match(/\b(AI|API|GDP|GDPR|COVID-19|WHO|UN|UNESCO|UNICEF|WTO|IMF|World Bank|EU|NATO|ASEAN|WTO|IMF|World Bank|EU|NATO|ASEAN|GDP|GDPR|COVID-19|WHO|UN|UNESCO|UNICEF|WTO|IMF|World Bank|EU|NATO|ASEAN)\b/gi);
  if (techMatches) {
    techMatches.forEach(match => {
      patterns.push({
        text: match,
        replacement: `<span class="font-mono text-sm bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-purple-700 dark:text-purple-300">${match}</span>`,
        index: enhanced.indexOf(match)
      });
    });
  }
  
  // Sort patterns by index (reverse order to avoid index shifting)
  patterns.sort((a, b) => b.index - a.index);
  
  // Apply replacements from end to beginning
  patterns.forEach(pattern => {
    enhanced = enhanced.substring(0, pattern.index) + 
               pattern.replacement + 
               enhanced.substring(pattern.index + pattern.text.length);
  });

  return enhanced;
}

/**
 * Add visual elements to improve readability with expert-level styling
 */
function addVisualElements(html: string): string {
  // Add section breaks every few paragraphs with enhanced styling
  const paragraphs = html.split('</p>');
  const enhancedParagraphs = paragraphs.map((p, index) => {
    // Add section break every 4-5 paragraphs
    if (index > 0 && index % 4 === 0 && index < paragraphs.length - 1) {
      return p + '</p><div class="my-12 flex items-center justify-center"><div class="w-24 h-0.5 bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent"></div><div class="mx-4 w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full"></div><div class="w-24 h-0.5 bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent"></div></div>';
    }
    return p + '</p>';
  });

  let result = enhancedParagraphs.join('');

  // Add drop cap to first paragraph
  result = result.replace(
    /<p class="text-xl[^"]*">([A-Z])/,
    '<p class="text-xl text-gray-800 dark:text-gray-200 leading-relaxed mb-8 font-medium tracking-wide"><span class="float-left text-6xl font-bold text-gray-400 dark:text-gray-500 leading-none mr-2 mt-1">$1</span>'
  );

  // Remove any remaining hover effects
  result = result.replace(
    /<h2 class="[^"]*">/g,
    '<h2 class="text-3xl font-bold mb-6 mt-12 first:mt-0 leading-tight tracking-tight bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">'
  );

  return result;
}

/**
 * Count words in text (HTML-aware)
 */
function countWords(text: string): number {
  // Remove HTML tags for word counting
  const plainText = text.replace(/<[^>]*>/g, ' ');
  const words = plainText.trim().split(/\s+/);
  return words.filter(word => word.length > 0).length;
}

/**
 * Extract key information from content
 */
export function extractContentInfo(content: string): {
  summary: string;
  keyPoints: string[];
  hasQuotes: boolean;
  hasNumbers: boolean;
  hasDates: boolean;
} {
  const words = content.split(/\s+/);
  const summary = words.slice(0, 50).join(' ') + (words.length > 50 ? '...' : '');
  
  const keyPoints: string[] = [];
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20);
  
  // Extract sentences with key words
  const keyWords = ['announced', 'confirmed', 'said', 'reported', 'breaking', 'important', 'update'];
  keyWords.forEach(word => {
    const relevantSentence = sentences.find(s => s.toLowerCase().includes(word));
    if (relevantSentence) {
      keyPoints.push(relevantSentence.trim() + '.');
    }
  });

  return {
    summary,
    keyPoints: keyPoints.slice(0, 3), // Max 3 key points
    hasQuotes: content.includes('"') || content.includes('"'),
    hasNumbers: /\d+/.test(content),
    hasDates: /\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{2}-\d{2}/.test(content)
  };
}
