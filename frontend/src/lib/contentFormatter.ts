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

  // If content already has HTML tags, clean and enhance them
  if (formattedContent.includes('<')) {
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
 * Convert plain text to well-structured HTML
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

  // Process each paragraph
  const formattedParagraphs = paragraphs.map((paragraph, index) => {
    // Check if this looks like a heading (short, ends with colon, or is the first paragraph)
    if (isHeading(paragraph, index)) {
      return `<h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4 mt-8 first:mt-0">${paragraph}</h2>`;
    }

    // Check if this looks like a quote
    if (isQuote(paragraph)) {
      return `<blockquote class="border-l-4 border-blue-500 pl-6 py-4 my-6 bg-blue-50 dark:bg-blue-900/20 italic text-gray-700 dark:text-gray-300">${paragraph}</blockquote>`;
    }

    // Check if this looks like a list
    if (isList(paragraph)) {
      return formatList(paragraph);
    }

    // Regular paragraph with enhanced formatting
    return `<p class="text-gray-700 dark:text-gray-300 leading-relaxed mb-6 text-lg">${enhanceParagraphText(paragraph)}</p>`;
  });

  // Add section breaks and visual elements
  return addVisualElements(formattedParagraphs.join('\n'));
}

/**
 * Enhance existing HTML content
 */
function enhanceExistingHTML(html: string): string {
  // Clean up existing HTML
  let enhanced = html
    .replace(/<p>\s*<\/p>/g, '') // Remove empty paragraphs
    .replace(/<p>/g, '<p class="text-gray-700 dark:text-gray-300 leading-relaxed mb-6 text-lg">')
    .replace(/<h1>/g, '<h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-6 mt-8 first:mt-0">')
    .replace(/<h2>/g, '<h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4 mt-8 first:mt-0">')
    .replace(/<h3>/g, '<h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3 mt-6 first:mt-0">')
    .replace(/<strong>/g, '<strong class="font-semibold text-gray-900 dark:text-white">')
    .replace(/<em>/g, '<em class="italic text-gray-600 dark:text-gray-400">');

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
 * Enhance paragraph text with better formatting
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
  
  // Find important terms
  const importantMatches = enhanced.match(/\b(breaking|urgent|important|latest|update|confirmed|announced)\b/gi);
  if (importantMatches) {
    importantMatches.forEach(match => {
      patterns.push({
        text: match,
        replacement: `<strong class="font-semibold text-gray-900 dark:text-white">${match}</strong>`,
        index: enhanced.indexOf(match)
      });
    });
  }
  
  // Find numbers
  const numberMatches = enhanced.match(/(\d+(?:\.\d+)?%?)/g);
  if (numberMatches) {
    numberMatches.forEach(match => {
      patterns.push({
        text: match,
        replacement: `<span class="font-semibold text-blue-600 dark:text-blue-400">${match}</span>`,
        index: enhanced.indexOf(match)
      });
    });
  }
  
  // Find dates
  const dateMatches = enhanced.match(/(\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{2}-\d{2})/g);
  if (dateMatches) {
    dateMatches.forEach(match => {
      patterns.push({
        text: match,
        replacement: `<time class="font-medium text-gray-600 dark:text-gray-400">${match}</time>`,
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
 * Add visual elements to improve readability
 */
function addVisualElements(html: string): string {
  // Add section breaks every few paragraphs
  const paragraphs = html.split('</p>');
  const enhancedParagraphs = paragraphs.map((p, index) => {
    // Add section break every 4-5 paragraphs
    if (index > 0 && index % 4 === 0 && index < paragraphs.length - 1) {
      return p + '</p><hr class="my-8 border-gray-200 dark:border-gray-700" />';
    }
    return p + '</p>';
  });

  return enhancedParagraphs.join('');
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
