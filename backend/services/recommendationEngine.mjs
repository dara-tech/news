#!/usr/bin/env node

/**
 * Content Recommendation Engine
 * Machine learning-powered content recommendations
 */

import News from '../models/News.mjs';
import User from '../models/User.mjs';
import logger from '../utils/logger.mjs';

class RecommendationEngine {
  constructor() {
    this.userProfiles = new Map();
    this.contentVectors = new Map();
    this.similarityMatrix = new Map();
    
    this.initializeEngine();
  }

  async initializeEngine() {
    try {
      await this.buildUserProfiles();
      await this.buildContentVectors();
      await this.calculateSimilarities();
      
      logger.info('Recommendation engine initialized');
    } catch (error) {
      logger.error('Recommendation engine initialization error:', error);
    }
  }

  /**
   * Get Personalized Recommendations
   */
  async getRecommendations(userId, options = {}) {
    try {
      const {
        limit = 10,
        excludeRead = true,
        categories = [],
        language = 'en'
      } = options;

      // Get user profile
      const userProfile = await this.getUserProfile(userId);
      
      // Get different types of recommendations
      const [
        collaborative,
        contentBased,
        trending,
        quality
      ] = await Promise.all([
        this.getCollaborativeRecommendations(userId, limit),
        this.getContentBasedRecommendations(userProfile, limit),
        this.getTrendingRecommendations(limit),
        this.getQualityRecommendations(limit)
      ]);

      // Combine recommendations with weighted scoring
      const combined = this.combineRecommendations([
        { type: 'collaborative', weight: 0.35, items: collaborative },
        { type: 'content-based', weight: 0.30, items: contentBased },
        { type: 'trending', weight: 0.20, items: trending },
        { type: 'quality', weight: 0.15, items: quality }
      ]);

      // Apply filters
      let filtered = combined;
      
      if (excludeRead && userProfile.readArticles) {
        filtered = filtered.filter(item => 
          !userProfile.readArticles.includes(item._id.toString())
        );
      }

      if (categories.length > 0) {
        filtered = filtered.filter(item => 
          categories.includes(item.category?._id?.toString())
        );
      }

      // Add diversity to prevent filter bubbles
      const diversified = this.addDiversity(filtered, userProfile);

      return {
        recommendations: diversified.slice(0, limit),
        metadata: {
          algorithm: 'hybrid',
          factors: ['collaborative', 'content-based', 'trending', 'quality'],
          userId,
          generatedAt: new Date()
        }
      };
    } catch (error) {
      logger.error('Get recommendations error:', error);
      return this.getFallbackRecommendations(limit);
    }
  }

  /**
   * Collaborative Filtering
   */
  async getCollaborativeRecommendations(userId, limit) {
    try {
      // Find users with similar reading patterns
      const userProfile = this.userProfiles.get(userId);
      if (!userProfile || !userProfile.readArticles) {
        return this.getPopularRecommendations(limit);
      }

      const similarUsers = await this.findSimilarUsers(userId);
      const recommendations = new Map();

      for (const similarUser of similarUsers) {
        const similarity = similarUser.similarity;
        const articles = similarUser.readArticles || [];
        
        for (const articleId of articles) {
          if (!userProfile.readArticles.includes(articleId)) {
            const score = recommendations.get(articleId) || 0;
            recommendations.set(articleId, score + similarity);
          }
        }
      }

      // Get article details
      const articleIds = Array.from(recommendations.keys()).slice(0, limit * 2);
      const articles = await News.find({
        _id: { $in: articleIds },
        status: 'published'
      })
      .populate('category', 'name')
      .populate('author', 'name profileImage')
      .select('title slug description thumbnail publishedAt views category author qualityAssessment');

      return articles.map(article => ({
        ...article.toObject(),
        recommendationScore: recommendations.get(article._id.toString()) || 0,
        recommendationType: 'collaborative'
      }));
    } catch (error) {
      logger.error('Collaborative filtering error:', error);
      return [];
    }
  }

  /**
   * Content-Based Filtering
   */
  async getContentBasedRecommendations(userProfile, limit) {
    try {
      if (!userProfile.interests || userProfile.interests.length === 0) {
        return this.getPopularRecommendations(limit);
      }

      const query = {
        status: 'published',
        $or: [
          { tags: { $in: userProfile.interests } },
          { category: { $in: userProfile.preferredCategories || [] } }
        ]
      };

      const articles = await News.find(query)
        .populate('category', 'name')
        .populate('author', 'name profileImage')
        .sort({ 'qualityAssessment.overallScore': -1, publishedAt: -1 })
        .limit(limit)
        .select('title slug description thumbnail publishedAt views category author qualityAssessment tags');

      return articles.map(article => ({
        ...article.toObject(),
        recommendationScore: this.calculateContentScore(article, userProfile),
        recommendationType: 'content-based'
      }));
    } catch (error) {
      logger.error('Content-based filtering error:', error);
      return [];
    }
  }

  /**
   * Trending Recommendations
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
      .select('title slug description thumbnail publishedAt views category author qualityAssessment');

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
   * Quality-Based Recommendations
   */
  async getQualityRecommendations(limit) {
    try {
      const articles = await News.find({
        status: 'published',
        'qualityAssessment.overallScore': { $gte: 85 }
      })
      .populate('category', 'name')
      .populate('author', 'name profileImage')
      .sort({ 'qualityAssessment.overallScore': -1 })
      .limit(limit)
      .select('title slug description thumbnail publishedAt views category author qualityAssessment');

      return articles.map(article => ({
        ...article.toObject(),
        recommendationScore: article.qualityAssessment?.overallScore || 0,
        recommendationType: 'quality'
      }));
    } catch (error) {
      logger.error('Quality recommendations error:', error);
      return [];
    }
  }

