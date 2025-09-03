import { GoogleGenerativeAI } from '@google/generative-ai';
import logger from '../utils/logger.mjs';

class AIEnhancementService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    this.rateLimits = new Map(); // Track API usage
  }

  /**
   * Check rate limits before making API calls
   */
  async checkRateLimit() {
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute window
    const maxRequests = 60; // 60 requests per minute

    if (!this.rateLimits.has('requests')) {
      this.rateLimits.set('requests', []);
    }

    const requests = this.rateLimits.get('requests');
    const recentRequests = requests.filter(time => now - time < windowMs);
    
    if (recentRequests.length >= maxRequests) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }

    recentRequests.push(now);
    this.rateLimits.set('requests', recentRequests);
  }

  /**
   * Generate article summary
   */
  async generateSummary(content, maxLength = 200) {
    try {
      await this.checkRateLimit();

      const prompt = `
        Please provide a concise summary of the following news article in ${maxLength} words or less.
        
        Focus on:
        - Main points and key information
        - Important facts and figures
        - Key quotes or statements
        - Overall impact or significance
        
        Article content:
        ${content}
        
        Provide only the summary without any additional text or formatting.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      logger.error('AI summary generation error:', error);
      throw new Error(`Failed to generate summary: ${error.message}`);
    }
  }

  /**
   * Fact-check content
   */
  async factCheck(content) {
    try {
      await this.checkRateLimit();

      const prompt = `
        Please analyze the following news content for factual accuracy and potential issues.
        
        Check for:
        - Factual claims that can be verified
        - Potential misinformation or bias
        - Unsupported claims or speculation
        - Contradictory statements
        - Missing context or important details
        
        Article content:
        ${content}
        
        Provide a JSON response with the following structure:
        {
          "overallAccuracy": "high|medium|low",
          "issues": [
            {
              "type": "factual|bias|speculation|missing_context",
              "severity": "high|medium|low",
              "description": "Description of the issue",
              "suggestion": "How to improve"
            }
          ],
          "recommendations": [
            "List of recommendations for improvement"
          ],
          "confidence": 0.85
        }
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().trim();
      
      // Try to parse JSON response
      try {
        const jsonStart = text.indexOf('{');
        const jsonEnd = text.lastIndexOf('}');
        if (jsonStart !== -1 && jsonEnd !== -1) {
          const jsonString = text.substring(jsonStart, jsonEnd + 1);
          return JSON.parse(jsonString);
        }
      } catch (parseError) {
        logger.warn('Failed to parse fact-check JSON:', parseError);
      }

      // Fallback response
      return {
        overallAccuracy: "medium",
        issues: [],
        recommendations: ["Manual review recommended"],
        confidence: 0.5
      };
    } catch (error) {
      logger.error('AI fact-checking error:', error);
      throw new Error(`Failed to fact-check content: ${error.message}`);
    }
  }

  /**
   * Generate content recommendations
   */
  async generateRecommendations(content, contentType = 'news') {
    try {
      await this.checkRateLimit();

      const prompt = `
        Based on the following ${contentType} content, provide recommendations for improvement and optimization.
        
        Consider:
        - SEO optimization opportunities
        - Content structure and readability
        - Engagement factors
        - Missing information or context
        - Visual elements that could enhance the content
        - Social media optimization
        - Accessibility improvements
        
        Content:
        ${content}
        
        Provide a JSON response with the following structure:
        {
          "seo": {
            "title": "SEO title suggestion",
            "description": "Meta description suggestion",
            "keywords": ["keyword1", "keyword2", "keyword3"],
            "score": 85
          },
          "readability": {
            "score": 75,
            "suggestions": ["suggestion1", "suggestion2"],
            "grade": "B"
          },
          "engagement": {
            "headline": "More engaging headline suggestion",
            "hook": "Opening hook suggestion",
            "callToAction": "Call to action suggestion"
          },
          "visual": {
            "suggestions": ["Add infographic", "Include relevant images"],
            "priority": "high|medium|low"
          },
          "social": {
            "twitter": "Twitter-optimized version",
            "facebook": "Facebook-optimized version",
            "linkedin": "LinkedIn-optimized version"
          }
        }
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().trim();
      
      try {
        const jsonStart = text.indexOf('{');
        const jsonEnd = text.lastIndexOf('}');
        if (jsonStart !== -1 && jsonEnd !== -1) {
          const jsonString = text.substring(jsonStart, jsonEnd + 1);
          return JSON.parse(jsonString);
        }
      } catch (parseError) {
        logger.warn('Failed to parse recommendations JSON:', parseError);
      }

      // Fallback response
      return {
        seo: { score: 70, keywords: [] },
        readability: { score: 70, suggestions: [] },
        engagement: { headline: "", hook: "" },
        visual: { suggestions: [] },
        social: { twitter: "", facebook: "", linkedin: "" }
      };
    } catch (error) {
      logger.error('AI recommendations error:', error);
      throw new Error(`Failed to generate recommendations: ${error.message}`);
    }
  }

  /**
   * Analyze content sentiment
   */
  async analyzeSentiment(content) {
    try {
      await this.checkRateLimit();

      const prompt = `
        Analyze the sentiment and tone of the following news content.
        
        Provide a JSON response with:
        {
          "overallSentiment": "positive|negative|neutral",
          "sentimentScore": 0.75,
          "tone": "professional|casual|formal|informal",
          "emotions": ["emotion1", "emotion2"],
          "bias": {
            "level": "low|medium|high",
            "type": "political|social|economic|none",
            "description": "Description of any detected bias"
          },
          "readability": {
            "grade": "A|B|C|D|F",
            "score": 85,
            "suggestions": ["suggestion1", "suggestion2"]
          }
        }
        
        Content:
        ${content}
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().trim();
      
      try {
        const jsonStart = text.indexOf('{');
        const jsonEnd = text.lastIndexOf('}');
        if (jsonStart !== -1 && jsonEnd !== -1) {
          const jsonString = text.substring(jsonStart, jsonEnd + 1);
          return JSON.parse(jsonString);
        }
      } catch (parseError) {
        logger.warn('Failed to parse sentiment JSON:', parseError);
      }

      // Fallback response
      return {
        overallSentiment: "neutral",
        sentimentScore: 0.5,
        tone: "professional",
        emotions: [],
        bias: { level: "low", type: "none", description: "" },
        readability: { grade: "B", score: 75, suggestions: [] }
      };
    } catch (error) {
      logger.error('AI sentiment analysis error:', error);
      throw new Error(`Failed to analyze sentiment: ${error.message}`);
    }
  }

  /**
   * Generate related content suggestions
   */
  async generateRelatedContent(content, contentType = 'news') {
    try {
      await this.checkRateLimit();

      const prompt = `
        Based on the following ${contentType} content, suggest related topics and content ideas that would be valuable for readers.
        
        Consider:
        - Related news topics
        - Follow-up stories
        - Background information
        - Expert opinions or interviews
        - Data analysis or statistics
        - Historical context
        - Future implications
        
        Content:
        ${content}
        
        Provide a JSON response with:
        {
          "relatedTopics": [
            {
              "topic": "Topic title",
              "type": "follow-up|background|analysis|opinion",
              "priority": "high|medium|low",
              "description": "Why this topic is relevant"
            }
          ],
          "contentIdeas": [
            {
              "title": "Suggested article title",
              "type": "news|analysis|opinion|interview",
              "angle": "Unique angle or perspective",
              "targetAudience": "Who would be interested"
            }
          ],
          "keywords": ["keyword1", "keyword2", "keyword3"],
          "trending": ["trending_topic1", "trending_topic2"]
        }
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().trim();
      
      try {
        const jsonStart = text.indexOf('{');
        const jsonEnd = text.lastIndexOf('}');
        if (jsonStart !== -1 && jsonEnd !== -1) {
          const jsonString = text.substring(jsonStart, jsonEnd + 1);
          return JSON.parse(jsonString);
        }
      } catch (parseError) {
        logger.warn('Failed to parse related content JSON:', parseError);
      }

      // Fallback response
      return {
        relatedTopics: [],
        contentIdeas: [],
        keywords: [],
        trending: []
      };
    } catch (error) {
      logger.error('AI related content error:', error);
      throw new Error(`Failed to generate related content: ${error.message}`);
    }
  }

  /**
   * Generate tags automatically
   */
  async generateTags(content, title, maxTags = 10) {
    try {
      await this.checkRateLimit();

      const prompt = `
        Generate relevant tags for the following news content. Focus on:
        - Main topics and themes
        - Key people, organizations, or locations
        - Industry or category tags
        - Trending topics
        - SEO-friendly keywords
        
        Title: ${title}
        Content: ${content}
        
        Provide ${maxTags} tags in JSON format:
        {
          "tags": [
            {
              "tag": "tag_name",
              "category": "topic|person|location|organization|trend",
              "relevance": 0.95,
              "seo": true
            }
          ]
        }
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().trim();
      
      try {
        const jsonStart = text.indexOf('{');
        const jsonEnd = text.lastIndexOf('}');
        if (jsonStart !== -1 && jsonEnd !== -1) {
          const jsonString = text.substring(jsonStart, jsonEnd + 1);
          const parsed = JSON.parse(jsonString);
          return parsed.tags || [];
        }
      } catch (parseError) {
        logger.warn('Failed to parse tags JSON:', parseError);
      }

      // Fallback: extract simple tags
      const words = content.toLowerCase().split(/\s+/);
      const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should']);
      const uniqueWords = [...new Set(words.filter(word => word.length > 3 && !commonWords.has(word)))];
      
      return uniqueWords.slice(0, maxTags).map(word => ({
        tag: word,
        category: 'topic',
        relevance: 0.7,
        seo: true
      }));
    } catch (error) {
      logger.error('AI tag generation error:', error);
      throw new Error(`Failed to generate tags: ${error.message}`);
    }
  }

  /**
   * Enhance content with AI
   */
  async enhanceContent(content, options = {}) {
    try {
      const {
        improveReadability = true,
        addTransitions = true,
        optimizeSEO = true,
        enhanceEngagement = true
      } = options;

      await this.checkRateLimit();

      let prompt = `Please enhance the following news content to make it more engaging, readable, and SEO-friendly.`;
      
      if (improveReadability) {
        prompt += `\n- Improve readability and flow`;
      }
      if (addTransitions) {
        prompt += `\n- Add smooth transitions between paragraphs`;
      }
      if (optimizeSEO) {
        prompt += `\n- Optimize for search engines with relevant keywords`;
      }
      if (enhanceEngagement) {
        prompt += `\n- Make it more engaging for readers`;
      }

      prompt += `\n\nContent to enhance:\n${content}\n\nProvide only the enhanced content without any additional text or explanations.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      logger.error('AI content enhancement error:', error);
      throw new Error(`Failed to enhance content: ${error.message}`);
    }
  }

  /**
   * Get AI service statistics
   */
  getStats() {
    const requests = this.rateLimits.get('requests') || [];
    const now = Date.now();
    const recentRequests = requests.filter(time => now - time < 60 * 1000); // Last minute
    
    return {
      requestsLastMinute: recentRequests.length,
      totalRequests: requests.length,
      rateLimitRemaining: Math.max(0, 60 - recentRequests.length)
    };
  }
}

export default new AIEnhancementService();
