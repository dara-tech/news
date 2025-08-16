import mongoose from 'mongoose';
import Settings from '../models/Settings.mjs';

class RateLimitManager {
  constructor() {
    this.rateLimits = new Map();
    this.lastPostTimes = new Map();
  }

  /**
   * Get rate limit configuration for a platform
   */
  getRateLimitConfig(platform) {
    const configs = {
      twitter: {
        postsPerHour: 25,
        postsPerDay: 100,
        minDelayBetweenPosts: 30000, // 30 seconds
        retryDelay: 60000, // 1 minute
        maxRetries: 3
      },
      facebook: {
        postsPerHour: 50,
        postsPerDay: 200,
        minDelayBetweenPosts: 15000, // 15 seconds
        retryDelay: 30000, // 30 seconds
        maxRetries: 3
      },
      linkedin: {
        postsPerHour: 20,
        postsPerDay: 50,
        minDelayBetweenPosts: 60000, // 1 minute
        retryDelay: 120000, // 2 minutes
        maxRetries: 3
      },
      instagram: {
        postsPerHour: 25,
        postsPerDay: 100,
        minDelayBetweenPosts: 60000, // 1 minute
        retryDelay: 120000, // 2 minutes
        maxRetries: 3
      },
      telegram: {
        postsPerHour: 30,
        postsPerDay: 100,
        minDelayBetweenPosts: 20000, // 20 seconds
        retryDelay: 30000, // 30 seconds
        maxRetries: 3
      }
    };

    return configs[platform] || {
      postsPerHour: 30,
      postsPerDay: 100,
      minDelayBetweenPosts: 30000,
      retryDelay: 60000,
      maxRetries: 3
    };
  }

  /**
   * Check if we can post to a platform based on rate limits
   */
  async canPost(platform) {
    const config = this.getRateLimitConfig(platform);
    const now = Date.now();
    
    // Get platform-specific rate limit data
    const platformKey = `${platform}_rate_limit`;
    let rateLimitData = this.rateLimits.get(platformKey) || {
      hourlyPosts: [],
      dailyPosts: [],
      lastPostTime: 0
    };

    // Clean up old entries
    const oneHourAgo = now - (60 * 60 * 1000);
    const oneDayAgo = now - (24 * 60 * 60 * 1000);
    
    rateLimitData.hourlyPosts = rateLimitData.hourlyPosts.filter(time => time > oneHourAgo);
    rateLimitData.dailyPosts = rateLimitData.dailyPosts.filter(time => time > oneDayAgo);

    // Check hourly limit
    if (rateLimitData.hourlyPosts.length >= config.postsPerHour) {
      const oldestPost = Math.min(...rateLimitData.hourlyPosts);
      const timeUntilReset = oldestPost + (60 * 60 * 1000) - now;
      return {
        canPost: false,
        reason: 'hourly_limit_exceeded',
        waitTime: Math.max(0, timeUntilReset),
        message: `Hourly limit exceeded. Wait ${Math.ceil(timeUntilReset / 60000)} minutes.`
      };
    }

    // Check daily limit
    if (rateLimitData.dailyPosts.length >= config.postsPerDay) {
      const oldestPost = Math.min(...rateLimitData.dailyPosts);
      const timeUntilReset = oldestPost + (24 * 60 * 60 * 1000) - now;
      return {
        canPost: false,
        reason: 'daily_limit_exceeded',
        waitTime: Math.max(0, timeUntilReset),
        message: `Daily limit exceeded. Wait ${Math.ceil(timeUntilReset / (60 * 60 * 1000))} hours.`
      };
    }

    // Check minimum delay between posts
    if (rateLimitData.lastPostTime > 0) {
      const timeSinceLastPost = now - rateLimitData.lastPostTime;
      if (timeSinceLastPost < config.minDelayBetweenPosts) {
        const waitTime = config.minDelayBetweenPosts - timeSinceLastPost;
        return {
          canPost: false,
          reason: 'min_delay_not_met',
          waitTime: waitTime,
          message: `Wait ${Math.ceil(waitTime / 1000)} seconds before next post.`
        };
      }
    }

    return { canPost: true };
  }

