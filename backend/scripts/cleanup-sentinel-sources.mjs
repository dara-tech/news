#!/usr/bin/env node

import mongoose from 'mongoose';
import Settings from '../models/Settings.mjs';
import logger from '../utils/logger.mjs';

/**
 * Cleanup Sentinel Sources Script
 * 
 * This script removes failed/unused sentinel sources and keeps only the working ones
 * to free up RAM and improve performance.
 */

async function cleanupSentinelSources() {
  try {
    logger.info('🧹 Starting Sentinel sources cleanup...');
    
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/newsapp');
    logger.info('✅ Connected to database');

    // Get current sentinel sources
    const integrations = await Settings.getCategorySettings('integrations');
    const currentSources = integrations.sentinelSources || [];
    
    logger.info(`📊 Found ${currentSources.length} current sources`);

    // Define working sources with reliability and priority scores
    const workingSources = [
      {
        name: 'Khmer Times',
        url: 'https://www.khmertimeskh.com/feed/',
        enabled: true,
        reliability: 0.9,
        priority: 'high',
        description: 'Local Cambodian news source with high reliability'
      },
      {
        name: 'TechCrunch',
        url: 'https://techcrunch.com/feed/',
        enabled: true,
        reliability: 0.95,
        priority: 'high',
        description: 'Technology news with excellent reliability'
      }
    ];

    // Find additional working sources from current list
    const additionalWorkingSources = [];
    
    // Test each current source to see if it's working
    for (const source of currentSources) {
      if (source.enabled === false) continue; // Skip already disabled sources
      
      // Check if it's already in our working list
      const isAlreadyWorking = workingSources.some(ws => ws.name === source.name);
      if (isAlreadyWorking) continue;
      
      // Test the source
      try {
        const Parser = (await import('rss-parser')).default;
        const parser = new Parser({ 
          timeout: 10000,
          requestOptions: {
            headers: {
              'User-Agent': 'Mozilla/5.0 (compatible; SentinelPP01/2.0; +https://news-app.local) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              'Accept': 'application/rss+xml, application/xml;q=0.9, */*;q=0.8'
            }
          }
        });
        
        const feed = await parser.parseURL(source.url);
        if (feed && feed.items && feed.items.length > 0) {
          additionalWorkingSources.push({
            name: source.name,
            url: source.url,
            enabled: true,
            reliability: 0.8, // Default reliability for newly tested sources
            priority: 'medium',
            description: `Working source: ${feed.title || source.name}`
          });
          logger.info(`✅ Found working source: ${source.name}`);
        }
      } catch (error) {
        logger.warn(`❌ Source failed: ${source.name} - ${error.message}`);
      }
    }

    // Combine working sources
    const allWorkingSources = [...workingSources, ...additionalWorkingSources];
    
    logger.info(`🎯 Keeping ${allWorkingSources.length} working sources:`);
    allWorkingSources.forEach(source => {
      logger.info(`  ✅ ${source.name} (reliability: ${source.reliability}, priority: ${source.priority})`);
    });

    // Update sentinel configuration
    const updatedConfig = {
      sentinelEnabled: true, // Re-enable sentinel with clean sources
      sentinelAutoPersist: false, // Keep disabled to avoid AI quota issues
      sentinelFrequencyMs: 3600000, // 1 hour instead of 5 minutes
      sentinelSources: allWorkingSources,
      sentinelLastRunAt: null // Reset last run time
    };

    // Update settings in database
    await Settings.updateCategorySettings('integrations', updatedConfig);
    
    logger.info('✅ Updated sentinel configuration with optimized sources');
    
    // Log the cleanup results
    const removedCount = currentSources.length - allWorkingSources.length;
    logger.info(`📈 Cleanup Results:`);
    logger.info(`  - Removed ${removedCount} failed/unused sources`);
    logger.info(`  - Kept ${allWorkingSources.length} working sources`);
    logger.info(`  - Added reliability and priority scores`);
    logger.info(`  - Re-enabled sentinel service`);
    
    // Calculate potential RAM savings
    const estimatedRAMSavings = removedCount * 2; // Rough estimate: 2MB per source
    logger.info(`💾 Estimated RAM savings: ~${estimatedRAMSavings}MB`);
    
    logger.info('🎉 Sentinel sources cleanup completed successfully!');
    
  } catch (error) {
    logger.error('❌ Sentinel sources cleanup failed:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    logger.info('🔌 Disconnected from database');
  }
}

// Run the cleanup
cleanupSentinelSources()
  .then(() => {
    logger.info('✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    logger.error('❌ Script failed:', error);
    process.exit(1);
  });
