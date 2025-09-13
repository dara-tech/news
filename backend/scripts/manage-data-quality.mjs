#!/usr/bin/env node

/**
 * Data Quality Management Script
 * Easy management interface for the advanced data quality system
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import advancedDataQualityService from '../services/advancedDataQualityService.mjs';
import enhancedSentinelService from '../services/enhancedSentinelService.mjs';
import logger from '../utils/logger.mjs';

dotenv.config();

class DataQualityManager {
  constructor() {
    this.initialized = false;
  }

  async initialize() {
    try {
      await mongoose.connect(process.env.MONGODB_URI);
      await advancedDataQualityService.initialize();
      await enhancedSentinelService.initialize();
      this.initialized = true;
      logger.info('✅ Data Quality Manager initialized successfully');
      return true;
    } catch (error) {
      logger.error('❌ Failed to initialize Data Quality Manager:', error);
      return false;
    }
  }

  async showStatus() {
    if (!this.initialized) {
      return;
    }

    // Enhanced Sentinel Status
    const status = {
      qualityThreshold: enhancedSentinelService.qualityThreshold,
      autoPublishEnabled: enhancedSentinelService.autoPublishEnabled,
      enhancementEnabled: enhancedSentinelService.enhancementEnabled
    };

    // Quality Statistics
    const stats = await advancedDataQualityService.getQualityStatistics('7d');
    
    // Recommendations
    const recommendations = await enhancedSentinelService.getQualityRecommendations();
    
    return { status, stats, recommendations };
  }

  async runEnhancedSentinel() {
    if (!this.initialized) {
      return;
    }
    
    const results = await enhancedSentinelService.runEnhancedSentinel();
    return results;
  }

  async setQualityThreshold(threshold) {
    if (!this.initialized) {
      return;
    }

    if (threshold < 0 || threshold > 100) {
      return;
    }

    enhancedSentinelService.setQualityThreshold(threshold);
  }

  async toggleAutoPublish(enabled) {
    if (!this.initialized) {
      return;
    }

    enhancedSentinelService.setAutoPublishEnabled(enabled);
  }

  async assessArticle(articleId) {
    if (!this.initialized) {
      return;
    }

    try {
      const News = (await import('../models/News.mjs')).default;
      const article = await News.findById(articleId);
      
      if (!article) {
        return;
      }

      const assessment = await advancedDataQualityService.assessDataQuality(article);
      return assessment;
    } catch (error) {
      return null;
    }
  }

  async showHelp() {
    return {
      commands: [
        { command: 'init', description: 'Initialize the data quality system' },
        { command: 'status', description: 'Show system status and statistics' },
        { command: 'run', description: 'Run enhanced Sentinel with quality assessment' },
        { command: 'threshold <score>', description: 'Set quality threshold (0-100)' },
        { command: 'auto-publish <on|off>', description: 'Enable/disable auto-publishing' },
        { command: 'assess <articleId>', description: 'Assess specific article quality' },
        { command: 'help', description: 'Show this help message' }
      ],
      examples: [
        'node manage-data-quality.mjs init',
        'node manage-data-quality.mjs status',
        'node manage-data-quality.mjs run',
        'node manage-data-quality.mjs threshold 75',
        'node manage-data-quality.mjs auto-publish on',
        'node manage-data-quality.mjs assess 507f1f77bcf86cd799439011'
      ]
    };
  }

  async cleanup() {
    if (this.initialized) {
      await mongoose.disconnect();
      logger.info('🔌 Disconnected from database');
    }
  }
}

// Main execution
async function main() {
  const manager = new DataQualityManager();
  const command = process.argv[2];
  const arg = process.argv[3];

  try {
    switch (command) {
      case 'init':
        await manager.initialize();
        break;
      case 'status':
        const statusResult = await manager.showStatus();
        if (statusResult) {
          logger.info('📊 Data Quality Status:', statusResult);
        }
        break;
      case 'run':
        const runResult = await manager.runEnhancedSentinel();
        if (runResult) {
          logger.info('🚀 Enhanced Sentinel Results:', runResult);
        }
        break;
      case 'threshold':
        if (!arg) {
          logger.error('❌ Please provide a threshold value (0-100)');
          break;
        }
        await manager.setQualityThreshold(parseInt(arg));
        break;
      case 'auto-publish':
        if (!arg) {
          logger.error('❌ Please specify "on" or "off"');
          break;
        }
        await manager.toggleAutoPublish(arg === 'on');
        break;
      case 'assess':
        if (!arg) {
          logger.error('❌ Please provide an article ID');
          break;
        }
        const assessment = await manager.assessArticle(arg);
        if (assessment) {
          logger.info('🔍 Article Assessment:', assessment);
        } else {
          logger.error('❌ Assessment failed');
        }
        break;
      case 'help':
      default:
        const helpData = await manager.showHelp();
        logger.info('🎯 Data Quality Management Commands');
        logger.info('====================================');
        helpData.commands.forEach(cmd => {
          logger.info(`${cmd.command.padEnd(20)} - ${cmd.description}`);
        });
        logger.info('\nExamples:');
        helpData.examples.forEach(example => {
          logger.info(`  ${example}`);
        });
        break;
    }
  } catch (error) {
    logger.error('❌ Command failed:', error.message);
  } finally {
    await manager.cleanup();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export default DataQualityManager;
