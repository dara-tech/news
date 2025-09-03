#!/usr/bin/env node

/**
 * Enterprise Performance Monitoring Service
 * Real-time performance monitoring and optimization
 */

import os from 'os';
import mongoose from 'mongoose';
import logger from '../utils/logger.mjs';

class PerformanceMonitor {
  constructor() {
    this.metrics = {
      requests: new Map(),
      responses: new Map(),
      errors: new Map(),
      database: new Map(),
      memory: [],
      cpu: [],
      alerts: []
    };
    
    this.thresholds = {
      responseTime: 500, // ms
      errorRate: 5, // %
      memoryUsage: 80, // %
      cpuUsage: 80, // %
      dbConnections: 100
    };

    this.startMonitoring();
  }

  /**
   * Start Performance Monitoring
   */
  startMonitoring() {
    // Monitor system metrics every 30 seconds
    setInterval(() => {
      this.collectSystemMetrics();
    }, 30000);

    // Monitor database performance every minute
    setInterval(() => {
      this.collectDatabaseMetrics();
    }, 60000);

    // Clean up old metrics every 5 minutes
    setInterval(() => {
      this.cleanupMetrics();
    }, 300000);

    // Check for alerts every minute
    setInterval(() => {
      this.checkAlerts();
    }, 60000);

    logger.info('Performance monitoring started');
  }

  /**
   * Collect System Metrics
   */
  async collectSystemMetrics() {
    try {
      const memoryUsage = process.memoryUsage();
      const cpuUsage = process.cpuUsage();
      const systemLoad = os.loadavg();
      const freeMemory = os.freemem();
      const totalMemory = os.totalmem();

      const metrics = {
        timestamp: new Date(),
        memory: {
          rss: memoryUsage.rss,
          heapUsed: memoryUsage.heapUsed,
          heapTotal: memoryUsage.heapTotal,
          external: memoryUsage.external,
          systemFree: freeMemory,
          systemTotal: totalMemory,
          usage: ((totalMemory - freeMemory) / totalMemory) * 100
        },
        cpu: {
          user: cpuUsage.user,
          system: cpuUsage.system,
          load1: systemLoad[0],
          load5: systemLoad[1],
          load15: systemLoad[2]
        },
        uptime: process.uptime(),
        nodeVersion: process.version,
        platform: os.platform(),
        arch: os.arch()
      };

      this.metrics.memory.push(metrics.memory);
      this.metrics.cpu.push(metrics.cpu);

      // Keep only last 100 measurements
      if (this.metrics.memory.length > 100) {
        this.metrics.memory.shift();
      }
      if (this.metrics.cpu.length > 100) {
        this.metrics.cpu.shift();
      }

      // Log critical metrics
      if (metrics.memory.usage > this.thresholds.memoryUsage) {
        logger.warn(`High memory usage: ${metrics.memory.usage.toFixed(2)}%`);
      }

    } catch (error) {
      logger.error('System metrics collection error:', error);
    }
  }

  /**
   * Collect Database Metrics
   */
  async collectDatabaseMetrics() {
    try {
      const dbStats = await mongoose.connection.db.admin().serverStatus();
      const collections = await mongoose.connection.db.listCollections().toArray();
      
      const metrics = {
        timestamp: new Date(),
        connections: {
          current: dbStats.connections.current,
          available: dbStats.connections.available,
          totalCreated: dbStats.connections.totalCreated
        },
        operations: {
          insert: dbStats.opcounters.insert,
          query: dbStats.opcounters.query,
          update: dbStats.opcounters.update,
          delete: dbStats.opcounters.delete,
          getmore: dbStats.opcounters.getmore,
          command: dbStats.opcounters.command
        },
        memory: {
          resident: dbStats.mem.resident,
          virtual: dbStats.mem.virtual,
          mapped: dbStats.mem.mapped || 0
        },
        network: {
          bytesIn: dbStats.network.bytesIn,
          bytesOut: dbStats.network.bytesOut,
          numRequests: dbStats.network.numRequests
        },
        collections: collections.length,
        uptime: dbStats.uptime
      };

      this.metrics.database.set('latest', metrics);

      // Check connection limits
      if (metrics.connections.current > this.thresholds.dbConnections) {
        logger.warn(`High database connections: ${metrics.connections.current}`);
      }

    } catch (error) {
      logger.error('Database metrics collection error:', error);
    }
  }

  /**
   * Record Request Metrics
   */
  recordRequest(req, res, responseTime) {
    const timestamp = Date.now();
    const key = `${timestamp}-${Math.random()}`;
    
    const metrics = {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      responseTime,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      timestamp: new Date(timestamp)
    };

    this.metrics.requests.set(key, metrics);
    
    // Track response times
    this.metrics.responses.set(key, {
      responseTime,
      statusCode: res.statusCode,
      timestamp: new Date(timestamp)
    });

    // Track errors
    if (res.statusCode >= 400) {
      this.metrics.errors.set(key, {
        statusCode: res.statusCode,
        url: req.originalUrl,
        method: req.method,
        timestamp: new Date(timestamp)
      });
    }
  }

