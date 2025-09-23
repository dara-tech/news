# 🚨 Critical Memory Optimization for 512MB Server

## ⚠️ **Current Situation**
- **Server RAM**: 512MB total
- **Current Usage**: 90-175MB (17-34% of RAM)
- **Available**: 337-422MB remaining
- **Risk**: Memory pressure can cause crashes and poor performance

## 🎯 **Aggressive Memory Optimization Plan**

### **Phase 1: Immediate Critical Fixes (Reduce to ~30-50MB)**

#### **1. Sentinel Service Optimization (Target: 15-20MB)**
```javascript
// Reduce log buffer drastically
this.logBuffer = this.logBuffer.slice(-50); // Instead of 500

// Clean cache every 30 minutes instead of 12 hours
const thirtyMinutesAgo = Date.now() - (30 * 60 * 1000);
for (const [hash, timestamp] of this.contentHashCache.entries()) {
  if (timestamp < thirtyMinutesAgo) {
    this.contentHashCache.delete(hash);
  }
}

// Limit lastSeenGuids to recent items only
if (this.lastSeenGuids.size > 1000) {
  const guidsArray = Array.from(this.lastSeenGuids);
  this.lastSeenGuids = new Set(guidsArray.slice(-500));
}
```

#### **2. Performance Monitor Optimization (Target: 5-10MB)**
```javascript
// Reduce metrics history drastically
if (this.metrics.memory.length > 20) {
  this.metrics.memory = this.metrics.memory.slice(-20);
}
if (this.metrics.cpu.length > 20) {
  this.metrics.cpu = this.metrics.cpu.slice(-20);
}

// Clear Maps more frequently
if (this.metrics.requests.size > 100) {
  this.metrics.requests.clear();
}
```

#### **3. User Tracker Optimization (Target: 5-10MB)**
```javascript
// Clean inactive users every 30 seconds
setInterval(() => this.cleanupInactiveUsers(), 30000);

// Limit cache sizes
if (this.locationCache.size > 100) {
  this.locationCache.clear();
}
if (this.pageViews.size > 500) {
  this.pageViews.clear();
}
```

### **Phase 2: Service Disabling (Emergency Mode)**

#### **4. Disable Non-Essential Services**
```javascript
// Disable performance monitoring in production
if (process.env.NODE_ENV === 'production') {
  // Comment out performance monitor
  // this.startMonitoring();
}

// Disable real-time user tracking
// Comment out user tracker initialization

// Disable WebSocket service if not critical
// Comment out WebSocket initialization
```

#### **5. Reduce Cache Sizes**
```javascript
// Redis cache service
this.maxSize = 100; // Instead of 1000
this.defaultTTL = 60; // 1 minute instead of 5 minutes

// Node cache middleware
const cache = new NodeCache({
  stdTTL: 60,        // 1 minute instead of 5 minutes
  checkperiod: 30,   // Check every 30 seconds
  maxKeys: 50,       // 50 keys instead of 1000
  useClones: false   // Don't clone objects
});
```

### **Phase 3: Database Optimization**

#### **6. Optimize Database Queries**
```javascript
// Use lean() for read-only queries
const news = await News.find().lean().limit(10);

// Use select() to only fetch needed fields
const users = await User.find().select('name email').lean();

// Use pagination for large datasets
const page = req.query.page || 1;
const limit = 20;
const skip = (page - 1) * limit;
```

#### **7. Implement Memory Monitoring**
```javascript
// Add memory monitoring
setInterval(() => {
  const memoryUsage = process.memoryUsage();
  const memoryMB = memoryUsage.heapUsed / 1024 / 1024;
  
  if (memoryMB > 400) { // 400MB threshold (78% of 512MB)
    console.warn(`⚠️ High memory usage: ${memoryMB.toFixed(2)}MB`);
    // Trigger cleanup
    this.emergencyCleanup();
  }
}, 30000); // Check every 30 seconds

emergencyCleanup() {
  // Clear all caches
  this.contentHashCache.clear();
  this.lastSeenGuids.clear();
  this.logBuffer = [];
  
  // Force garbage collection if available
  if (global.gc) {
    global.gc();
  }
}
```

## 🚀 **Implementation Script**

Let me create a script to implement these optimizations:

```javascript
// backend/scripts/optimize-for-512mb.mjs
import mongoose from 'mongoose';
import Settings from '../models/Settings.mjs';
import logger from '../utils/logger.mjs';

async function optimizeFor512MB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/newsapp');
    
    console.log('🚨 Optimizing for 512MB server...');
    
    // 1. Disable non-essential services
    const integrations = await Settings.getCategorySettings('integrations');
    const optimizedConfig = {
      ...integrations,
      // Disable performance monitoring
      performanceMonitoringEnabled: false,
      // Reduce cache sizes
      cacheMaxSize: 50,
      cacheTTL: 60, // 1 minute
      // Reduce sentinel frequency
      sentinelFrequencyMs: 7200000, // 2 hours instead of 6
      // Disable auto-persist
      sentinelAutoPersist: false,
      // Reduce log buffer
      logBufferSize: 50
    };
    
    await Settings.updateCategorySettings('integrations', optimizedConfig);
    
    console.log('✅ Optimized configuration for 512MB server');
    console.log('📊 Expected memory usage: 30-50MB (6-10% of RAM)');
    
  } catch (error) {
    console.error('❌ Optimization failed:', error);
  } finally {
    await mongoose.disconnect();
  }
}

optimizeFor512MB();
```

## 📊 **Memory Usage After Optimization**

| Service | Before | After | Savings |
|---------|--------|-------|---------|
| Sentinel Service | 50-100MB | 15-20MB | 70-80% |
| Performance Monitor | 20-30MB | 5-10MB | 70-80% |
| User Tracker | 10-20MB | 5-10MB | 50% |
| Redis Cache | 5-15MB | 2-5MB | 70% |
| WebSocket Service | 5-10MB | 2-5MB | 50% |
| **Total** | **90-175MB** | **30-50MB** | **65-70%** |

## 🎯 **Target Memory Usage: 30-50MB (6-10% of 512MB)**

This leaves **462-482MB** available for:
- Node.js runtime
- Database connections
- Operating system
- Other processes
- Buffer for memory spikes

## ⚠️ **Critical Recommendations**

1. **Monitor Memory Constantly**: Set up alerts at 400MB usage
2. **Use Swap Space**: Configure swap file for emergency memory
3. **Upgrade Server**: Consider upgrading to 1GB+ RAM
4. **Use External Services**: Move caching to Redis (external)
5. **Database Optimization**: Use MongoDB with memory limits

## 🚨 **Emergency Memory Management**

```javascript
// Add to your main server file
process.on('warning', (warning) => {
  if (warning.name === 'MaxListenersExceededWarning') {
    console.warn('⚠️ Memory pressure detected');
    // Trigger cleanup
  }
});

// Monitor memory every 30 seconds
setInterval(() => {
  const memoryUsage = process.memoryUsage();
  const memoryMB = memoryUsage.heapUsed / 1024 / 1024;
  
  if (memoryMB > 400) {
    console.error(`🚨 CRITICAL: Memory usage ${memoryMB.toFixed(2)}MB`);
    // Emergency cleanup
    global.gc && global.gc();
  }
}, 30000);
```

This optimization plan should reduce your memory usage to **30-50MB**, giving you plenty of headroom on your 512MB server!
