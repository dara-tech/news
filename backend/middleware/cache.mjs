import NodeCache from 'node-cache';
import logger from '../utils/logger.mjs';

// Create cache instance with optimized settings
const cache = new NodeCache({
  stdTTL: 300, // 5 minutes default TTL
  checkperiod: 60, // Check for expired keys every minute
  useClones: false, // Don't clone objects for better performance
  maxKeys: 1000, // Limit cache size
  deleteOnExpire: true, // Auto-delete expired keys
});

// Cache key generators
const cacheKeys = {
  news: (query) => `news:${JSON.stringify(query)}`,
  newsById: (id) => `news:${id}`,
  newsBySlug: (slug) => `news:slug:${slug}`,
  categories: () => 'categories:all',
  categoryById: (id) => `category:${id}`,
  userById: (id) => `user:${id}`,
  dashboardStats: () => 'dashboard:stats',
  comments: (newsId, page, limit) => `comments:${newsId}:${page}:${limit}`,
  analytics: (type, timeRange) => `analytics:${type}:${timeRange}`,
};

// Cache middleware factory
export const createCacheMiddleware = (keyGenerator, ttl = 300) => {
  return (req, res, next) => {
    // Check for cache bypass header
    if (req.headers['x-cache-bypass'] === 'true') {
      logger.info(`🚫 Cache bypassed: ${req.url}`);
      return next();
    }
    
    const key = keyGenerator(req);
    const cached = cache.get(key);
    
    if (cached) {
      logger.info(`🎯 Cache hit: ${key}`);
      return res.json(cached);
    }
    
    // Store original res.json
    const originalJson = res.json.bind(res);
    
    // Override res.json to cache the response
    res.json = (data) => {
      // Only cache successful responses
      if (res.statusCode >= 200 && res.statusCode < 300) {
        cache.set(key, data, ttl);
        logger.info(`💾 Cached: ${key} (TTL: ${ttl}s)`);
      }
      return originalJson(data);
    };
    
    next();
  };
};

// Specific cache middlewares
export const cacheNews = createCacheMiddleware(
  (req) => cacheKeys.news({
    page: req.query.page,
    limit: req.query.limit,
    category: req.query.category,
    keyword: req.query.keyword,
    status: req.query.status,
    sortBy: req.query.sortBy
  }),
  300 // 5 minutes
);

export const cacheNewsById = createCacheMiddleware(
  (req) => cacheKeys.newsById(req.params.identifier),
  600 // 10 minutes
);

export const cacheNewsBySlug = createCacheMiddleware(
  (req) => cacheKeys.newsBySlug(req.params.slug),
  600 // 10 minutes
);

export const cacheCategories = createCacheMiddleware(
  () => cacheKeys.categories(),
  1800 // 30 minutes
);

export const cacheDashboardStats = createCacheMiddleware(
  () => cacheKeys.dashboardStats(),
  300 // 5 minutes
);

export const cacheComments = createCacheMiddleware(
  (req) => cacheKeys.comments(
    req.params.newsId,
    req.query.page,
    req.query.limit
  ),
  180 // 3 minutes
);

// Cache invalidation functions
export const invalidateNewsCache = () => {
  const keys = cache.keys().filter(key => key.startsWith('news:'));
  cache.del(keys);
  logger.info(`🗑️ Invalidated ${keys.length} news cache entries`);
};

export const invalidateNewsById = (id) => {
  const keys = [
    cacheKeys.newsById(id),
    cacheKeys.newsBySlug(id), // In case it's a slug
  ];
  cache.del(keys);
  logger.info(`🗑️ Invalidated news cache for ID: ${id}`);
};

export const invalidateCategoryCache = () => {
  const keys = cache.keys().filter(key => key.startsWith('category'));
  cache.del(keys);
  logger.info(`🗑️ Invalidated ${keys.length} category cache entries`);
};

export const invalidateDashboardCache = () => {
  cache.del(cacheKeys.dashboardStats());
  logger.info(`🗑️ Invalidated dashboard cache`);
};

export const invalidateCommentsCache = (newsId) => {
  const keys = cache.keys().filter(key => key.startsWith(`comments:${newsId}`));
  cache.del(keys);
  logger.info(`🗑️ Invalidated comments cache for news: ${newsId}`);
};

// Cache statistics
export const getCacheStats = () => {
  const stats = cache.getStats();
  return {
    keys: stats.keys,
    hits: stats.hits,
    misses: stats.misses,
    hitRate: stats.hits / (stats.hits + stats.misses) * 100,
    memoryUsage: process.memoryUsage()
  };
};

// Clear all cache
export const clearAllCache = () => {
  cache.flushAll();
  logger.info('🗑️ Cleared all cache');
};

// Warm up cache with frequently accessed data
export const warmUpCache = async () => {
  try {
    logger.info('🔥 Warming up cache...');
    
    // You can add specific data warming here
    // For example, cache popular news articles, categories, etc.
    
    logger.info('✅ Cache warm-up completed');
  } catch (error) {
    logger.error('❌ Cache warm-up failed:', error);
  }
};

export default cache;