  /**
   * Get Performance Analytics
   */
  getPerformanceAnalytics(timeRange = '1h') {
    const now = Date.now();
    const ranges = {
      '1h': 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000
    };
    
    const cutoff = now - (ranges[timeRange] || ranges['1h']);

    // Filter recent metrics
    const recentRequests = Array.from(this.metrics.requests.values())
      .filter(req => req.timestamp.getTime() > cutoff);
    
    const recentResponses = Array.from(this.metrics.responses.values())
      .filter(res => res.timestamp.getTime() > cutoff);
    
    const recentErrors = Array.from(this.metrics.errors.values())
      .filter(err => err.timestamp.getTime() > cutoff);

    // Calculate metrics
    const totalRequests = recentRequests.length;
    const totalErrors = recentErrors.length;
    const errorRate = totalRequests > 0 ? (totalErrors / totalRequests) * 100 : 0;
    
    const responseTimes = recentResponses.map(r => r.responseTime);
    const avgResponseTime = responseTimes.length > 0 
      ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length 
      : 0;
    
    const p95ResponseTime = this.calculatePercentile(responseTimes, 95);
    const p99ResponseTime = this.calculatePercentile(responseTimes, 99);

    // Status code distribution
    const statusCodes = recentResponses.reduce((acc, res) => {
      const code = Math.floor(res.statusCode / 100) * 100;
      acc[code] = (acc[code] || 0) + 1;
      return acc;
    }, {});

    // Top endpoints
    const endpoints = recentRequests.reduce((acc, req) => {
      const key = `${req.method} ${req.url}`;
      if (!acc[key]) {
        acc[key] = { count: 0, totalTime: 0, errors: 0 };
      }
      acc[key].count++;
      acc[key].totalTime += recentResponses.find(r => 
        r.timestamp.getTime() === req.timestamp.getTime()
      )?.responseTime || 0;
      
      if (req.statusCode >= 400) {
        acc[key].errors++;
      }
      return acc;
    }, {});

    const topEndpoints = Object.entries(endpoints)
      .map(([endpoint, stats]) => ({
        endpoint,
        requests: stats.count,
        avgResponseTime: stats.totalTime / stats.count,
        errorRate: (stats.errors / stats.count) * 100
      }))
      .sort((a, b) => b.requests - a.requests)
      .slice(0, 10);

    return {
      summary: {
        totalRequests,
        totalErrors,
        errorRate: Math.round(errorRate * 100) / 100,
        avgResponseTime: Math.round(avgResponseTime),
        p95ResponseTime: Math.round(p95ResponseTime),
        p99ResponseTime: Math.round(p99ResponseTime),
        timeRange
      },
      system: {
        memory: this.getLatestMemoryMetrics(),
        cpu: this.getLatestCpuMetrics(),
        database: this.metrics.database.get('latest')
      },
      distribution: {
        statusCodes,
        topEndpoints
      },
      trends: {
        requestsOverTime: this.getRequestTrends(recentRequests),
        responseTimeOverTime: this.getResponseTimeTrends(recentResponses),
        errorsOverTime: this.getErrorTrends(recentErrors)
      },
      alerts: this.metrics.alerts.slice(-10) // Last 10 alerts
    };
  }

  /**
   * Get Real-time Metrics
   */
  getRealTimeMetrics() {
    const now = Date.now();
    const last5Min = now - 5 * 60 * 1000;

    const recentRequests = Array.from(this.metrics.requests.values())
      .filter(req => req.timestamp.getTime() > last5Min);

    const recentResponses = Array.from(this.metrics.responses.values())
      .filter(res => res.timestamp.getTime() > last5Min);

    const currentRPS = recentRequests.length / 300; // requests per second over 5 minutes
    const currentResponseTime = recentResponses.length > 0 
      ? recentResponses.reduce((sum, r) => sum + r.responseTime, 0) / recentResponses.length 
      : 0;

    return {
      timestamp: new Date(),
      requestsPerSecond: Math.round(currentRPS * 100) / 100,
      avgResponseTime: Math.round(currentResponseTime),
      activeConnections: this.metrics.database.get('latest')?.connections?.current || 0,
      memoryUsage: this.getLatestMemoryMetrics()?.usage || 0,
      cpuLoad: this.getLatestCpuMetrics()?.load1 || 0,
      status: this.getSystemStatus()
    };
  }

