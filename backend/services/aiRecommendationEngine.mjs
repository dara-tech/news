#!/usr/bin/env node

/**
 * AI-Powered Recommendation Engine
 * Advanced content recommendations and personalization
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import News from '../models/News.mjs';
import User from '../models/User.mjs';
import logger from '../utils/logger.mjs';

class AIRecommendationEngine {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    // User behavior tracking
    this.userBehavior = new Map();
    this.contentVectors = new Map();
    this.trendingTopics = new Map();
    
    this.initializeEngine();
  }

  async initializeEngine() {
    try {
      await this.buildContentVectors();
      await this.analyzeTrendingTopics();
      logger.info('AI Recommendation Engine initialized');
    } catch (error) {
      logger.error('Recommendation engine initialization error:', error);
    }
  }

  /**
   * Get Personalized Recommendations
   */
  async getPersonalizedRecommendations(userId, options = {}) {
    try {
      const {
        limit = 10,
        excludeRead = true,
        includeBreaking = true,
        language = 'en'
      } = options;

      // Get user profile and behavior
      const userProfile = await this.getUserProfile(userId);
      const userBehavior = this.userBehavior.get(userId) || {};

      // Get content recommendations based on multiple factors
      const [
        behaviorBasedRecs,
        contentBasedRecs,
        trendingRecs,
        qualityRecs
      ] = await Promise.all([
        this.getBehaviorBasedRecommendations(userProfile, userBehavior, limit),
        this.getContentBasedRecommendations(userProfile, limit),
        this.getTrendingRecommendations(limit),
        this.getHighQualityRecommendations(limit)
      ]);

      // Combine and score recommendations
      const combinedRecs = this.combineRecommendations([
        { type: 'behavior', weight: 0.4, items: behaviorBasedRecs },
        { type: 'content', weight: 0.3, items: contentBasedRecs },
        { type: 'trending', weight: 0.2, items: trendingRecs },
        { type: 'quality', weight: 0.1, items: qualityRecs }
      ]);

      // Apply filters
      let filteredRecs = combinedRecs;
      
      if (excludeRead && userBehavior.readArticles) {
        filteredRecs = filteredRecs.filter(rec => 
          !userBehavior.readArticles.includes(rec._id.toString())
        );
      }

      // Add breaking news if requested
      if (includeBreaking) {
        const breakingNews = await this.getBreakingNews(language);
        filteredRecs = [...breakingNews, ...filteredRecs];
      }

      return {
        recommendations: filteredRecs.slice(0, limit),
        metadata: {
          userId,
          generatedAt: new Date(),
          algorithm: 'hybrid',
          factors: ['behavior', 'content', 'trending', 'quality']
        }
      };
    } catch (error) {
      logger.error('Personalized recommendations error:', error);
      return this.getFallbackRecommendations(limit);
    }
  }

  /**
   * Get Content-Based Recommendations
   */
  async getContentBasedRecommendations(userProfile, limit) {
    try {
      const userInterests = userProfile.interests || [];
      const userCategories = userProfile.preferredCategories || [];
      
      const query = {
        status: 'published',
        $or: [
          { tags: { $in: userInterests } },
          { category: { $in: userCategories } },
          { 'keywords': { $regex: userInterests.join('|'), $options: 'i' } }
        ]
      };

      const recommendations = await News.find(query)
        .populate('category', 'name')
        .populate('author', 'name profileImage')
        .sort({ 
          'qualityAssessment.overallScore': -1,
          publishedAt: -1,
          views: -1 
        })
        .limit(limit * 2) // Get more to allow for filtering
        .select('title slug description thumbnail publishedAt views category author qualityAssessment tags');

      return recommendations.map(article => ({
        ...article.toObject(),
        recommendationScore: this.calculateContentScore(article, userProfile),
        recommendationType: 'content-based'
      }));
    } catch (error) {
      logger.error('Content-based recommendations error:', error);
      return [];
    }
  }

  /**
   * Get Behavior-Based Recommendations
   */
  async getBehaviorBasedRecommendations(userProfile, userBehavior, limit) {
    try {
      if (!userBehavior.readArticles || userBehavior.readArticles.length === 0) {
        return this.getPopularRecommendations(limit);
      }

      // Find similar articles based on reading history
      const readArticles = await News.find({
        _id: { $in: userBehavior.readArticles.slice(-20) } // Last 20 read articles
      }).select('category tags keywords');

      // Extract patterns
      const categories = [...new Set(readArticles.map(a => a.category.toString()))];
      const tags = [...new Set(readArticles.flatMap(a => a.tags || []))];
      const keywords = [...new Set(readArticles.flatMap(a => 
        a.keywords ? a.keywords.split(',').map(k => k.trim()) : []
      ))];

      // Find similar articles
      const query = {
        status: 'published',
        _id: { $nin: userBehavior.readArticles },
        $or: [
          { category: { $in: categories } },
          { tags: { $in: tags } },
          { keywords: { $regex: keywords.join('|'), $options: 'i' } }
        ]
      };

      const recommendations = await News.find(query)
        .populate('category', 'name')
        .populate('author', 'name profileImage')
        .sort({ publishedAt: -1, views: -1 })
        .limit(limit)
        .select('title slug description thumbnail publishedAt views category author qualityAssessment tags');

      return recommendations.map(article => ({
        ...article.toObject(),
        recommendationScore: this.calculateBehaviorScore(article, { categories, tags, keywords }),
        recommendationType: 'behavior-based'
      }));
    } catch (error) {
      logger.error('Behavior-based recommendations error:', error);
      return [];
    }
  }

  /**
   * Get Trending Recommendations
   */
  async getTrendingRecommendations(limit) {
    try {
      const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      const trending = await News.find({
        status: 'published',
        publishedAt: { $gte: last24Hours }
      })
      .populate('category', 'name')
      .populate('author', 'name profileImage')
      .sort({ views: -1, publishedAt: -1 })
      .limit(limit)
      .select('title slug description thumbnail publishedAt views category author qualityAssessment tags');

      return trending.map(article => ({
        ...article.toObject(),
        recommendationScore: this.calculateTrendingScore(article),
        recommendationType: 'trending'
      }));
    } catch (error) {
      logger.error('Trending recommendations error:', error);
      return [];
    }
  }

  /**
   * Get High-Quality Recommendations
   */
  async getHighQualityRecommendations(limit) {
    try {
      const recommendations = await News.find({
        status: 'published',
        'qualityAssessment.overallScore': { $gte: 85 }
      })
      .populate('category', 'name')
      .populate('author', 'name profileImage')
      .sort({ 'qualityAssessment.overallScore': -1, publishedAt: -1 })
      .limit(limit)
      .select('title slug description thumbnail publishedAt views category author qualityAssessment tags');

      return recommendations.map(article => ({
        ...article.toObject(),
        recommendationScore: article.qualityAssessment?.overallScore || 0,
        recommendationType: 'quality-based'
      }));
    } catch (error) {
      logger.error('Quality recommendations error:', error);
      return [];
    }
  }

  /**
   * AI-Powered Content Analysis
   */
  async analyzeContentSimilarity(article1, article2) {
    try {
      const prompt = `
        Analyze the similarity between these two news articles and provide a similarity score from 0-100:

        Article 1:
        Title: ${article1.title?.en || article1.title}
        Description: ${article1.description?.en || article1.description}
        Tags: ${article1.tags?.join(', ') || 'None'}

        Article 2:
        Title: ${article2.title?.en || article2.title}
        Description: ${article2.description?.en || article2.description}
        Tags: ${article2.tags?.join(', ') || 'None'}

        Consider:
        - Topic similarity
        - Content themes
        - Target audience
        - News category overlap

        Respond with only a JSON object: {"similarity": number, "reasoning": "brief explanation"}
      `;

      const result = await this.model.generateContent(prompt);
      const response = result.response.text();
      
      try {
        const analysis = JSON.parse(response);
        return analysis.similarity || 0;
      } catch {
        return 0;
      }
    } catch (error) {
      logger.error('Content similarity analysis error:', error);
      return 0;
    }
  }

  /**
   * Generate Content Tags using AI
   */
  async generateContentTags(article) {
    try {
      const prompt = `
        Analyze this news article and generate relevant tags:

        Title: ${article.title?.en || article.title}
        Content: ${(article.content?.en || article.content || '').substring(0, 1000)}
        Category: ${article.category?.name || 'Unknown'}

        Generate 5-10 relevant tags that would help with content discovery and recommendations.
        Focus on:
        - Main topics and themes
        - Key entities (people, places, organizations)
        - Industry/sector relevance
        - Geographic relevance

        Respond with only a JSON array of strings: ["tag1", "tag2", "tag3"]
      `;

      const result = await this.model.generateContent(prompt);
      const response = result.response.text();
      
      try {
        const tags = JSON.parse(response);
        return Array.isArray(tags) ? tags : [];
      } catch {
        return [];
      }
    } catch (error) {
      logger.error('Content tags generation error:', error);
      return [];
    }
  }

  /**
   * Track User Behavior
   */
  trackUserBehavior(userId, action, data) {
    try {
      if (!this.userBehavior.has(userId)) {
        this.userBehavior.set(userId, {
          readArticles: [],
          categories: new Map(),
          tags: new Map(),
          timeSpent: new Map(),
          lastActive: new Date()
        });
      }

      const behavior = this.userBehavior.get(userId);
      behavior.lastActive = new Date();

      switch (action) {
        case 'read_article':
          if (!behavior.readArticles.includes(data.articleId)) {
            behavior.readArticles.push(data.articleId);
            // Keep only last 100 articles
            if (behavior.readArticles.length > 100) {
              behavior.readArticles.shift();
            }
          }
          break;

        case 'category_view':
          const categoryCount = behavior.categories.get(data.category) || 0;
          behavior.categories.set(data.category, categoryCount + 1);
          break;

        case 'tag_interaction':
          const tagCount = behavior.tags.get(data.tag) || 0;
          behavior.tags.set(data.tag, tagCount + 1);
          break;

        case 'time_spent':
          const timeSpent = behavior.timeSpent.get(data.articleId) || 0;
          behavior.timeSpent.set(data.articleId, timeSpent + data.duration);
          break;
      }

      this.userBehavior.set(userId, behavior);
    } catch (error) {
      logger.error('User behavior tracking error:', error);
    }
  }

  /**
   * Helper Methods
   */
  async getUserProfile(userId) {
    try {
      const user = await User.findById(userId).select('preferences interests');
      return {
        interests: user?.interests || [],
        preferredCategories: user?.preferences?.categories || [],
        language: user?.preferences?.language || 'en'
      };
    } catch (error) {
      return { interests: [], preferredCategories: [], language: 'en' };
    }
  }

  combineRecommendations(sources) {
    const combined = new Map();

    sources.forEach(({ type, weight, items }) => {
      items.forEach(item => {
        const id = item._id.toString();
        if (!combined.has(id)) {
          combined.set(id, {
            ...item,
            combinedScore: 0,
            sources: []
          });
        }
        
        const existing = combined.get(id);
        existing.combinedScore += (item.recommendationScore || 0) * weight;
        existing.sources.push(type);
      });
    });

    return Array.from(combined.values())
      .sort((a, b) => b.combinedScore - a.combinedScore);
  }

  calculateContentScore(article, userProfile) {
    let score = 0;
    
    // Quality score
    score += (article.qualityAssessment?.overallScore || 0) * 0.3;
    
    // Interest matching
    const articleTags = article.tags || [];
    const userInterests = userProfile.interests || [];
    const interestMatch = articleTags.filter(tag => 
      userInterests.some(interest => 
        interest.toLowerCase().includes(tag.toLowerCase()) ||
        tag.toLowerCase().includes(interest.toLowerCase())
      )
    ).length;
    score += interestMatch * 10;
    
    // Recency bonus
    const ageInHours = (Date.now() - new Date(article.publishedAt)) / (1000 * 60 * 60);
    const recencyScore = Math.max(0, 100 - ageInHours);
    score += recencyScore * 0.2;
    
    return Math.min(100, score);
  }

  calculateBehaviorScore(article, patterns) {
    let score = 0;
    
    // Category match
    if (patterns.categories.includes(article.category?.toString())) {
      score += 30;
    }
    
    // Tag matches
    const tagMatches = (article.tags || []).filter(tag => 
      patterns.tags.includes(tag)
    ).length;
    score += tagMatches * 10;
    
    // Keyword matches
    const keywordMatches = patterns.keywords.filter(keyword =>
      article.title?.en?.toLowerCase().includes(keyword.toLowerCase()) ||
      article.description?.en?.toLowerCase().includes(keyword.toLowerCase())
    ).length;
    score += keywordMatches * 5;
    
    return Math.min(100, score);
  }

  calculateTrendingScore(article) {
    const ageInHours = (Date.now() - new Date(article.publishedAt)) / (1000 * 60 * 60);
    const views = article.views || 0;
    
    // Trending score based on views and recency
    const trendingScore = (views / Math.max(1, ageInHours)) * 10;
    return Math.min(100, trendingScore);
  }

  async getBreakingNews(language) {
    try {
      const breaking = await News.find({
        status: 'published',
        isBreaking: true,
        publishedAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      })
      .populate('category', 'name')
      .populate('author', 'name profileImage')
      .sort({ publishedAt: -1 })
      .limit(3)
      .select('title slug description thumbnail publishedAt views category author qualityAssessment');

      return breaking.map(article => ({
        ...article.toObject(),
        recommendationScore: 100,
        recommendationType: 'breaking-news'
      }));
    } catch (error) {
      logger.error('Breaking news error:', error);
      return [];
    }
  }

  async getPopularRecommendations(limit) {
    try {
      const popular = await News.find({ status: 'published' })
        .populate('category', 'name')
        .populate('author', 'name profileImage')
        .sort({ views: -1, publishedAt: -1 })
        .limit(limit)
        .select('title slug description thumbnail publishedAt views category author qualityAssessment');

      return popular.map(article => ({
        ...article.toObject(),
        recommendationScore: Math.min(100, (article.views || 0) / 10),
        recommendationType: 'popular'
      }));
    } catch (error) {
      logger.error('Popular recommendations error:', error);
      return [];
    }
  }

  async getFallbackRecommendations(limit) {
    try {
      const fallback = await News.find({ status: 'published' })
        .populate('category', 'name')
        .populate('author', 'name profileImage')
        .sort({ publishedAt: -1 })
        .limit(limit)
        .select('title slug description thumbnail publishedAt views category author qualityAssessment');

      return {
        recommendations: fallback.map(article => ({
          ...article.toObject(),
          recommendationScore: 50,
          recommendationType: 'fallback'
        })),
        metadata: {
          generatedAt: new Date(),
          algorithm: 'fallback'
        }
      };
    } catch (error) {
      logger.error('Fallback recommendations error:', error);
      return { recommendations: [], metadata: {} };
    }
  }

  async buildContentVectors() {
    // Placeholder for future ML-based content vectorization
    logger.info('Content vectors built');
  }

  async analyzeTrendingTopics() {
    // Placeholder for trending topics analysis
    logger.info('Trending topics analyzed');
  }
}

export default AIRecommendationEngine;