  /**
   * Record a successful post to update rate limits
   */
  recordPost(platform) {
    const now = Date.now();
    const platformKey = `${platform}_rate_limit`;
    
    let rateLimitData = this.rateLimits.get(platformKey) || {
      hourlyPosts: [],
      dailyPosts: [],
      lastPostTime: 0
    };

    // Add current post to tracking
    rateLimitData.hourlyPosts.push(now);
    rateLimitData.dailyPosts.push(now);
    rateLimitData.lastPostTime = now;

    // Store updated data
    this.rateLimits.set(platformKey, rateLimitData);

    console.log(`📊 Rate limit updated for ${platform}: ${rateLimitData.hourlyPosts.length}/${this.getRateLimitConfig(platform).postsPerHour} hourly posts`);
  }

  /**
   * Handle rate limit errors with exponential backoff
   */
  async handleRateLimitError(platform, attempt = 1) {
    const config = this.getRateLimitConfig(platform);
    
    if (attempt > config.maxRetries) {
      throw new Error(`Rate limit exceeded for ${platform} after ${config.maxRetries} attempts`);
    }

    // Exponential backoff: base delay * 2^(attempt-1)
    const baseDelay = config.retryDelay;
    const delay = baseDelay * Math.pow(2, attempt - 1);
    
    console.log(`⏳ Rate limit hit for ${platform}. Waiting ${delay / 1000} seconds before retry ${attempt}/${config.maxRetries}`);
    
    await this.sleep(delay);
    
    return delay;
  }

  /**
   * Sleep utility function
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get current rate limit status for all platforms
   */
  getRateLimitStatus() {
    const status = {};
    const platforms = ['twitter', 'facebook', 'linkedin', 'instagram', 'telegram'];
    
    for (const platform of platforms) {
      const config = this.getRateLimitConfig(platform);
      const platformKey = `${platform}_rate_limit`;
      const data = this.rateLimits.get(platformKey) || {
        hourlyPosts: [],
        dailyPosts: [],
        lastPostTime: 0
      };

      const now = Date.now();
      const oneHourAgo = now - (60 * 60 * 1000);
      const oneDayAgo = now - (24 * 60 * 60 * 1000);
      
      const hourlyPosts = data.hourlyPosts.filter(time => time > oneHourAgo);
      const dailyPosts = data.dailyPosts.filter(time => time > oneDayAgo);

      status[platform] = {
        hourlyUsed: hourlyPosts.length,
        hourlyLimit: config.postsPerHour,
        dailyUsed: dailyPosts.length,
        dailyLimit: config.postsPerDay,
        lastPostTime: data.lastPostTime ? new Date(data.lastPostTime) : null,
        canPost: hourlyPosts.length < config.postsPerHour && dailyPosts.length < config.postsPerDay
      };
    }

    return status;
  }

  /**
   * Reset rate limits for a platform (useful for testing)
   */
  resetRateLimits(platform) {
    const platformKey = `${platform}_rate_limit`;
    this.rateLimits.delete(platformKey);
    console.log(`🔄 Rate limits reset for ${platform}`);
  }

  /**
   * Get recommended delay for next post
   */
  getRecommendedDelay(platform) {
    const config = this.getRateLimitConfig(platform);
    const platformKey = `${platform}_rate_limit`;
    const data = this.rateLimits.get(platformKey);
    
    if (!data || data.lastPostTime === 0) {
      return 0; // No previous posts
    }

    const timeSinceLastPost = Date.now() - data.lastPostTime;
    const recommendedDelay = Math.max(0, config.minDelayBetweenPosts - timeSinceLastPost);
    
    return recommendedDelay;
  }
}

export default RateLimitManager;
