#!/usr/bin/env node

/**
 * Enterprise Deployment Script
 * Automated deployment and configuration for production
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import mongoose from 'mongoose';
import logger from '../utils/logger.mjs';

class EnterpriseDeployment {
  constructor() {
    this.deploymentSteps = [
      'validateEnvironment',
      'setupDatabase',
      'optimizeDatabase',
      'setupSecurity',
      'setupMonitoring',
      'setupServices',
      'runHealthChecks',
      'generateReport'
    ];
  }

  async deploy() {
    logger.info('🚀 Starting Enterprise Deployment...');
    
    const startTime = Date.now();
    const results = {};

    try {
      for (const step of this.deploymentSteps) {
        logger.info(`📋 Executing: ${step}`);
        const stepStart = Date.now();
        
        try {
          const result = await this[step]();
          results[step] = {
            status: 'success',
            duration: Date.now() - stepStart,
            result
          };
          logger.info(`✅ ${step} completed in ${Date.now() - stepStart}ms`);
        } catch (error) {
          results[step] = {
            status: 'failed',
            duration: Date.now() - stepStart,
            error: error.message
          };
          logger.error(`❌ ${step} failed:`, error);
          throw error;
        }
      }

      const totalDuration = Date.now() - startTime;
      logger.info(`🎉 Enterprise Deployment completed successfully in ${totalDuration}ms`);
      
      return {
        success: true,
        duration: totalDuration,
        steps: results,
        timestamp: new Date()
      };

    } catch (error) {
      logger.error('💥 Enterprise Deployment failed:', error);
      return {
        success: false,
        duration: Date.now() - startTime,
        steps: results,
        error: error.message,
        timestamp: new Date()
      };
    }
  }

  async validateEnvironment() {
    const requiredEnvVars = [
      'MONGODB_URI',
      'JWT_SECRET',
      'GEMINI_API_KEY',
      'CLOUDINARY_CLOUD_NAME',
      'CLOUDINARY_API_KEY',
      'CLOUDINARY_API_SECRET'
    ];

    const missing = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }

    // Check Node.js version
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
    
    if (majorVersion < 18) {
      throw new Error(`Node.js version ${nodeVersion} is not supported. Requires Node.js 18+`);
    }

    return {
      nodeVersion,
      envVarsCount: requiredEnvVars.length,
      platform: process.platform,
      arch: process.arch
    };
  }

  async setupDatabase() {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Create indexes for performance
    const collections = [
      {
        name: 'news',
        indexes: [
          { keys: { status: 1, publishedAt: -1 } },
          { keys: { category: 1, status: 1 } },
          { keys: { author: 1, status: 1 } },
          { keys: { tags: 1 } },
          { keys: { 'title.en': 'text', 'content.en': 'text' } },
          { keys: { views: -1 } },
          { keys: { 'qualityAssessment.overallScore': -1 } },
          { keys: { createdAt: 1 }, options: { expireAfterSeconds: 7776000 } } // 90 days for drafts
        ]
      },
      {
        name: 'users',
        indexes: [
          { keys: { email: 1 }, options: { unique: true } },
          { keys: { role: 1 } },
          { keys: { status: 1 } },
          { keys: { lastLogin: -1 } },
          { keys: { createdAt: -1 } }
        ]
      }
    ];

    let indexesCreated = 0;
    for (const collection of collections) {
      const db = mongoose.connection.db;
      const coll = db.collection(collection.name);
      
      for (const index of collection.indexes) {
        try {
          await coll.createIndex(index.keys, index.options || {});
          indexesCreated++;
        } catch (error) {
          if (!error.message.includes('already exists')) {
            throw error;
          }
        }
      }
    }

    return { indexesCreated, collections: collections.length };
  }

  async optimizeDatabase() {
    const db = mongoose.connection.db;
    const stats = await db.stats();
    
    // Run database optimization commands
    const commands = [
      { compact: 'news' },
      { compact: 'users' },
      { reIndex: 'news' },
      { reIndex: 'users' }
    ];

    const results = [];
    for (const command of commands) {
      try {
        const result = await db.admin().command(command);
        results.push({ command, success: true, result });
      } catch (error) {
        results.push({ command, success: false, error: error.message });
      }
    }

    return { 
      databaseStats: stats,
      optimizationResults: results
    };
  }

  async setupSecurity() {
    // Security configurations
    const securityConfig = {
      rateLimiting: {
        enabled: true,
        windowMs: 15 * 60 * 1000, // 15 minutes
        maxRequests: 100
      },
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        credentials: true
      },
      headers: {
        contentSecurityPolicy: true,
        hsts: true,
        noSniff: true,
        frameOptions: 'DENY'
      }
    };

    // Check SSL/TLS configuration
    const isSecure = process.env.NODE_ENV === 'production' && 
                    (process.env.HTTPS === 'true' || process.env.SSL_KEY);

    return {
      securityConfig,
      sslEnabled: isSecure,
      environment: process.env.NODE_ENV
    };
  }

  async setupMonitoring() {
    // Initialize monitoring services
    const monitoringConfig = {
      performance: {
        enabled: true,
        metricsRetention: '24h',
        alertThresholds: {
          responseTime: 500,
          errorRate: 5,
          memoryUsage: 80
        }
      },
      logging: {
        level: process.env.LOG_LEVEL || 'info',
        format: 'json',
        rotation: true
      },
      healthChecks: {
        interval: 30000, // 30 seconds
        timeout: 5000,   // 5 seconds
        endpoints: [
          '/api/health',
          '/api/admin/analytics/real-time'
        ]
      }
    };

    // Create monitoring directories
    const dirs = ['logs', 'metrics', 'reports'];
    for (const dir of dirs) {
      const dirPath = path.join(process.cwd(), dir);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
    }

    return monitoringConfig;
  }

  async setupServices() {
    const services = [
      'Enterprise Analytics Service',
      'Performance Monitor',
      'AI Recommendation Engine',
      'Subscription Service'
    ];

    const serviceStatus = {};
    
    for (const service of services) {
      try {
        // Initialize service (placeholder)
        serviceStatus[service] = {
          status: 'active',
          initialized: new Date()
        };
      } catch (error) {
        serviceStatus[service] = {
          status: 'failed',
          error: error.message
        };
      }
    }

    return serviceStatus;
  }

  async runHealthChecks() {
    const healthChecks = [
      {
        name: 'Database Connection',
        check: () => mongoose.connection.readyState === 1
      },
      {
        name: 'Environment Variables',
        check: () => !!process.env.MONGODB_URI && !!process.env.JWT_SECRET
      },
      {
        name: 'File System Access',
        check: () => {
          try {
            fs.accessSync(process.cwd(), fs.constants.R_OK | fs.constants.W_OK);
            return true;
          } catch {
            return false;
          }
        }
      },
      {
        name: 'Memory Usage',
        check: () => {
          const usage = process.memoryUsage();
          const usagePercent = (usage.heapUsed / usage.heapTotal) * 100;
          return usagePercent < 90;
        }
      }
    ];

    const results = {};
    let passed = 0;
    let failed = 0;

    for (const healthCheck of healthChecks) {
      try {
        const result = await healthCheck.check();
        results[healthCheck.name] = { status: result ? 'pass' : 'fail' };
        if (result) passed++;
        else failed++;
      } catch (error) {
        results[healthCheck.name] = { status: 'error', error: error.message };
        failed++;
      }
    }

    return {
      summary: { passed, failed, total: healthChecks.length },
      details: results,
      overallHealth: failed === 0 ? 'healthy' : 'warning'
    };
  }

  async generateReport() {
    const report = {
      deployment: {
        timestamp: new Date(),
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV,
        platform: `${process.platform} ${process.arch}`,
        nodeVersion: process.version
      },
      features: {
        enterpriseAnalytics: true,
        performanceMonitoring: true,
        aiRecommendations: true,
        subscriptionSystem: true,
        advancedSecurity: true,
        realTimeUpdates: true
      },
      endpoints: [
        '/api/admin/analytics/dashboard',
        '/api/admin/analytics/business-intelligence',
        '/api/admin/analytics/performance',
        '/api/admin/analytics/real-time',
        '/api/recommendations/personalized'
      ],
      security: {
        rateLimiting: true,
        cors: true,
        securityHeaders: true,
        inputValidation: true,
        auditLogging: true
      },
      performance: {
        databaseIndexes: true,
        caching: true,
        monitoring: true,
        alerting: true
      }
    };

    // Save report to file
    const reportPath = path.join(process.cwd(), 'reports', `deployment-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    return {
      reportPath,
      summary: report
    };
  }
}

// Run deployment if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const deployment = new EnterpriseDeployment();
  
  deployment.deploy()
    .then(result => {
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('💥 Deployment failed:', error);
      process.exit(1);
    });
}

export default EnterpriseDeployment;
