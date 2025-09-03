import logger from '../utils/logger.mjs';

class RedisCacheService {
  constructor() {
    this.cache = new Map(); // In-memory cache for development
    this.ttl = new Map(); // TTL tracking
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      size: 0
    };
    this.maxSize = 1000; // Maximum cache size
    this.defaultTTL = 300; // 5 minutes default TTL
    
    // Cleanup expired entries every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpired();
    }, 60000);
  }

  /**
   * Get value from cache
   */
  async get(key) {
    try {
      if (this.cache.has(key)) {
        const ttl = this.ttl.get(key);
        if (ttl && Date.now() > ttl) {
          // Expired
          this.delete(key);
          this.stats.misses++;
          return null;
        }
        
        this.stats.hits++;
        logger.debug(`Cache hit for key: ${key}`);
        return this.cache.get(key);
      }
      
      this.stats.misses++;
      logger.debug(`Cache miss for key: ${key}`);
      return null;
    } catch (error) {
      logger.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * Set value in cache with TTL
   */
  async set(key, value, ttlSeconds = this.defaultTTL) {
    try {
      // Check cache size limit
      if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
        this.evictOldest();
      }

      this.cache.set(key, value);
      this.ttl.set(key, Date.now() + (ttlSeconds * 1000));
      this.stats.sets++;
      this.stats.size = this.cache.size;
      
      logger.debug(`Cache set for key: ${key}, TTL: ${ttlSeconds}s`);
      return true;
    } catch (error) {
      logger.error('Cache set error:', error);
      return false;
    }
  }

  /**
   * Delete value from cache
   */
  async delete(key) {
    try {
      const deleted = this.cache.delete(key);
      this.ttl.delete(key);
      if (deleted) {
        this.stats.deletes++;
        this.stats.size = this.cache.size;
      }
      logger.debug(`Cache delete for key: ${key}`);
      return deleted;
    } catch (error) {
      logger.error('Cache delete error:', error);
      return false;
    }
  }

  /**
   * Delete multiple keys matching pattern
   */
  async deletePattern(pattern) {
    try {
      const regex = new RegExp(pattern.replace(/\*/g, '.*'));
      let deletedCount = 0;
      
      for (const key of this.cache.keys()) {
        if (regex.test(key)) {
          await this.delete(key);
          deletedCount++;
        }
      }
      
      logger.info(`Cache pattern delete: ${pattern}, deleted: ${deletedCount} keys`);
      return deletedCount;
    } catch (error) {
      logger.error('Cache pattern delete error:', error);
      return 0;
    }
  }

  /**
   * Check if key exists in cache
   */
  async exists(key) {
    try {
      if (this.cache.has(key)) {
        const ttl = this.ttl.get(key);
        if (ttl && Date.now() > ttl) {
          this.delete(key);
          return false;
        }
        return true;
      }
      return false;
    } catch (error) {
      logger.error('Cache exists error:', error);
      return false;
    }
  }

  /**
   * Get or set pattern (cache-aside)
   */
  async getOrSet(key, fetchFunction, ttlSeconds = this.defaultTTL) {
    try {
      let value = await this.get(key);
      
      if (value === null) {
        value = await fetchFunction();
        if (value !== null && value !== undefined) {
          await this.set(key, value, ttlSeconds);
        }
      }
      
      return value;
    } catch (error) {
      logger.error('Cache getOrSet error:', error);
      // Fallback to fetch function
      try {
        return await fetchFunction();
      } catch (fetchError) {
        logger.error('Fetch function error:', fetchError);
        return null;
      }
    }
  }

  /**
   * Clear all cache
   */
  async clear() {
    try {
      this.cache.clear();
      this.ttl.clear();
      this.stats.size = 0;
      logger.info('Cache cleared');
      return true;
    } catch (error) {
      logger.error('Cache clear error:', error);
      return false;
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const hitRate = this.stats.hits + this.stats.misses > 0 
      ? (this.stats.hits / (this.stats.hits + this.stats.misses) * 100).toFixed(2)
      : 0;

    return {
      ...this.stats,
      hitRate: `${hitRate}%`,
      memoryUsage: this.getMemoryUsage()
    };
  }

  /**
   * Get memory usage estimate
   */
  getMemoryUsage() {
    let totalSize = 0;
    for (const [key, value] of this.cache.entries()) {
      totalSize += key.length * 2; // UTF-16
      totalSize += JSON.stringify(value).length * 2;
    }
    return `${(totalSize / 1024).toFixed(2)} KB`;
  }

  /**
   * Cleanup expired entries
   */
  cleanupExpired() {
    try {
      const now = Date.now();
      let cleanedCount = 0;
      
      for (const [key, ttl] of this.ttl.entries()) {
        if (ttl && now > ttl) {
          this.cache.delete(key);
          this.ttl.delete(key);
          cleanedCount++;
        }
      }
      
      if (cleanedCount > 0) {
        this.stats.size = this.cache.size;
        logger.debug(`Cache cleanup: removed ${cleanedCount} expired entries`);
      }
    } catch (error) {
      logger.error('Cache cleanup error:', error);
    }
  }

  /**
   * Evict oldest entries when cache is full
   */
  evictOldest() {
    try {
      let oldestKey = null;
      let oldestTime = Date.now();
      
      for (const [key, ttl] of this.ttl.entries()) {
        if (ttl < oldestTime) {
          oldestTime = ttl;
          oldestKey = key;
        }
      }
      
      if (oldestKey) {
        this.delete(oldestKey);
        logger.debug(`Cache eviction: removed oldest key: ${oldestKey}`);
      }
    } catch (error) {
      logger.error('Cache eviction error:', error);
    }
  }

  /**
   * Cache middleware for Express routes
   */
  middleware(ttlSeconds = this.defaultTTL) {
    return (req, res, next) => {
      const key = `route:${req.method}:${req.originalUrl}`;
      
      // Only cache GET requests
      if (req.method !== 'GET') {
        return next();
      }

      this.get(key).then(cached => {
        if (cached) {
          logger.debug(`Cache middleware hit: ${key}`);
          return res.json(cached);
        }

        // Store original res.json
        const originalJson = res.json.bind(res);
        
        // Override res.json to cache the response
        res.json = (data) => {
          this.set(key, data, ttlSeconds);
          return originalJson(data);
        };

        next();
      }).catch(error => {
        logger.error('Cache middleware error:', error);
        next();
      });
    };
  }

  /**
   * Cache for database queries
   */
  async cacheQuery(queryKey, queryFunction, ttlSeconds = this.defaultTTL) {
    return this.getOrSet(`query:${queryKey}`, queryFunction, ttlSeconds);
  }

  /**
   * Cache for API responses
   */
  async cacheApiResponse(apiKey, apiFunction, ttlSeconds = this.defaultTTL) {
    return this.getOrSet(`api:${apiKey}`, apiFunction, ttlSeconds);
  }

  /**
   * Cache for user sessions
   */
  async cacheUserSession(userId, sessionData, ttlSeconds = 3600) { // 1 hour
    return this.set(`session:${userId}`, sessionData, ttlSeconds);
  }

  /**
   * Get user session
   */
  async getUserSession(userId) {
    return this.get(`session:${userId}`);
  }

  /**
   * Invalidate user-related cache
   */
  async invalidateUserCache(userId) {
    const patterns = [
      `session:${userId}`,
      `user:${userId}:*`,
      `news:author:${userId}:*`
    ];
    
    let totalDeleted = 0;
    for (const pattern of patterns) {
      totalDeleted += await this.deletePattern(pattern);
    }
    
    return totalDeleted;
  }

  /**
   * Invalidate news-related cache
   */
  async invalidateNewsCache(newsId = null) {
    const patterns = [
      'news:*',
      'category:*',
      'trending:*',
      'featured:*'
    ];
    
    if (newsId) {
      patterns.push(`news:${newsId}`);
    }
    
    let totalDeleted = 0;
    for (const pattern of patterns) {
      totalDeleted += await this.deletePattern(pattern);
    }
    
    return totalDeleted;
  }

  /**
   * Shutdown cache service
   */
  shutdown() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.clear();
    logger.info('Cache service shutdown');
  }
}

export default new RedisCacheService();