  /**
   * Build User Profiles
   */
  async buildUserProfiles() {
    try {
      const users = await User.find().select('_id preferences interests');
      
      for (const user of users) {
        this.userProfiles.set(user._id.toString(), {
          interests: user.interests || [],
          preferredCategories: user.preferences?.categories || [],
          readArticles: [], // This would be populated from user activity
          language: user.preferences?.language || 'en'
        });
      }

      logger.info(`Built profiles for ${users.length} users`);
    } catch (error) {
      logger.error('Build user profiles error:', error);
    }
  }

  /**
   * Build Content Vectors
   */
  async buildContentVectors() {
    try {
      const articles = await News.find({ status: 'published' })
        .select('title content description tags category');

      for (const article of articles) {
        const vector = this.createContentVector(article);
        this.contentVectors.set(article._id.toString(), vector);
      }

      logger.info(`Built vectors for ${articles.length} articles`);
    } catch (error) {
      logger.error('Build content vectors error:', error);
    }
  }

  /**
   * Calculate Content Similarities
   */
  async calculateSimilarities() {
    try {
      const articles = Array.from(this.contentVectors.keys());
      let comparisons = 0;

      for (let i = 0; i < articles.length; i++) {
        for (let j = i + 1; j < articles.length; j++) {
          const similarity = this.calculateCosineSimilarity(
            this.contentVectors.get(articles[i]),
            this.contentVectors.get(articles[j])
          );
          
          this.similarityMatrix.set(`${articles[i]}-${articles[j]}`, similarity);
          comparisons++;
        }
      }

      logger.info(`Calculated ${comparisons} content similarities`);
    } catch (error) {
      logger.error('Calculate similarities error:', error);
    }
  }

  /**
   * Helper Methods
   */
  createContentVector(article) {
    // Simple TF-IDF-like vector creation
    const text = `${article.title?.en || ''} ${article.description?.en || ''} ${(article.tags || []).join(' ')}`;
    const words = text.toLowerCase().split(/\s+/).filter(word => word.length > 2);
    
    const wordCount = {};
    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });

    return wordCount;
  }

  calculateCosineSimilarity(vector1, vector2) {
    const keys1 = Object.keys(vector1);
    const keys2 = Object.keys(vector2);
    const allKeys = [...new Set([...keys1, ...keys2])];

    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (const key of allKeys) {
      const val1 = vector1[key] || 0;
      const val2 = vector2[key] || 0;
      
      dotProduct += val1 * val2;
      norm1 += val1 * val1;
      norm2 += val2 * val2;
    }

    if (norm1 === 0 || norm2 === 0) return 0;
    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
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

  addDiversity(recommendations, userProfile) {
    // Add diversity to prevent filter bubbles
    const diversified = [];
    const usedCategories = new Set();
    
    for (const rec of recommendations) {
      const categoryId = rec.category?._id?.toString();
      
      if (!categoryId || !usedCategories.has(categoryId) || usedCategories.size < 3) {
        diversified.push(rec);
        if (categoryId) usedCategories.add(categoryId);
      }
      
      if (diversified.length >= recommendations.length * 0.8) break;
    }

    // Fill remaining slots with best recommendations
    const remaining = recommendations.filter(r => !diversified.includes(r));
    diversified.push(...remaining.slice(0, recommendations.length - diversified.length));

    return diversified;
  }

  async getUserProfile(userId) {
    return this.userProfiles.get(userId) || {
      interests: [],
      preferredCategories: [],
      readArticles: [],
      language: 'en'
    };
  }

  async findSimilarUsers(userId) {
    // Placeholder for collaborative filtering
    return [];
  }

  calculateContentScore(article, userProfile) {
    let score = 0;
    
    // Quality score
    score += (article.qualityAssessment?.overallScore || 0) * 0.4;
    
    // Interest matching
    const articleTags = article.tags || [];
    const userInterests = userProfile.interests || [];
    const matches = articleTags.filter(tag => 
      userInterests.some(interest => 
        interest.toLowerCase().includes(tag.toLowerCase())
      )
    ).length;
    score += matches * 15;
    
    // Recency
    const ageInHours = (Date.now() - new Date(article.publishedAt)) / (1000 * 60 * 60);
    const recencyScore = Math.max(0, 100 - ageInHours * 2);
    score += recencyScore * 0.3;
    
    return Math.min(100, score);
  }

  calculateTrendingScore(article) {
    const ageInHours = (Date.now() - new Date(article.publishedAt)) / (1000 * 60 * 60);
    const views = article.views || 0;
    
    // Viral coefficient
    const viralScore = views / Math.max(1, ageInHours);
    return Math.min(100, viralScore * 10);
  }

  async getPopularRecommendations(limit) {
    try {
      const popular = await News.find({ status: 'published' })
        .populate('category', 'name')
        .populate('author', 'name profileImage')
        .sort({ views: -1 })
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
      const recent = await News.find({ status: 'published' })
        .populate('category', 'name')
        .populate('author', 'name profileImage')
        .sort({ publishedAt: -1 })
        .limit(limit)
        .select('title slug description thumbnail publishedAt views category author qualityAssessment');

      return {
        recommendations: recent.map(article => ({
          ...article.toObject(),
          recommendationScore: 50,
          recommendationType: 'fallback'
        })),
        metadata: {
          algorithm: 'fallback',
          generatedAt: new Date()
        }
      };
    } catch (error) {
      logger.error('Fallback recommendations error:', error);
      return { recommendations: [], metadata: {} };
    }
  }
}

export default RecommendationEngine;
