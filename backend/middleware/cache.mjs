/**
 * Caching Middleware
 * Implements Redis-based caching for improved performance
 */

import logger from '../utils/logger.mjs';

// Simple in-memory cache for development
// In production, this should be replaced with Redis
class MemoryCache {
  constructor() {
    this.cache = new Map();
    this.ttl = new Map();
  }

  set(key, value, ttlSeconds = 300) {
    this.cache.set(key, value);
    this.ttl.set(key, Date.now() + (ttlSeconds * 1000));
  }

  get(key) {
    if (!this.cache.has(key)) {
      return null;
    }

    const expiry = this.ttl.get(key);
    if (Date.now() > expiry) {
      this.cache.delete(key);
      this.ttl.delete(key);
      return null;
    }

    return this.cache.get(key);
  }

  delete(key) {
    this.cache.delete(key);
    this.ttl.delete(key);
  }

  clear() {
    this.cache.clear();
    this.ttl.clear();
  }

  size() {
    return this.cache.size;
  }
}

const cache = new MemoryCache();

/**
 * Cache middleware for GET requests
 */
export const cacheMiddleware = (ttlSeconds = 300) => {
  return (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Generate cache key
    const cacheKey = `${req.originalUrl}:${JSON.stringify(req.query)}`;
    
    // Check cache
    const cachedResponse = cache.get(cacheKey);
    if (cachedResponse) {
      logger.debug(`Cache hit for ${cacheKey}`);
      return res.json(cachedResponse);
    }

    // Store original res.json
    const originalJson = res.json.bind(res);
    
    // Override res.json to cache the response
    res.json = (data) => {
      // Cache the response
      cache.set(cacheKey, data, ttlSeconds);
      logger.debug(`Cached response for ${cacheKey}`);
      
      // Send the response
      return originalJson(data);
    };

    next();
  };
};

/**
 * Clear cache for specific patterns
 */
export const clearCache = (pattern) => {
  if (pattern) {
    // Clear specific pattern
    for (const key of cache.cache.keys()) {
      if (key.includes(pattern)) {
        cache.delete(key);
      }
    }
    logger.info(`Cleared cache for pattern: ${pattern}`);
  } else {
    // Clear all cache
    cache.clear();
    logger.info('Cleared all cache');
  }
};

/**
 * Cache statistics
 */
export const getCacheStats = () => {
  return {
    size: cache.size(),
    keys: Array.from(cache.cache.keys())
  };
};

export default cache;
