#!/usr/bin/env node

/**
 * AI-Powered Recommendation Engine
 * Advanced content recommendations and personalization
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import News from '../models/News.mjs';
import User from '../models/User.mjs';
import Category from '../models/Category.mjs';
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

  /**
   * Get Similar Content
   */
  async getSimilarContent(article, limit, language) {
    try {
      const query = {
        status: 'published',
        _id: { $ne: article._id },
        $or: [
          { category: article.category },
          { tags: { $in: article.tags || [] } },
          { keywords: { $regex: (article.tags || []).join('|'), $options: 'i' } }
        ]
      };

      const similarArticles = await News.find(query)
        .populate('category', 'name')
        .populate('author', 'name profileImage')
        .sort({ publishedAt: -1 })
        .limit(limit * 2)
        .select('title slug description thumbnail publishedAt views category author qualityAssessment tags');

      // Use AI to analyze similarity
      const scoredArticles = await Promise.all(
        similarArticles.map(async (similarArticle) => {
          const similarity = await this.analyzeContentSimilarity(article, similarArticle);
          return {
            ...similarArticle.toObject(),
            similarityScore: similarity,
            recommendationType: 'similar-content'
          };
        })
      );

      return scoredArticles
        .sort((a, b) => b.similarityScore - a.similarityScore)
        .slice(0, limit);
    } catch (error) {
      logger.error('Similar content error:', error);
      return [];
    }
  }

  /**
   * Get Category-Based Recommendations
   */
  async getCategoryBasedRecommendations(categories, limit, language) {
    try {
      if (!categories || categories.length === 0) {
        return this.getPopularRecommendations(limit);
      }

      const query = {
        status: 'published',
        category: { $in: categories }
      };

      const recommendations = await News.find(query)
        .populate('category', 'name')
        .populate('author', 'name profileImage')
        .sort({ 
          'qualityAssessment.overallScore': -1,
          publishedAt: -1,
          views: -1 
        })
        .limit(limit)
        .select('title slug description thumbnail publishedAt views category author qualityAssessment tags');

      return recommendations.map(article => ({
        ...article.toObject(),
        recommendationScore: this.calculateCategoryScore(article, categories),
        recommendationType: 'category-based'
      }));
    } catch (error) {
      logger.error('Category-based recommendations error:', error);
      return [];
    }
  }

  /**
   * Get Explore Content (Diverse, High-Quality)
   */
  async getExploreContent(limit, language, categories = [], excludeIds = []) {
    try {
      const query = {
        status: 'published',
        'qualityAssessment.overallScore': { $gte: 80 }
      };

      if (categories.length > 0) {
        query.category = { $in: categories };
      }

      if (excludeIds.length > 0) {
        query._id = { $nin: excludeIds };
      }

      const exploreContent = await News.find(query)
        .populate('category', 'name')
        .populate('author', 'name profileImage')
        .sort({ 
          'qualityAssessment.overallScore': -1,
          publishedAt: -1 
        })
        .limit(limit * 2)
        .select('title slug description thumbnail publishedAt views category author qualityAssessment tags');

      // Add diversity by ensuring different categories
      const diversified = this.addDiversityToContent(exploreContent, limit);

      return diversified.map(article => ({
        ...article.toObject(),
        recommendationScore: article.qualityAssessment?.overallScore || 0,
        recommendationType: 'explore-diverse'
      }));
    } catch (error) {
      logger.error('Explore content error:', error);
      return [];
    }
  }

  /**
   * Generate User Insights using AI
   */
  async generateUserInsights(userId, language) {
    try {
      const userProfile = await this.getUserProfile(userId);
      const userBehavior = this.userBehavior.get(userId) || {};

      if (!userBehavior.readArticles || userBehavior.readArticles.length === 0) {
        return {
          insights: [],
          message: 'Not enough data to generate insights yet'
        };
      }

      // Get user's reading history
      const readArticles = await News.find({
        _id: { $in: userBehavior.readArticles.slice(-20) }
      }).select('title category tags keywords publishedAt');

      const prompt = `
        Analyze this user's reading behavior and generate personalized insights:

        Reading History (last 20 articles):
        ${readArticles.map(article => ({
          title: article.title?.en || article.title,
          category: article.category?.name || 'Unknown',
          tags: article.tags || [],
          publishedAt: article.publishedAt
        })).map(item => `- ${item.title} (${item.category}) [${item.tags.join(', ')}]`).join('\n')}

        User Interests: ${userProfile.interests?.join(', ') || 'None specified'}
        Preferred Categories: ${userProfile.preferredCategories?.join(', ') || 'None specified'}

        Generate insights about:
        1. Reading patterns and preferences
        2. Topic interests and trends
        3. Content quality preferences
        4. Reading time patterns
        5. Suggestions for content discovery

        Respond with a JSON object containing:
        {
          "readingPatterns": {
            "favoriteCategories": ["category1", "category2"],
            "favoriteTopics": ["topic1", "topic2"],
            "readingFrequency": "daily|weekly|occasional",
            "preferredContentLength": "short|medium|long"
          },
          "insights": [
            {
              "type": "pattern|preference|suggestion",
              "title": "Insight title",
              "description": "Detailed description",
              "confidence": 0.85
            }
          ],
          "recommendations": [
            {
              "type": "category|topic|author",
              "suggestion": "Try exploring [suggestion]",
              "reason": "Based on your interest in [reason]"
            }
          ]
        }
      `;

      const result = await this.model.generateContent(prompt);
      const response = result.response.text();
      
      try {
        const insights = JSON.parse(response);
        return {
          insights: insights.insights || [],
          readingPatterns: insights.readingPatterns || {},
          recommendations: insights.recommendations || [],
          generatedAt: new Date()
        };
      } catch {
        return {
          insights: [],
          message: 'Unable to generate insights at this time'
        };
      }
    } catch (error) {
      logger.error('User insights generation error:', error);
      return {
        insights: [],
        message: 'Error generating insights'
      };
    }
  }

  /**
   * Deduplicate and Shuffle Recommendations
   */
  deduplicateAndShuffle(recommendations, limit) {
    const seen = new Set();
    const unique = recommendations.filter(rec => {
      const id = rec._id?.toString();
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    });

    // Shuffle array
    for (let i = unique.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [unique[i], unique[j]] = [unique[j], unique[i]];
    }

    return unique.slice(0, limit);
  }

  /**
   * Add Diversity to Content
   */
  addDiversityToContent(content, limit) {
    const diversified = [];
    const categoryCount = new Map();

    // Sort by quality score first
    const sortedContent = content.sort((a, b) => 
      (b.qualityAssessment?.overallScore || 0) - (a.qualityAssessment?.overallScore || 0)
    );

    // Add content ensuring category diversity
    for (const article of sortedContent) {
      if (diversified.length >= limit) break;

      const category = article.category?.name || 'Unknown';
      const count = categoryCount.get(category) || 0;
      
      // Allow max 2 articles per category for diversity
      if (count < 2) {
        diversified.push(article);
        categoryCount.set(category, count + 1);
      }
    }

    // Fill remaining slots if needed
    if (diversified.length < limit) {
      const remaining = sortedContent.filter(article => 
        !diversified.some(d => d._id.toString() === article._id.toString())
      );
      diversified.push(...remaining.slice(0, limit - diversified.length));
    }

    return diversified;
  }

  /**
   * Calculate Category Score
   */
  calculateCategoryScore(article, userCategories) {
    let score = 0;
    
    // Base quality score
    score += (article.qualityAssessment?.overallScore || 0) * 0.4;
    
    // Category match bonus
    if (userCategories.includes(article.category?.toString())) {
      score += 30;
    }
    
    // Recency bonus
    const ageInHours = (Date.now() - new Date(article.publishedAt)) / (1000 * 60 * 60);
    const recencyScore = Math.max(0, 100 - ageInHours);
    score += recencyScore * 0.3;
    
    return Math.min(100, score);
  }

  /**
   * Enhanced Trending Recommendations with Time Range
   */
  async getTrendingRecommendations(limit, language, timeRange = '24h') {
    try {
      let timeFilter;
      switch (timeRange) {
        case '1h':
          timeFilter = new Date(Date.now() - 60 * 60 * 1000);
          break;
        case '24h':
          timeFilter = new Date(Date.now() - 24 * 60 * 60 * 1000);
          break;
        case '7d':
          timeFilter = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          timeFilter = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          timeFilter = new Date(Date.now() - 24 * 60 * 60 * 1000);
      }
      
      const trending = await News.find({
        status: 'published',
        publishedAt: { $gte: timeFilter }
      })
      .populate('category', 'name')
      .populate('author', 'name profileImage')
      .sort({ views: -1, publishedAt: -1 })
      .limit(limit)
      .select('title slug description thumbnail publishedAt views category author qualityAssessment tags');

      return trending.map(article => ({
        ...article.toObject(),
        recommendationScore: this.calculateTrendingScore(article, timeRange),
        recommendationType: 'trending'
      }));
    } catch (error) {
      logger.error('Trending recommendations error:', error);
      return [];
    }
  }

  /**
   * Enhanced Trending Score with Time Range
   */
  calculateTrendingScore(article, timeRange) {
    const ageInHours = (Date.now() - new Date(article.publishedAt)) / (1000 * 60 * 60);
    const views = article.views || 0;
    
    // Adjust scoring based on time range
    let timeMultiplier = 1;
    switch (timeRange) {
      case '1h':
        timeMultiplier = 2;
        break;
      case '24h':
        timeMultiplier = 1.5;
        break;
      case '7d':
        timeMultiplier = 1;
        break;
      case '30d':
        timeMultiplier = 0.8;
        break;
    }
    
    const trendingScore = (views / Math.max(1, ageInHours)) * 10 * timeMultiplier;
    return Math.min(100, trendingScore);
  }
}

export default AIRecommendationEngine;
