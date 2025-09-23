#!/usr/bin/env node

/**
 * Memory Monitor for 512MB Server
 * 
 * This script monitors memory usage and triggers cleanup when needed.
 * Add this to your main server.mjs file.
 */

class MemoryMonitor {
  constructor() {
    this.warningThreshold = 400; // 400MB (78% of 512MB)
    this.criticalThreshold = 450; // 450MB (88% of 512MB)
    this.cleanupThreshold = 350; // 350MB (68% of 512MB)
    this.monitorInterval = 30000; // Check every 30 seconds
    this.cleanupInterval = 300000; // Clean every 5 minutes
    this.isMonitoring = false;
    this.cleanupCallbacks = [];
  }

  start() {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    console.log('🧠 Memory monitor started for 512MB server');
    
    // Monitor memory usage
    this.monitorHandle = setInterval(() => {
      this.checkMemoryUsage();
    }, this.monitorInterval);
    
    // Periodic cleanup
    this.cleanupHandle = setInterval(() => {
      this.performCleanup();
    }, this.cleanupInterval);
  }

  stop() {
    if (!this.isMonitoring) return;
    
    this.isMonitoring = false;
    clearInterval(this.monitorHandle);
    clearInterval(this.cleanupHandle);
    console.log('🧠 Memory monitor stopped');
  }

  checkMemoryUsage() {
    const memoryUsage = process.memoryUsage();
    const memoryMB = memoryUsage.heapUsed / 1024 / 1024;
    const totalMB = 512; // Server total RAM
    const percentage = (memoryMB / totalMB) * 100;
    
    // Log memory status
    if (memoryMB > this.criticalThreshold) {
      console.error(`🚨 CRITICAL: Memory usage ${memoryMB.toFixed(2)}MB (${percentage.toFixed(1)}%) - Consider restarting server`);
      this.emergencyCleanup();
    } else if (memoryMB > this.warningThreshold) {
      console.warn(`⚠️ WARNING: High memory usage ${memoryMB.toFixed(2)}MB (${percentage.toFixed(1)}%)`);
      this.performCleanup();
    } else if (memoryMB > this.cleanupThreshold) {
      console.log(`🧹 Memory usage ${memoryMB.toFixed(2)}MB (${percentage.toFixed(1)}%) - Performing cleanup`);
      this.performCleanup();
    } else {
      console.log(`✅ Memory usage ${memoryMB.toFixed(2)}MB (${percentage.toFixed(1)}%) - OK`);
    }
    
    // Return memory info for external use
    return {
      heapUsed: memoryMB,
      heapTotal: memoryUsage.heapTotal / 1024 / 1024,
      external: memoryUsage.external / 1024 / 1024,
      rss: memoryUsage.rss / 1024 / 1024,
      percentage: percentage,
      status: memoryMB > this.criticalThreshold ? 'critical' : 
              memoryMB > this.warningThreshold ? 'warning' : 
              memoryMB > this.cleanupThreshold ? 'cleanup' : 'ok'
    };
  }

  performCleanup() {
    console.log('🧹 Performing memory cleanup...');
    
    // Trigger registered cleanup callbacks
    this.cleanupCallbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('❌ Cleanup callback error:', error.message);
      }
    });
    
    // Force garbage collection if available
    if (global.gc) {
      global.gc();
      console.log('🗑️ Garbage collection triggered');
    }
    
    // Log memory after cleanup
    const memoryUsage = process.memoryUsage();
    const memoryMB = memoryUsage.heapUsed / 1024 / 1024;
    console.log(`✅ Cleanup completed - Memory: ${memoryMB.toFixed(2)}MB`);
  }

  emergencyCleanup() {
    console.log('🚨 EMERGENCY: Performing aggressive memory cleanup...');
    
    // Clear all caches and buffers
    this.cleanupCallbacks.forEach(callback => {
      try {
        callback(true); // Pass emergency flag
      } catch (error) {
        console.error('❌ Emergency cleanup callback error:', error.message);
      }
    });
    
    // Force garbage collection multiple times
    if (global.gc) {
      for (let i = 0; i < 3; i++) {
        global.gc();
      }
      console.log('🗑️ Emergency garbage collection triggered');
    }
    
    // Log final memory
    const memoryUsage = process.memoryUsage();
    const memoryMB = memoryUsage.heapUsed / 1024 / 1024;
    console.log(`🚨 Emergency cleanup completed - Memory: ${memoryMB.toFixed(2)}MB`);
    
    if (memoryMB > this.criticalThreshold) {
      console.error('💀 CRITICAL: Memory still high after emergency cleanup - Server may need restart');
    }
  }

  // Register cleanup callbacks
  onCleanup(callback) {
    this.cleanupCallbacks.push(callback);
  }

  // Get current memory status
  getStatus() {
    return this.checkMemoryUsage();
  }

  // Get memory recommendations
  getRecommendations() {
    const status = this.getStatus();
    const recommendations = [];
    
    if (status.percentage > 80) {
      recommendations.push('🚨 CRITICAL: Consider restarting server');
      recommendations.push('💡 Disable non-essential services');
      recommendations.push('🔄 Clear all caches and buffers');
    } else if (status.percentage > 60) {
      recommendations.push('⚠️ WARNING: High memory usage');
      recommendations.push('🧹 Increase cleanup frequency');
      recommendations.push('📉 Reduce cache sizes');
    } else if (status.percentage > 40) {
      recommendations.push('✅ Memory usage acceptable');
      recommendations.push('📊 Monitor for trends');
    } else {
      recommendations.push('🎉 Memory usage excellent');
      recommendations.push('📈 Consider enabling more features');
    }
    
    return recommendations;
  }
}

// Create global instance
const memoryMonitor = new MemoryMonitor();

// Export for use in other modules
export default memoryMonitor;

// If running directly, start monitoring
if (import.meta.url === `file://${process.argv[1]}`) {
  memoryMonitor.start();
  
  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down memory monitor...');
    memoryMonitor.stop();
    process.exit(0);
  });
  
  // Keep process alive
  setInterval(() => {}, 1000);
}
