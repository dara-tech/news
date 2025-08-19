/**
 * Advanced Content Formatter for Backend
 * Provides professional content enhancement with AI-powered optimization
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

/**
 * Advanced content formatting options
 */
export const formattingOptions = {
  enableAIEnhancement: true,
  enableReadabilityOptimization: true,
  enableSEOOptimization: true,
  enableMultilingualOptimization: true,
  enableVisualEnhancement: true,
  enableContentAnalysis: true,
  preserveOriginalStructure: false,
  addSectionHeadings: true,
  enhanceQuotes: true,
  optimizeLists: true
};

/**
 * Format content with advanced options
 */
export async function formatContentAdvanced(content, options = formattingOptions) {
  try {
    let formattedContent = content;

    // Step 1: Basic HTML formatting
    if (!options.preserveOriginalStructure) {
      formattedContent = formatArticleContent(formattedContent);
    }

    // Step 2: AI Enhancement
    if (options.enableAIEnhancement) {
      formattedContent = await enhanceContentWithAI(formattedContent);
    }

    // Step 3: Readability Optimization
    if (options.enableReadabilityOptimization) {
      formattedContent = optimizeReadability(formattedContent);
    }

    // Step 4: SEO Optimization
    if (options.enableSEOOptimization) {
      formattedContent = optimizeSEO(formattedContent);
    }

    // Step 5: Visual Enhancement
    if (options.enableVisualEnhancement) {
      formattedContent = enhanceVisualElements(formattedContent);
    }

    // Step 6: Add section headings if requested
    if (options.addSectionHeadings) {
      formattedContent = addSectionHeadings(formattedContent);
    }

    // Step 7: Enhance quotes
    if (options.enhanceQuotes) {
      formattedContent = enhanceQuotes(formattedContent);
    }

    // Step 8: Optimize lists
    if (options.optimizeLists) {
      formattedContent = optimizeLists(formattedContent);
    }

    return {
      success: true,
      content: formattedContent,
      analysis: options.enableContentAnalysis ? await analyzeContent(formattedContent) : null
    };
  } catch (error) {
    console.error('Error in advanced content formatting:', error);
    return {
      success: false,
      error: error.message,
      content: content // Return original content on error
    };
  }
}

/**
 * Enhance content using AI
 */
