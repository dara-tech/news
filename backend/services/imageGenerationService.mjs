/**
 * Image Generation Service
 * Handles automatic image generation for articles using Google Gemini
 */

import { GoogleGenAI, Modality } from '@google/genai';
import logger from '../utils/logger.mjs';

class ImageGenerationService {
  constructor() {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY or GOOGLE_API_KEY is not set in environment variables.");
    }
    this.ai = new GoogleGenAI({ apiKey });
  }

  /**
   * Generate actual image using Gemini 2.0 Flash Image Generation
   */
  async generateActualImage(prompt) {
    try {
      logger.info('Generating image with prompt:', prompt?.slice(0, 100) + '...');
      
      const response = await this.ai.models.generateContent({
        model: "gemini-2.0-flash-preview-image-generation",
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
        config: {
          responseModalities: [Modality.TEXT, Modality.IMAGE],
        },
      });

      const parts = response?.candidates?.[0]?.content?.parts;
      if (!parts) {
        throw new Error("Invalid response format from the API");
      }

      let imageData = null;
      let text = "";

      for (const part of parts) {
        if (part.text) {
          text = part.text;
        } else if (part.inlineData?.data) {
          imageData = part.inlineData.data;
        }
      }

      if (!imageData) {
        throw new Error("No image data returned from the API");
      }

      // Convert base64 to Buffer for backend storage
      const buffer = Buffer.from(imageData, 'base64');
      
      return {
        imageBuffer: buffer,
        text: text,
        generated: true,
        timestamp: new Date().toISOString(),
        service: 'gemini-2.0-flash-image-generation'
      };
    } catch (error) {
      logger.error('Error generating actual image:', error);
      return null;
    }
  }

  /**
   * Generate image description and actual image for article with enhanced accuracy
   */
  async generateImageForArticle(title, content) {
    try {
      // Analyze content to extract key themes and visual elements
      const contentAnalysis = this.analyzeContentForImageGeneration(title, content);
      
      // Generate multiple options and select the best one
      const thumbnailOptions = await this.generateThumbnailOptions(title, content, 2);
      
      if (!thumbnailOptions.best) {
        logger.info('Failed to generate quality image for article:', title?.slice(0, 50));
        return null;
      }

      const bestOption = thumbnailOptions.best;
      
      // Log quality metrics
      logger.info('Generated thumbnail with quality score:', {
        title: title?.slice(0, 50),
        qualityScore: bestOption.quality.qualityScore,
        isValid: bestOption.quality.isValid,
        recommendations: bestOption.quality.recommendations
      });

      return {
        imageBuffer: bestOption.imageBuffer,
        description: bestOption.description,
        prompt: bestOption.prompt,
        contentAnalysis: bestOption.contentAnalysis,
        quality: bestOption.quality,
        generated: true,
        timestamp: new Date().toISOString(),
        service: bestOption.service,
        variation: bestOption.variation,
        totalOptions: thumbnailOptions.totalGenerated
      };
    } catch (error) {
      logger.error('Error in generateImageForArticle:', error);
      return null;
    }
  }

  /**
   * Analyze content to extract key themes, subjects, and visual elements
   */
  analyzeContentForImageGeneration(title, content) {
    try {
      const fullText = `${title} ${content}`.toLowerCase();
      
      // Extract key themes and subjects
      const themes = this.extractThemes(fullText);
      const subjects = this.extractSubjects(fullText);
      const locations = this.extractLocations(fullText);
      const emotions = this.extractEmotions(fullText);
      const visualElements = this.extractVisualElements(content);
      
      // Determine image style based on content type
      const imageStyle = this.determineImageStyle(themes, subjects, emotions);
      
      // Determine color scheme based on content mood
      const colorScheme = this.determineColorScheme(emotions, themes);
      
      return {
        themes,
        subjects,
        locations,
        emotions,
        visualElements,
        imageStyle,
        colorScheme,
        isBreaking: this.isBreakingNews(fullText),
        isTech: this.isTechNews(fullText),
        isBusiness: this.isBusinessNews(fullText),
        isPolitics: this.isPoliticsNews(fullText),
        isSports: this.isSportsNews(fullText),
        isHealth: this.isHealthNews(fullText)
      };
    } catch (error) {
      logger.error('Error analyzing content for image generation:', error);
      return {
        themes: [],
        subjects: [],
        locations: [],
        emotions: [],
        visualElements: [],
        imageStyle: 'professional',
        colorScheme: 'neutral',
        isBreaking: false,
        isTech: false,
        isBusiness: false,
        isPolitics: false,
        isSports: false,
        isHealth: false
      };
    }
  }

  /**
   * Create enhanced image prompt based on content analysis
   */
  createEnhancedImagePrompt(title, content, analysis) {
    const { themes, subjects, locations, emotions, imageStyle, colorScheme, isBreaking, isTech, isBusiness, isPolitics, isSports, isHealth } = analysis;
    
    // Build context-specific prompt
    let contextPrompt = '';
    
    if (isBreaking) {
      contextPrompt += 'URGENT BREAKING NEWS - ';
    }
    
    if (isTech) {
      contextPrompt += 'Technology news featuring ';
    } else if (isBusiness) {
      contextPrompt += 'Business news featuring ';
    } else if (isPolitics) {
      contextPrompt += 'Political news featuring ';
    } else if (isSports) {
      contextPrompt += 'Sports news featuring ';
    } else if (isHealth) {
      contextPrompt += 'Health news featuring ';
    } else {
      contextPrompt += 'News article featuring ';
    }
    
    // Add specific subjects and themes
    if (subjects.length > 0) {
      contextPrompt += subjects.slice(0, 3).join(', ') + '. ';
    }
    
    if (themes.length > 0) {
      contextPrompt += `Key themes: ${themes.slice(0, 3).join(', ')}. `;
    }
    
    if (locations.length > 0) {
      contextPrompt += `Location: ${locations[0]}. `;
    }
    
    // Create the main prompt
    let prompt = `
      Create a highly accurate and professional news thumbnail image.
      
      Article Title: ${title}
      Content Context: ${contextPrompt}
      
      Visual Requirements:
      - ${imageStyle} photography style
      - ${colorScheme} color palette
      - 16:9 aspect ratio (1920x1080 pixels)
      - High resolution, professional quality
      - Clean, modern composition
      - No text overlays or watermarks
      - Focus on the main subject(s): ${subjects.slice(0, 2).join(', ')}
      
      Specific Visual Elements to Include:
      ${subjects.map(subject => `- ${subject}`).join('\n')}
      
      Mood and Tone:
      - ${emotions.length > 0 ? emotions[0] : 'professional'}
      - ${isBreaking ? 'urgent and attention-grabbing' : 'informative and engaging'}
      - Suitable for a news website thumbnail
      
      Technical Specifications:
      - Professional lighting
      - Sharp focus on main subjects
      - Balanced composition
      - High contrast for web display
      - Optimized for mobile and desktop viewing
      
      Generate an image that accurately represents the article content and would make readers want to click and read the full story.
    `;

    // Add consistency features
    prompt = this.addConsistencyFeatures(prompt, analysis);

    return prompt.trim();
  }

  /**
   * Extract key themes from content
   */
  extractThemes(text) {
    const themeKeywords = {
      'technology': ['tech', 'digital', 'ai', 'artificial intelligence', 'software', 'app', 'internet', 'cyber', 'data', 'innovation', 'startup', 'gadget', 'device', 'computer', 'phone', 'smartphone'],
      'business': ['business', 'economy', 'market', 'stock', 'finance', 'investment', 'company', 'corporate', 'revenue', 'profit', 'merger', 'acquisition', 'ceo', 'entrepreneur'],
      'politics': ['government', 'political', 'election', 'president', 'minister', 'policy', 'law', 'parliament', 'democracy', 'vote', 'campaign', 'politician', 'administration'],
      'health': ['health', 'medical', 'doctor', 'hospital', 'disease', 'treatment', 'medicine', 'healthcare', 'patient', 'covid', 'pandemic', 'vaccine', 'research'],
      'sports': ['sport', 'football', 'soccer', 'basketball', 'tennis', 'olympic', 'championship', 'tournament', 'player', 'team', 'match', 'game', 'athlete'],
      'environment': ['environment', 'climate', 'green', 'sustainable', 'renewable', 'carbon', 'pollution', 'nature', 'conservation', 'energy', 'solar', 'wind'],
      'education': ['education', 'school', 'university', 'student', 'teacher', 'learning', 'academic', 'research', 'study', 'degree', 'college'],
      'entertainment': ['entertainment', 'movie', 'film', 'music', 'celebrity', 'actor', 'singer', 'concert', 'show', 'television', 'tv', 'streaming']
    };

    const themes = [];
    for (const [theme, keywords] of Object.entries(themeKeywords)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        themes.push(theme);
      }
    }
    
    return themes;
  }

  /**
   * Extract main subjects from content
   */
  extractSubjects(text) {
    const subjects = [];
    
    // Common subject patterns
    const subjectPatterns = [
      /\b(?:new|latest|breaking)\s+([a-z\s]+?)(?:\s+news|\s+report|\s+update)/gi,
      /\b(?:about|regarding|concerning)\s+([a-z\s]+?)(?:\s+in|\s+at|\s+for)/gi,
      /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:announced|confirmed|reported|said)/gi
    ];
    
    subjectPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const subject = match.replace(/\b(?:new|latest|breaking|about|regarding|concerning|announced|confirmed|reported|said)\b/gi, '').trim();
          if (subject.length > 3 && subject.length < 50) {
            subjects.push(subject);
          }
        });
      }
    });
    
    return [...new Set(subjects)].slice(0, 5);
  }

  /**
   * Extract locations from content
   */
  extractLocations(text) {
    const locations = [];
    const locationPatterns = [
      /\b(?:in|at|from|to)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g,
      /\b(?:Cambodia|Phnom Penh|Siem Reap|Battambang|Kampong Cham|Kampong Thom|Kampot|Kep|Koh Kong|Mondulkiri|Ratanakiri|Stung Treng|Preah Vihear|Oddar Meanchey|Banteay Meanchey|Pailin|Pursat|Kampong Speu|Takeo|Kandal|Prey Veng|Svay Rieng|Tboung Khmum|Kampong Chhnang|Kratie)\b/gi,
      /\b(?:United States|USA|US|United Kingdom|UK|China|Japan|Germany|France|Italy|Spain|Canada|Australia|India|Brazil|Russia|Thailand|Vietnam|Laos|Myanmar|Singapore|Malaysia|Indonesia|Philippines)\b/gi
    ];
    
    locationPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const location = match.replace(/\b(?:in|at|from|to)\s+/gi, '').trim();
          if (location.length > 2) {
            locations.push(location);
          }
        });
      }
    });
    
    return [...new Set(locations)].slice(0, 3);
  }

  /**
   * Extract emotional tone from content
   */
  extractEmotions(text) {
    const emotions = [];
    
    const emotionKeywords = {
      'urgent': ['urgent', 'breaking', 'emergency', 'critical', 'immediate', 'alert', 'warning'],
      'positive': ['success', 'achievement', 'growth', 'improvement', 'victory', 'win', 'celebration', 'good news'],
      'negative': ['crisis', 'problem', 'issue', 'concern', 'threat', 'danger', 'failure', 'loss', 'decline'],
      'neutral': ['report', 'update', 'announcement', 'statement', 'information', 'data', 'analysis'],
      'excited': ['exciting', 'amazing', 'incredible', 'remarkable', 'outstanding', 'breakthrough', 'revolutionary']
    };
    
    for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        emotions.push(emotion);
      }
    }
    
    return emotions.length > 0 ? emotions : ['neutral'];
  }

  /**
   * Determine image style based on content analysis
   */
  determineImageStyle(themes, subjects, emotions) {
    if (themes.includes('technology')) return 'modern tech photography';
    if (themes.includes('business')) return 'corporate photography';
    if (themes.includes('politics')) return 'documentary photography';
    if (themes.includes('health')) return 'medical photography';
    if (themes.includes('sports')) return 'sports photography';
    if (themes.includes('environment')) return 'environmental photography';
    if (emotions.includes('urgent')) return 'news photography';
    return 'professional photography';
  }

  /**
   * Determine color scheme based on content mood
   */
  determineColorScheme(emotions, themes) {
    if (emotions.includes('urgent')) return 'red and orange tones';
    if (emotions.includes('positive')) return 'blue and green tones';
    if (emotions.includes('negative')) return 'gray and dark tones';
    if (themes.includes('technology')) return 'blue and purple tones';
    if (themes.includes('health')) return 'green and white tones';
    if (themes.includes('environment')) return 'green and earth tones';
    return 'professional neutral tones';
  }

  /**
   * Check if content is breaking news
   */
  isBreakingNews(text) {
    const breakingKeywords = ['breaking', 'urgent', 'emergency', 'alert', 'just in', 'developing', 'live'];
    return breakingKeywords.some(keyword => text.includes(keyword));
  }

  /**
   * Check if content is tech news
   */
  isTechNews(text) {
    const techKeywords = ['tech', 'technology', 'digital', 'ai', 'artificial intelligence', 'software', 'app', 'internet', 'cyber', 'data', 'innovation'];
    return techKeywords.some(keyword => text.includes(keyword));
  }

  /**
   * Check if content is business news
   */
  isBusinessNews(text) {
    const businessKeywords = ['business', 'economy', 'market', 'stock', 'finance', 'investment', 'company', 'corporate', 'revenue', 'profit'];
    return businessKeywords.some(keyword => text.includes(keyword));
  }

  /**
   * Check if content is politics news
   */
  isPoliticsNews(text) {
    const politicsKeywords = ['government', 'political', 'election', 'president', 'minister', 'policy', 'law', 'parliament', 'democracy'];
    return politicsKeywords.some(keyword => text.includes(keyword));
  }

  /**
   * Check if content is sports news
   */
  isSportsNews(text) {
    const sportsKeywords = ['sport', 'football', 'soccer', 'basketball', 'tennis', 'olympic', 'championship', 'tournament', 'player', 'team'];
    return sportsKeywords.some(keyword => text.includes(keyword));
  }

  /**
   * Check if content is health news
   */
  isHealthNews(text) {
    const healthKeywords = ['health', 'medical', 'doctor', 'hospital', 'disease', 'treatment', 'medicine', 'healthcare', 'patient', 'covid'];
    return healthKeywords.some(keyword => text.includes(keyword));
  }

  /**
   * Extract key visual elements from content for image generation
   */
  extractVisualElements(content) {
    try {
      // Extract key terms, locations, objects, etc. from content
      const words = content.toLowerCase().split(/\s+/);
      const visualKeywords = words.filter(word => 
        word.length > 3 && 
        !['the', 'and', 'for', 'with', 'this', 'that', 'have', 'been', 'will', 'said', 'news'].includes(word)
      );
      
      return visualKeywords.slice(0, 10); // Return top 10 visual keywords
    } catch (error) {
      logger.error('Error extracting visual elements:', error);
      return [];
    }
  }

  /**
   * Generate consistent thumbnail style based on content category
   */
  generateConsistentStyle(contentAnalysis) {
    const { themes, isBreaking, isTech, isBusiness, isPolitics, isSports, isHealth } = contentAnalysis;
    
    // Define consistent style templates for each category
    const styleTemplates = {
      'technology': {
        baseStyle: 'modern tech photography',
        colorScheme: 'blue and purple tones',
        composition: 'clean geometric elements with tech devices',
        lighting: 'cool LED lighting',
        mood: 'innovative and futuristic'
      },
      'business': {
        baseStyle: 'corporate photography',
        colorScheme: 'professional blue and gray tones',
        composition: 'business people in professional settings',
        lighting: 'professional studio lighting',
        mood: 'confident and authoritative'
      },
      'politics': {
        baseStyle: 'documentary photography',
        colorScheme: 'neutral and official tones',
        composition: 'government buildings and officials',
        lighting: 'natural and documentary style',
        mood: 'serious and official'
      },
      'health': {
        baseStyle: 'medical photography',
        colorScheme: 'clean white and green tones',
        composition: 'medical professionals and healthcare settings',
        lighting: 'bright and clean lighting',
        mood: 'caring and professional'
      },
      'sports': {
        baseStyle: 'sports photography',
        colorScheme: 'dynamic and energetic tones',
        composition: 'athletes in action',
        lighting: 'dynamic action lighting',
        mood: 'energetic and competitive'
      },
      'environment': {
        baseStyle: 'environmental photography',
        colorScheme: 'green and earth tones',
        composition: 'nature and environmental elements',
        lighting: 'natural outdoor lighting',
        mood: 'natural and sustainable'
      },
      'breaking': {
        baseStyle: 'news photography',
        colorScheme: 'urgent red and orange tones',
        composition: 'dramatic and attention-grabbing',
        lighting: 'high contrast lighting',
        mood: 'urgent and dramatic'
      }
    };

    // Determine the primary category
    let primaryCategory = 'general';
    if (isBreaking) primaryCategory = 'breaking';
    else if (isTech) primaryCategory = 'technology';
    else if (isBusiness) primaryCategory = 'business';
    else if (isPolitics) primaryCategory = 'politics';
    else if (isSports) primaryCategory = 'sports';
    else if (isHealth) primaryCategory = 'health';
    else if (themes.includes('environment')) primaryCategory = 'environment';

    return styleTemplates[primaryCategory] || styleTemplates['general'] || {
      baseStyle: 'professional photography',
      colorScheme: 'neutral tones',
      composition: 'clean and professional',
      lighting: 'professional lighting',
      mood: 'informative and engaging'
    };
  }

  /**
   * Add consistency features to the image prompt
   */
  addConsistencyFeatures(prompt, contentAnalysis) {
    const consistentStyle = this.generateConsistentStyle(contentAnalysis);
    
    const consistencyPrompt = `
      
      CONSISTENCY REQUIREMENTS:
      - Use ${consistentStyle.baseStyle} style consistently
      - Apply ${consistentStyle.colorScheme} color palette
      - Compose with ${consistentStyle.composition}
      - Use ${consistentStyle.lighting} for lighting
      - Convey ${consistentStyle.mood} mood
      
      QUALITY STANDARDS:
      - High resolution (1920x1080 minimum)
      - Professional composition
      - Sharp focus and clarity
      - Balanced exposure
      - Web-optimized contrast
      - Mobile-friendly aspect ratio
      
      AVOID:
      - Text overlays or watermarks
      - Low resolution or blurry images
      - Inconsistent color schemes
      - Poor lighting or exposure
      - Cluttered compositions
      - Generic stock photo look
    `;

    return prompt + consistencyPrompt;
  }

  /**
   * Validate thumbnail quality and consistency
   */
  validateThumbnailQuality(imageBuffer, contentAnalysis) {
    try {
      // Basic validation checks
      const validations = {
        hasImageBuffer: !!imageBuffer,
        bufferSize: imageBuffer ? imageBuffer.length : 0,
        isLargeEnough: imageBuffer ? imageBuffer.length > 50000 : false, // At least 50KB
        isNotTooLarge: imageBuffer ? imageBuffer.length < 5000000 : false, // Less than 5MB
        hasContentAnalysis: !!contentAnalysis,
        hasThemes: contentAnalysis?.themes?.length > 0,
        hasSubjects: contentAnalysis?.subjects?.length > 0,
        hasValidStyle: !!contentAnalysis?.imageStyle,
        hasValidColorScheme: !!contentAnalysis?.colorScheme
      };

      // Calculate quality score
      const qualityScore = Object.values(validations).filter(Boolean).length / Object.keys(validations).length;
      
      return {
        isValid: qualityScore >= 0.7, // 70% validation score required
        qualityScore,
        validations,
        recommendations: this.generateQualityRecommendations(validations, contentAnalysis)
      };
    } catch (error) {
      logger.error('Error validating thumbnail quality:', error);
      return {
        isValid: false,
        qualityScore: 0,
        validations: {},
        recommendations: ['Thumbnail validation failed']
      };
    }
  }

  /**
   * Generate quality improvement recommendations
   */
  generateQualityRecommendations(validations, contentAnalysis) {
    const recommendations = [];
    
    if (!validations.hasImageBuffer) {
      recommendations.push('Generate image buffer');
    }
    
    if (!validations.isLargeEnough) {
      recommendations.push('Increase image resolution');
    }
    
    if (validations.isNotTooLarge === false) {
      recommendations.push('Optimize image size');
    }
    
    if (!validations.hasThemes) {
      recommendations.push('Improve content theme detection');
    }
    
    if (!validations.hasSubjects) {
      recommendations.push('Enhance subject extraction');
    }
    
    if (!validations.hasValidStyle) {
      recommendations.push('Apply consistent image style');
    }
    
    if (!validations.hasValidColorScheme) {
      recommendations.push('Implement color scheme consistency');
    }
    
    return recommendations;
  }

  /**
   * Generate multiple thumbnail options for better selection
   */
  async generateThumbnailOptions(title, content, maxOptions = 3) {
    try {
      const contentAnalysis = this.analyzeContentForImageGeneration(title, content);
      const options = [];
      
      // Generate base prompt
      const basePrompt = this.createEnhancedImagePrompt(title, content, contentAnalysis);
      
      // Generate variations
      for (let i = 0; i < maxOptions; i++) {
        const variationPrompt = this.addVariationToPrompt(basePrompt, i, contentAnalysis);
        const imageResult = await this.generateActualImage(variationPrompt);
        
        if (imageResult) {
          const quality = this.validateThumbnailQuality(imageResult.imageBuffer, contentAnalysis);
          options.push({
            imageBuffer: imageResult.imageBuffer,
            description: imageResult.text || 'AI-generated news thumbnail',
            prompt: variationPrompt,
            contentAnalysis: contentAnalysis,
            quality: quality,
            variation: i + 1,
            generated: true,
            timestamp: new Date().toISOString(),
            service: imageResult.service
          });
        }
      }
      
      // Sort by quality score and return best option
      options.sort((a, b) => b.quality.qualityScore - a.quality.qualityScore);
      
      return {
        best: options[0] || null,
        options: options,
        totalGenerated: options.length,
        contentAnalysis: contentAnalysis
      };
    } catch (error) {
      logger.error('Error generating thumbnail options:', error);
      return {
        best: null,
        options: [],
        totalGenerated: 0,
        contentAnalysis: null
      };
    }
  }

  /**
   * Add variation to prompt for multiple options
   */
  addVariationToPrompt(basePrompt, variationIndex, contentAnalysis) {
    const variations = [
      'Focus on close-up details and intimate composition',
      'Emphasize wide-angle perspective and environmental context',
      'Highlight dynamic action and movement elements'
    ];
    
    const variation = variations[variationIndex] || 'Standard professional composition';
    
    return `${basePrompt}\n\nVARIATION ${variationIndex + 1}: ${variation}`;
  }
}

export default new ImageGenerationService();


