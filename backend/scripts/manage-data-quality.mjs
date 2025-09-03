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
      console.log('❌ Manager not initialized. Run: node manage-data-quality.mjs init');
      return;
    }

    console.log('\n🎯 Data Quality System Status');
    console.log('============================');
    
    // Enhanced Sentinel Status
    const status = {
      qualityThreshold: enhancedSentinelService.qualityThreshold,
      autoPublishEnabled: enhancedSentinelService.autoPublishEnabled,
      enhancementEnabled: enhancedSentinelService.enhancementEnabled
    };

    console.log(`📊 Quality Threshold: ${status.qualityThreshold}/100`);
    console.log(`🚀 Auto-Publish: ${status.autoPublishEnabled ? 'Enabled' : 'Disabled'}`);
    console.log(`🔧 Enhancement: ${status.enhancementEnabled ? 'Enabled' : 'Disabled'}`);

    // Quality Statistics
    const stats = await advancedDataQualityService.getQualityStatistics('7d');
    if (stats) {
      console.log('\n📈 Quality Statistics (Last 7 Days)');
      console.log('===================================');
      console.log(`📰 Total Articles: ${stats.totalArticles}`);
      console.log(`📊 Average Score: ${stats.averageScore}/100`);
      console.log(`🟢 Excellent: ${stats.qualityDistribution.excellent}`);
      console.log(`🔵 Good: ${stats.qualityDistribution.good}`);
      console.log(`🟡 Acceptable: ${stats.qualityDistribution.acceptable}`);
      console.log(`🟠 Poor: ${stats.qualityDistribution.poor}`);
      console.log(`🔴 Unacceptable: ${stats.qualityDistribution.unacceptable}`);
    }

    // Recommendations
    const recommendations = await enhancedSentinelService.getQualityRecommendations();
    if (recommendations.length > 0) {
      console.log('\n💡 Quality Recommendations');
      console.log('==========================');
      recommendations.forEach((rec, index) => {
        console.log(`${index + 1}. [${rec.priority.toUpperCase()}] ${rec.suggestion}`);
        console.log(`   Impact: ${rec.impact}`);
      });
    }
  }

  async runEnhancedSentinel() {
    if (!this.initialized) {
      console.log('❌ Manager not initialized. Run: node manage-data-quality.mjs init');
      return;
    }

    console.log('\n🚀 Running Enhanced Sentinel...');
    console.log('===============================');
    
    const results = await enhancedSentinelService.runEnhancedSentinel();
    
    console.log(`✅ Processing completed:`);
    console.log(`   📰 Processed: ${results.processed} articles`);
    console.log(`   📝 Created: ${results.created} articles`);
    console.log(`   🟢 High Quality: ${results.highQuality}`);
    console.log(`   🟡 Medium Quality: ${results.mediumQuality}`);
    console.log(`   🔴 Low Quality: ${results.lowQuality}`);
    
    if (results.qualityStats) {
      console.log(`   📊 Average Quality: ${results.qualityStats.averageScore}/100`);
    }
  }

  async setQualityThreshold(threshold) {
    if (!this.initialized) {
      console.log('❌ Manager not initialized. Run: node manage-data-quality.mjs init');
      return;
    }

    if (threshold < 0 || threshold > 100) {
      console.log('❌ Threshold must be between 0 and 100');
      return;
    }

    enhancedSentinelService.setQualityThreshold(threshold);
    console.log(`✅ Quality threshold updated to: ${threshold}/100`);
  }

  async toggleAutoPublish(enabled) {
    if (!this.initialized) {
      console.log('❌ Manager not initialized. Run: node manage-data-quality.mjs init');
      return;
    }

    enhancedSentinelService.setAutoPublishEnabled(enabled);
    console.log(`✅ Auto-publish ${enabled ? 'enabled' : 'disabled'}`);
  }

  async assessArticle(articleId) {
    if (!this.initialized) {
      console.log('❌ Manager not initialized. Run: node manage-data-quality.mjs init');
      return;
    }

    try {
      const News = (await import('../models/News.mjs')).default;
      const article = await News.findById(articleId);
      
      if (!article) {
        console.log('❌ Article not found');
        return;
      }

      console.log(`\n🔍 Assessing article: ${article.title?.en || article.title}`);
      console.log('================================================');

      const assessment = await advancedDataQualityService.assessDataQuality(article);
      
      if (assessment) {
        console.log(`📊 Overall Score: ${assessment.overallScore}/100`);
        console.log(`🏆 Quality Grade: ${assessment.qualityGrade}`);
        console.log('\n📈 Factor Scores:');
        console.log(`   🎯 Content Accuracy: ${assessment.factorScores.contentAccuracy?.score || 0}/100`);
        console.log(`   🔗 Source Reliability: ${assessment.factorScores.sourceReliability?.score || 0}/100`);
        console.log(`   📝 Content Completeness: ${assessment.factorScores.contentCompleteness?.score || 0}/100`);
        console.log(`   ✍️ Language Quality: ${assessment.factorScores.languageQuality?.score || 0}/100`);
        console.log(`   🎯 Relevance Score: ${assessment.factorScores.relevanceScore?.score || 0}/100`);
        console.log(`   🔄 Uniqueness Score: ${assessment.factorScores.uniquenessScore?.score || 0}/100`);

        if (assessment.recommendations?.length > 0) {
          console.log('\n💡 Recommendations:');
          assessment.recommendations.forEach((rec, index) => {
            console.log(`   ${index + 1}. [${rec.priority.toUpperCase()}] ${rec.suggestion}`);
          });
        }

        if (assessment.riskFactors?.length > 0) {
          console.log('\n⚠️ Risk Factors:');
          assessment.riskFactors.forEach((risk, index) => {
            console.log(`   ${index + 1}. [${risk.level.toUpperCase()}] ${risk.factor}: ${risk.description}`);
          });
        }
      } else {
        console.log('❌ Assessment failed');
      }
    } catch (error) {
      console.log('❌ Error assessing article:', error.message);
    }
  }

  async showHelp() {
    console.log('\n🎯 Data Quality Management Commands');
    console.log('====================================');
    console.log('init                    - Initialize the data quality system');
    console.log('status                  - Show system status and statistics');
    console.log('run                     - Run enhanced Sentinel with quality assessment');
    console.log('threshold <score>       - Set quality threshold (0-100)');
    console.log('auto-publish <on|off>   - Enable/disable auto-publishing');
    console.log('assess <articleId>      - Assess specific article quality');
    console.log('help                    - Show this help message');
    console.log('\nExamples:');
    console.log('  node manage-data-quality.mjs init');
    console.log('  node manage-data-quality.mjs status');
    console.log('  node manage-data-quality.mjs run');
    console.log('  node manage-data-quality.mjs threshold 75');
    console.log('  node manage-data-quality.mjs auto-publish on');
    console.log('  node manage-data-quality.mjs assess 507f1f77bcf86cd799439011');
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
        await manager.showStatus();
        break;
      case 'run':
        await manager.runEnhancedSentinel();
        break;
      case 'threshold':
        if (!arg) {
          console.log('❌ Please provide a threshold value (0-100)');
          break;
        }
        await manager.setQualityThreshold(parseInt(arg));
        break;
      case 'auto-publish':
        if (!arg) {
          console.log('❌ Please specify "on" or "off"');
          break;
        }
        await manager.toggleAutoPublish(arg === 'on');
        break;
      case 'assess':
        if (!arg) {
          console.log('❌ Please provide an article ID');
          break;
        }
        await manager.assessArticle(arg);
        break;
      case 'help':
      default:
        await manager.showHelp();
        break;
    }
  } catch (error) {
    console.error('❌ Command failed:', error.message);
  } finally {
    await manager.cleanup();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export default DataQualityManager;