async function enhanceContentWithAI(content) {
  try {
    const prompt = `
      Enhance the following HTML-formatted news article content to make it more professional and engaging. 
      Keep the existing HTML structure but improve the content quality, add more details, and ensure proper formatting.

      Content to enhance:
      ${content}

      Requirements:
      - Keep existing HTML tags (<h2>, <p>, <blockquote>, <ul>, <li>, <strong>, <em>)
      - Improve content quality and readability
      - Add more details and context where appropriate
      - Ensure proper journalistic style
      - Maintain the same structure but enhance the content
      - Make it more engaging for readers

      Return only the enhanced HTML content without any additional text or explanations.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error('AI enhancement failed:', error);
    return content; // Return original content if AI fails
  }
}

/**
 * Optimize content for readability
 */
function optimizeReadability(content) {
  let optimized = content;

  // Break up long paragraphs
  optimized = optimized.replace(
    /<p>([^<]{200,})<\/p>/g,
    (match, text) => {
      const sentences = text.split(/[.!?]+/).filter(s => s.trim());
      const chunks = [];
      let currentChunk = '';
      
      sentences.forEach(sentence => {
        if ((currentChunk + sentence).length > 150) {
          if (currentChunk) chunks.push(`<p>${currentChunk.trim()}</p>`);
          currentChunk = sentence;
        } else {
          currentChunk += sentence + '. ';
        }
      });
      
      if (currentChunk) chunks.push(`<p>${currentChunk.trim()}</p>`);
      return chunks.join('');
    }
  );

  // Add visual breaks
  optimized = optimized.replace(
    /<\/p>\s*<p>/g,
    '</p>\n<p>'
  );

  return optimized;
}

/**
 * Optimize content for SEO
 */
function optimizeSEO(content) {
  let optimized = content;

  // Ensure proper heading hierarchy
  if (!optimized.includes('<h1>') && !optimized.includes('<h2>')) {
    optimized = optimized.replace(
      /<p>([^<]{20,80})<\/p>/,
      '<h2>$1</h2>'
    );
  }

  // Add semantic markup
  optimized = optimized.replace(
    /<p>([^<]*\b(?:announced|confirmed|reported|stated)\b[^<]*)<\/p>/gi,
    '<p><strong>$1</strong></p>'
  );

  // Add structured data hints
  optimized = optimized.replace(
    /<p>([^<]*\b(?:date|time|location|place)\b[^<]*)<\/p>/gi,
    '<p><time>$1</time></p>'
  );

  return optimized;
}

/**
 * Enhance visual elements
 */
function enhanceVisualElements(content) {
  let enhanced = content;

  // Add section breaks
  enhanced = enhanced.replace(
    /<\/h2>\s*<p>/g,
    '</h2>\n<hr class="section-break" />\n<p>'
  );

  // Add emphasis to key numbers
  enhanced = enhanced.replace(
    /(\d+(?:\.\d+)?%?)/g,
    '<span class="highlight-number">$1</span>'
  );

  // Add emphasis to important terms
  enhanced = enhanced.replace(
    /\b(breaking|urgent|important|latest|update)\b/gi,
    '<span class="highlight-important">$1</span>'
  );

  return enhanced;
}

/**
 * Add section headings
 */
function addSectionHeadings(content) {
  let enhanced = content;
  const paragraphs = enhanced.split('</p>');
  
  if (paragraphs.length > 3) {
    const headings = ['Background', 'Current Situation', 'Analysis', 'Implications', 'Conclusion'];
    let headingIndex = 0;
    
    // Add heading after first paragraph
    if (headingIndex < headings.length) {
      enhanced = enhanced.replace(
        /<\/p>\s*<p>/,
        `</p>\n<h2>${headings[headingIndex]}</h2>\n<p>`
      );
      headingIndex++;
    }
    
    // Add heading in the middle
    const middleIndex = Math.floor(paragraphs.length / 2);
    if (headingIndex < headings.length && middleIndex > 1) {
      const middlePattern = new RegExp(`(</p>\\s*<p>){${middleIndex}}`, 'g');
      enhanced = enhanced.replace(
        middlePattern,
        `</p>\n<h2>${headings[headingIndex]}</h2>\n<p>`
      );
    }
  }
  
  return enhanced;
}

/**
 * Enhance quotes
 */
function enhanceQuotes(content) {
  let enhanced = content;

  // Convert simple quotes to blockquotes
  enhanced = enhanced.replace(
    /<p>"([^"]+)"<\/p>/g,
    '<blockquote class="quote">$1</blockquote>'
  );

  // Enhance existing blockquotes
  enhanced = enhanced.replace(
    /<blockquote>/g,
    '<blockquote class="enhanced-quote">'
  );

  return enhanced;
}

/**
 * Optimize lists
 */
function optimizeLists(content) {
  let optimized = content;

  // Convert simple bullet points to proper lists
  optimized = optimized.replace(
    /<p>•\s*([^<]+)<\/p>/g,
    '<ul><li>$1</li></ul>'
  );

  // Convert numbered lists
  optimized = optimized.replace(
    /<p>(\d+)\.\s*([^<]+)<\/p>/g,
    '<ol><li>$2</li></ol>'
  );

  return optimized;
}

/**
 * Analyze content quality
 */
async function analyzeContent(content) {
  try {
    const analysis = {
      readability: {
        score: calculateReadabilityScore(content),
        level: getReadabilityLevel(content),
        suggestions: getReadabilitySuggestions(content)
      },
      seo: {
        score: calculateSEOScore(content),
        keywords: extractKeywords(content),
        suggestions: getSEOSuggestions(content)
      },
      engagement: {
        score: calculateEngagementScore(content),
        factors: getEngagementFactors(content)
      },
      multilingual: {
        enQuality: 85, // Placeholder - would need actual analysis
        khQuality: 80, // Placeholder - would need actual analysis
        translationGaps: []
      }
    };

    return analysis;
  } catch (error) {
    console.error('Content analysis failed:', error);
    return null;
  }
}

/**
 * Calculate readability score
 */
function calculateReadabilityScore(content) {
  const text = content.replace(/<[^>]*>/g, '');
  const sentences = text.split(/[.!?]+/).filter(s => s.trim());
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const syllables = countSyllables(text);
  
  if (sentences.length === 0 || words.length === 0) return 0;
  
  // Flesch Reading Ease formula
  const score = 206.835 - (1.015 * (words.length / sentences.length)) - (84.6 * (syllables / words.length));
  
  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Count syllables in text
 */
function countSyllables(text) {
  const words = text.toLowerCase().split(/\s+/);
  let syllableCount = 0;
  
  words.forEach(word => {
    word = word.replace(/[^a-z]/g, '');
    if (word.length <= 3) {
      syllableCount += 1;
    } else {
      const matches = word.match(/[aeiouy]+/g);
      syllableCount += matches ? matches.length : 1;
    }
  });
  
  return syllableCount;
}

/**
 * Get readability level
 */
function getReadabilityLevel(content) {
  const score = calculateReadabilityScore(content);
  if (score >= 90) return 'Very Easy';
  if (score >= 80) return 'Easy';
  if (score >= 70) return 'Fairly Easy';
  if (score >= 60) return 'Standard';
  if (score >= 50) return 'Fairly Difficult';
  if (score >= 30) return 'Difficult';
  return 'Very Difficult';
}

/**
 * Get readability suggestions
 */
function getReadabilitySuggestions(content) {
  const suggestions = [];
  const text = content.replace(/<[^>]*>/g, '');
  const paragraphs = text.split(/\n\s*\n/);
  
  if (paragraphs.length < 3) {
    suggestions.push('Consider breaking content into more paragraphs');
  }
  
  const avgParagraphLength = paragraphs.reduce((sum, p) => sum + p.length, 0) / paragraphs.length;
  if (avgParagraphLength > 200) {
    suggestions.push('Break up long paragraphs for better readability');
  }
  
  if (!content.includes('<h2>')) {
    suggestions.push('Add section headings to improve structure');
  }
  
  return suggestions;
}

/**
 * Calculate SEO score
 */
function calculateSEOScore(content) {
  let score = 0;
  
  // Check for headings
  if (content.includes('<h2>')) score += 20;
  if (content.includes('<h3>')) score += 10;
  
  // Check for emphasis
  if (content.includes('<strong>')) score += 15;
  if (content.includes('<em>')) score += 10;
  
  // Check for lists
  if (content.includes('<ul>') || content.includes('<ol>')) score += 15;
  
  // Check for quotes
  if (content.includes('<blockquote>')) score += 10;
  
  // Check content length
  const textLength = content.replace(/<[^>]*>/g, '').length;
  if (textLength > 500) score += 20;
  if (textLength > 1000) score += 10;
  
  return Math.min(100, score);
}

/**
 * Extract keywords from content
 */
function extractKeywords(content) {
  const text = content.replace(/<[^>]*>/g, '').toLowerCase();
  const words = text.split(/\s+/).filter(w => w.length > 3);
  const wordCount = {};
  
  words.forEach(word => {
    wordCount[word] = (wordCount[word] || 0) + 1;
  });
  
  return Object.entries(wordCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([word]) => word);
}

/**
 * Get SEO suggestions
 */
function getSEOSuggestions(content) {
  const suggestions = [];
  
  if (!content.includes('<h2>')) {
    suggestions.push('Add H2 headings for better structure');
  }
  
  if (!content.includes('<strong>')) {
    suggestions.push('Use bold text to emphasize key points');
  }
  
  if (!content.includes('<ul>') && !content.includes('<ol>')) {
    suggestions.push('Consider using lists for better readability');
  }
  
  return suggestions;
}

/**
 * Calculate engagement score
 */
function calculateEngagementScore(content) {
  let score = 70; // Base score
  
  // Check for engaging elements
  if (content.includes('<blockquote>')) score += 10;
  if (content.includes('<strong>')) score += 5;
  if (content.includes('<h2>')) score += 10;
  if (content.includes('<ul>') || content.includes('<ol>')) score += 5;
  
  return Math.min(100, score);
}

/**
 * Get engagement factors
 */
function getEngagementFactors(content) {
  const factors = [];
  
  if (content.includes('<blockquote>')) factors.push('Includes quotes');
  if (content.includes('<h2>')) factors.push('Has section headings');
  if (content.includes('<strong>')) factors.push('Uses emphasis');
  if (content.includes('<ul>') || content.includes('<ol>')) factors.push('Contains lists');
  
  return factors;
}

/**
 * Basic content formatting (fallback)
 */
function formatArticleContent(content) {
  if (!content || typeof content !== 'string') {
    return '';
  }

  const cleanContent = content.replace(/<[^>]*>/g, '').trim();
  
  if (!cleanContent) {
    return '';
  }

  const paragraphs = cleanContent.split(/\n\s*\n/).filter(p => p.trim());
  
  if (paragraphs.length === 0) {
    return `<p>${cleanContent}</p>`;
  }

  return paragraphs.map(p => `<p>${p.trim()}</p>`).join('\n');
}

export default {
  formatContentAdvanced,
  formattingOptions,
  analyzeContent
};
