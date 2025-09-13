#!/usr/bin/env node

/**
 * Test script for AI Recommendation System
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import AIRecommendationEngine from './backend/services/aiRecommendationEngine.mjs';
import News from './backend/models/News.mjs';
import User from './backend/models/User.mjs';
import logger from './backend/utils/logger.mjs';

// Load environment variables
dotenv.config({ path: './backend/.env' });

async function testRecommendationSystem() {
  logger.info('🧪 Testing AI Recommendation System...\n');

  try {
    // Check environment variables
    logger.info('📋 Environment Check:');
    logger.info('- GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? '✅ Set' : '❌ Missing');
    logger.info('- MONGODB_URI:', process.env.MONGODB_URI ? '✅ Set' : '❌ Missing');
    logger.info('');

    if (!process.env.GEMINI_API_KEY) {
      logger.error('❌ GEMINI_API_KEY is required for AI recommendations');
      return;
    }

    if (!process.env.MONGODB_URI) {
      logger.error('❌ MONGODB_URI is required for database connection');
      return;
    }

    // Connect to database
    logger.info('🔌 Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI);
    logger.info('✅ Database connected');

    // Initialize recommendation engine
    logger.info('🤖 Initializing AI Recommendation Engine...');
    const recommendationEngine = new AIRecommendationEngine();
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for initialization
    logger.info('✅ Recommendation engine initialized');

    // Test 1: Get trending recommendations
    logger.info('\n📈 Test 1: Trending Recommendations');
    try {
      const trendingRecs = await recommendationEngine.getTrendingRecommendations(5);
      logger.info(`✅ Got ${trendingRecs.length} trending recommendations`);
      if (trendingRecs.length > 0) {
        logger.info('Sample recommendation:', {
          title: trendingRecs[0].title?.en || trendingRecs[0].title,
          type: trendingRecs[0].recommendationType,
          score: trendingRecs[0].recommendationScore
        });
      }
    } catch (error) {
      logger.error('❌ Trending recommendations failed:', error.message);
    }

    // Test 2: Get explore content
    logger.info('\n🔍 Test 2: Explore Content');
    try {
      const exploreContent = await recommendationEngine.getExploreContent(5);
      logger.info(`✅ Got ${exploreContent.length} explore recommendations`);
      if (exploreContent.length > 0) {
        logger.info('Sample explore content:', {
          title: exploreContent[0].title?.en || exploreContent[0].title,
          type: exploreContent[0].recommendationType,
          score: exploreContent[0].recommendationScore
        });
      }
    } catch (error) {
      logger.error('❌ Explore content failed:', error.message);
    }

    // Test 3: Get a user for personalized recommendations
    logger.info('\n👤 Test 3: Personalized Recommendations');
    try {
      const testUser = await User.findOne().select('_id preferences interests');
      if (testUser) {
        logger.info(`Testing with user: ${testUser._id}`);
        const personalizedRecs = await recommendationEngine.getPersonalizedRecommendations(
          testUser._id, 
          { limit: 5, language: 'en' }
        );
        logger.info(`✅ Got ${personalizedRecs.recommendations?.length || 0} personalized recommendations`);
        if (personalizedRecs.recommendations?.length > 0) {
          logger.info('Sample personalized recommendation:', {
            title: personalizedRecs.recommendations[0].title?.en || personalizedRecs.recommendations[0].title,
            type: personalizedRecs.recommendations[0].recommendationType,
            score: personalizedRecs.recommendations[0].recommendationScore
          });
        }
      } else {
        logger.info('ℹ️ No users found for personalized recommendations test');
      }
    } catch (error) {
      logger.error('❌ Personalized recommendations failed:', error.message);
    }

    // Test 4: Test AI content analysis
    logger.info('\n🧠 Test 4: AI Content Analysis');
    try {
      const articles = await News.find({ status: 'published' }).limit(2);
      if (articles.length >= 2) {
        logger.info('Testing content similarity analysis...');
        const similarity = await recommendationEngine.analyzeContentSimilarity(articles[0], articles[1]);
        logger.info(`✅ Content similarity score: ${similarity}%`);
      } else {
        logger.info('ℹ️ Not enough articles for similarity analysis');
      }
    } catch (error) {
      logger.error('❌ AI content analysis failed:', error.message);
    }

    // Test 5: Test content tag generation
    logger.info('\n🏷️ Test 5: AI Tag Generation');
    try {
      const article = await News.findOne({ status: 'published' });
      if (article) {
        logger.info('Generating AI tags for article...');
        const tags = await recommendationEngine.generateContentTags(article);
        logger.info(`✅ Generated ${tags.length} tags:`, tags);
      } else {
        logger.info('ℹ️ No articles found for tag generation test');
      }
    } catch (error) {
      logger.error('❌ AI tag generation failed:', error.message);
    }

    logger.info('\n✅ Recommendation system testing completed!');

  } catch (error) {
    logger.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    logger.info('🔌 Database disconnected');
  }
}

// Run the test
testRecommendationSystem();
