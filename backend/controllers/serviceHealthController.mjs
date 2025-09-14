import integrationService from '../services/integrationService.mjs';
import sentinelService from '../services/sentinelService.mjs';
import logger from '../utils/logger.mjs';
import mongoose from 'mongoose';

// Service health check functions
const checkServiceHealth = async (serviceId, serviceName, checkFunction) => {
  const startTime = Date.now();
  try {
    logger.info(`🔍 [Service Health] Checking ${serviceName} (${serviceId})...`);
    const result = await checkFunction();
    const responseTime = Date.now() - startTime;
    
    logger.info(`✅ [Service Health] ${serviceName} is healthy (${responseTime}ms)`);
    return {
      id: serviceId,
      name: serviceName,
      status: 'healthy',
      responseTime,
      lastCheck: new Date().toISOString(),
      details: result
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    logger.error(`❌ [Service Health] ${serviceName} failed: ${error.message} (${responseTime}ms)`);
    return {
      id: serviceId,
      name: serviceName,
      status: 'error',
      responseTime,
      lastCheck: new Date().toISOString(),
      error: error.message
    };
  }
};

// Individual service check functions
const checkDatabase = async () => {
  const state = mongoose.connection.readyState;
  if (state !== 1) throw new Error(`Database not connected (state: ${state})`);
  
  // Test a simple query
  await mongoose.connection.db.admin().ping();
  return { connected: true, state };
};

const checkSentinel = async () => {
  const metrics = sentinelService.getPerformanceMetrics();
  if (!metrics) throw new Error('Sentinel metrics not available');
  
  return {
    running: metrics.running || false,
    lastRun: metrics.lastRun,
    uptime: metrics.uptime,
    sourcesCount: metrics.sourcesCount
  };
};

const checkIntegration = async () => {
  if (!integrationService.initialized) throw new Error('Integration service not initialized');
  
  const health = await integrationService.getHealthStatus();
  return health;
};

const checkCache = async () => {
  // Check if cache service is available
  if (!integrationService.services.cache) throw new Error('Cache service not available');
  
  const stats = integrationService.services.cache.getStats();
  return stats;
};

const checkWebSocket = async () => {
  if (!integrationService.services.websocket) throw new Error('WebSocket service not available');
  
  const stats = integrationService.services.websocket.getStats();
  return stats;
};

const checkAI = async () => {
  if (!integrationService.services.ai) throw new Error('AI service not available');
  
  const stats = integrationService.services.ai.getStats();
  return stats;
};

const checkAnalytics = async () => {
  if (!integrationService.services.analytics) throw new Error('Analytics service not available');
  
  const stats = integrationService.services.analytics.getStats();
  return stats;
};

const checkPerformance = async () => {
  if (!integrationService.services.performance) throw new Error('Performance service not available');
  
  const stats = integrationService.services.performance.getPerformanceMetrics();
  return stats;
};

// @desc    Get all service health status with real data
// @route   GET /api/services/health
// @access  Private/Admin
export const getServiceHealth = async (req, res) => {
  const startTime = Date.now();
  logger.info('🚀 [Service Health] Starting comprehensive service health check...');
  
  try {
    // Define all services to check
    const serviceChecks = [
      { id: 'database', name: 'Database', category: 'core', check: checkDatabase },
      { id: 'sentinel-core', name: 'Sentinel-PP-01', category: 'core', check: checkSentinel },
      { id: 'integration', name: 'Integration Service', category: 'core', check: checkIntegration },
      { id: 'cache', name: 'Redis Cache', category: 'core', check: checkCache },
      { id: 'websocket', name: 'WebSocket Service', category: 'core', check: checkWebSocket },
      { id: 'ai-enhancement', name: 'AI Enhancement', category: 'ai', check: checkAI },
      { id: 'analytics', name: 'Analytics Service', category: 'analytics', check: checkAnalytics },
      { id: 'performance', name: 'Performance Optimization', category: 'core', check: checkPerformance }
    ];

    logger.info(`📊 [Service Health] Checking ${serviceChecks.length} services...`);

    // Check all services in parallel
    const serviceResults = await Promise.allSettled(
      serviceChecks.map(service => 
        checkServiceHealth(service.id, service.name, service.check)
          .then(result => ({ ...result, category: service.category }))
      )
    );

    // Process results
    const services = serviceResults.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        const service = serviceChecks[index];
        logger.error(`💥 [Service Health] ${service.name} check failed: ${result.reason}`);
        return {
          id: service.id,
          name: service.name,
          category: service.category,
          status: 'error',
          responseTime: 0,
          lastCheck: new Date().toISOString(),
          error: result.reason?.message || 'Unknown error'
        };
      }
    });

    // Calculate summary
    const summary = {
      total: services.length,
      healthy: services.filter(s => s.status === 'healthy').length,
      warning: services.filter(s => s.status === 'warning').length,
      error: services.filter(s => s.status === 'error').length,
      offline: services.filter(s => s.status === 'offline').length
    };

    const overallStatus = summary.error > 0 ? 'error' : summary.warning > 0 ? 'warning' : 'healthy';
    const totalTime = Date.now() - startTime;

    logger.info(`🎯 [Service Health] Check completed in ${totalTime}ms - ${summary.healthy}/${summary.total} healthy`);

    res.json({
      success: true,
      data: {
        overall: overallStatus,
        services,
        summary,
        lastUpdated: new Date().toISOString(),
        processingTime: totalTime,
        checkedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    const totalTime = Date.now() - startTime;
    logger.error(`💥 [Service Health] Health check failed after ${totalTime}ms:`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch service health data',
      processingTime: totalTime
    });
  }
};