  /**
   * Check for Performance Alerts
   */
  checkAlerts() {
    const alerts = [];
    const now = new Date();

    // Check response time
    const recentResponses = Array.from(this.metrics.responses.values())
      .filter(res => now - res.timestamp < 5 * 60 * 1000); // Last 5 minutes

    if (recentResponses.length > 0) {
      const avgResponseTime = recentResponses.reduce((sum, r) => sum + r.responseTime, 0) / recentResponses.length;
      if (avgResponseTime > this.thresholds.responseTime) {
        alerts.push({
          type: 'performance',
          severity: 'warning',
          message: `High average response time: ${Math.round(avgResponseTime)}ms`,
          threshold: this.thresholds.responseTime,
          value: Math.round(avgResponseTime),
          timestamp: now
        });
      }
    }

    // Check error rate
    const recentRequests = Array.from(this.metrics.requests.values())
      .filter(req => now - req.timestamp < 5 * 60 * 1000);
    
    const recentErrors = Array.from(this.metrics.errors.values())
      .filter(err => now - err.timestamp < 5 * 60 * 1000);

    if (recentRequests.length > 0) {
      const errorRate = (recentErrors.length / recentRequests.length) * 100;
      if (errorRate > this.thresholds.errorRate) {
        alerts.push({
          type: 'errors',
          severity: 'critical',
          message: `High error rate: ${errorRate.toFixed(2)}%`,
          threshold: this.thresholds.errorRate,
          value: Math.round(errorRate * 100) / 100,
          timestamp: now
        });
      }
    }

    // Check memory usage
    const latestMemory = this.getLatestMemoryMetrics();
    if (latestMemory && latestMemory.usage > this.thresholds.memoryUsage) {
      alerts.push({
        type: 'memory',
        severity: 'warning',
        message: `High memory usage: ${latestMemory.usage.toFixed(2)}%`,
        threshold: this.thresholds.memoryUsage,
        value: Math.round(latestMemory.usage * 100) / 100,
        timestamp: now
      });
    }

    // Add new alerts
    alerts.forEach(alert => {
      this.metrics.alerts.push(alert);
      logger.warn(`Performance Alert: ${alert.message}`);
    });

    // Keep only last 100 alerts
    if (this.metrics.alerts.length > 100) {
      this.metrics.alerts = this.metrics.alerts.slice(-100);
    }
  }

  /**
   * Helper Methods
   */
  calculatePercentile(values, percentile) {
    if (values.length === 0) return 0;
    
    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[index] || 0;
  }

  getLatestMemoryMetrics() {
    return this.metrics.memory[this.metrics.memory.length - 1];
  }

  getLatestCpuMetrics() {
    return this.metrics.cpu[this.metrics.cpu.length - 1];
  }

  getSystemStatus() {
    const memory = this.getLatestMemoryMetrics();
    const cpu = this.getLatestCpuMetrics();
    const db = this.metrics.database.get('latest');

    if (!memory || !cpu) return 'initializing';

    if (memory.usage > 90 || cpu.load1 > 5) return 'critical';
    if (memory.usage > 80 || cpu.load1 > 3) return 'warning';
    return 'healthy';
  }

  getRequestTrends(requests) {
    // Group requests by minute
    const trends = requests.reduce((acc, req) => {
      const minute = new Date(req.timestamp);
      minute.setSeconds(0, 0);
      const key = minute.toISOString();
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(trends)
      .map(([time, count]) => ({ time, count }))
      .sort((a, b) => new Date(a.time) - new Date(b.time));
  }

  getResponseTimeTrends(responses) {
    // Group response times by minute
    const trends = responses.reduce((acc, res) => {
      const minute = new Date(res.timestamp);
      minute.setSeconds(0, 0);
      const key = minute.toISOString();
      if (!acc[key]) {
        acc[key] = { total: 0, count: 0 };
      }
      acc[key].total += res.responseTime;
      acc[key].count++;
      return acc;
    }, {});

    return Object.entries(trends)
      .map(([time, data]) => ({ 
        time, 
        avgResponseTime: Math.round(data.total / data.count) 
      }))
      .sort((a, b) => new Date(a.time) - new Date(b.time));
  }

  getErrorTrends(errors) {
    // Group errors by minute
    const trends = errors.reduce((acc, err) => {
      const minute = new Date(err.timestamp);
      minute.setSeconds(0, 0);
      const key = minute.toISOString();
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(trends)
      .map(([time, count]) => ({ time, errors: count }))
      .sort((a, b) => new Date(a.time) - new Date(b.time));
  }

  cleanupMetrics() {
    const cutoff = Date.now() - 24 * 60 * 60 * 1000; // 24 hours

    // Clean up old requests
    for (const [key, request] of this.metrics.requests.entries()) {
      if (request.timestamp.getTime() < cutoff) {
        this.metrics.requests.delete(key);
      }
    }

    // Clean up old responses
    for (const [key, response] of this.metrics.responses.entries()) {
      if (response.timestamp.getTime() < cutoff) {
        this.metrics.responses.delete(key);
      }
    }

    // Clean up old errors
    for (const [key, error] of this.metrics.errors.entries()) {
      if (error.timestamp.getTime() < cutoff) {
        this.metrics.errors.delete(key);
      }
    }
  }

  /**
   * Middleware for Express
   */
  middleware() {
    return (req, res, next) => {
      const startTime = Date.now();
      
      res.on('finish', () => {
        const responseTime = Date.now() - startTime;
        this.recordRequest(req, res, responseTime);
      });
      
      next();
    };
  }
}

export default PerformanceMonitor;
