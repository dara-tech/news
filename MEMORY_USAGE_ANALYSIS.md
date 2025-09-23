# 🧠 Memory Usage Analysis - Functions Using Most Memory

## 📊 **Top Memory-Intensive Functions Identified**

Based on code analysis, here are the functions and services that use the most memory in your application:

### **1. 🥇 Sentinel Service (Highest Memory Usage)**

**Location**: `backend/services/sentinelService.mjs`

**Memory-Intensive Components**:
- **`contentHashCache`** (Map): Stores content hashes for deduplication
- **`lastSeenGuids`** (Set): Tracks processed articles to avoid duplicates
- **`logBuffer`** (Array): Stores 500 log entries in memory
- **`safetyFilters`** (Object): Contains keyword arrays for content filtering
- **`performanceMetrics`** (Object): Tracks processing statistics

**Memory Usage**:
```javascript
// These data structures grow over time:
this.contentHashCache = new Map(); // Stores content hashes
this.lastSeenGuids = new Set();    // Stores GUIDs of processed articles
this.logBuffer = [];               // Stores 500 log entries
this.safetyFilters = {             // Keyword arrays
  sensitiveKeywords: [...],        // ~20 keywords
  biasIndicators: [...]           // ~10 indicators
};
```

**Estimated Memory**: ~50-100MB (depending on content volume)

---

### **2. 🥈 Performance Monitor Service**

**Location**: `backend/services/performanceMonitor.mjs`

**Memory-Intensive Components**:
- **`metrics.memory`** (Array): Stores 100 memory measurements
- **`metrics.cpu`** (Array): Stores 100 CPU measurements
- **`metrics.requests`** (Map): Tracks request metrics
- **`metrics.responses`** (Map): Tracks response metrics
- **`metrics.database`** (Map): Tracks database metrics

**Memory Usage**:
```javascript
this.metrics = {
  requests: new Map(),     // Request tracking
  responses: new Map(),    // Response tracking
  errors: new Map(),       // Error tracking
  database: new Map(),     // Database metrics
  memory: [],             // 100 memory snapshots
  cpu: [],                // 100 CPU snapshots
  alerts: []              // Alert history
};
```

**Estimated Memory**: ~20-30MB

---

### **3. 🥉 Real-Time User Tracker**

**Location**: `backend/services/realTimeUserTracker.mjs`

**Memory-Intensive Components**:
- **`activeUsers`** (Map): Tracks active user sessions
- **`pageViews`** (Map): Tracks article view counts
- **`userSessions`** (Map): Stores user session data
- **`locationCache`** (Map): Caches IP-to-location mappings

**Memory Usage**:
```javascript
this.activeUsers = new Map();     // userId -> session data
this.pageViews = new Map();       // articleId -> view count
this.userSessions = new Map();    // sessionId -> session data
this.locationCache = new Map();   // IP -> location data
```

**Estimated Memory**: ~10-20MB (scales with user count)

---

### **4. 🔄 Redis Cache Service**

**Location**: `backend/services/redisCacheService.mjs`

**Memory-Intensive Components**:
- **`cache`** (Map): In-memory cache storage
- **`ttl`** (Map): Time-to-live tracking
- **`stats`** (Object): Cache statistics

**Memory Usage**:
```javascript
this.cache = new Map();           // Main cache storage
this.ttl = new Map();             // TTL tracking
this.maxSize = 1000;              // Maximum 1000 entries
```

**Estimated Memory**: ~5-15MB (depends on cache size)

---

### **5. 🌐 WebSocket Service**

**Location**: `backend/services/websocketService.mjs`

**Memory-Intensive Components**:
- **`connectedUsers`** (Map): Tracks connected WebSocket users
- **`rooms`** (Map): Manages chat rooms
- **`messageHistory`** (Map): Stores message history per room

**Memory Usage**:
```javascript
this.connectedUsers = new Map();  // Connected users
this.rooms = new Map();           // Chat rooms
this.messageHistory = new Map();  // Message history (100 per room)
this.maxHistorySize = 100;        // Max messages per room
```

**Estimated Memory**: ~5-10MB (scales with active connections)

---

## 🎯 **Memory Optimization Recommendations**

### **Immediate Actions (High Impact)**

1. **Optimize Sentinel Service**:
   ```javascript
   // Reduce log buffer size
   this.logBuffer = this.logBuffer.slice(-200); // Instead of 500
   
   // Clean cache more frequently
   const oneHourAgo = Date.now() - (60 * 60 * 1000);
   for (const [hash, timestamp] of this.contentHashCache.entries()) {
     if (timestamp < oneHourAgo) {
       this.contentHashCache.delete(hash);
     }
   }
   ```

2. **Optimize Performance Monitor**:
   ```javascript
   // Reduce metrics history
   if (this.metrics.memory.length > 50) {
     this.metrics.memory = this.metrics.memory.slice(-50);
   }
   ```

3. **Add Memory Cleanup to User Tracker**:
   ```javascript
   // Clean inactive users more frequently
   setInterval(() => this.cleanupInactiveUsers(), 60000); // Every minute
   ```

### **Medium Impact Optimizations**

4. **Implement Cache Size Limits**:
   ```javascript
   // Add size limits to all Maps
   if (this.cache.size > this.maxSize) {
     const firstKey = this.cache.keys().next().value;
     this.cache.delete(firstKey);
   }
   ```

5. **Add Memory Monitoring**:
   ```javascript
   // Monitor memory usage
   const memoryUsage = process.memoryUsage();
   if (memoryUsage.heapUsed > 100 * 1024 * 1024) { // 100MB
     this.cleanupMemory();
   }
   ```

### **Long-term Optimizations**

6. **Move to Redis**: Replace in-memory caches with Redis
7. **Implement Pagination**: Limit data structures to reasonable sizes
8. **Add Memory Profiling**: Regular memory usage monitoring
9. **Database Optimization**: Use database for persistent storage instead of memory

---

## 📈 **Current Memory Usage Estimate**

| Service | Estimated Memory | Priority |
|---------|------------------|----------|
| Sentinel Service | 50-100MB | 🔴 High |
| Performance Monitor | 20-30MB | 🟡 Medium |
| User Tracker | 10-20MB | 🟡 Medium |
| Redis Cache | 5-15MB | 🟢 Low |
| WebSocket Service | 5-10MB | 🟢 Low |
| **Total** | **90-175MB** | |

---

## 🚀 **Quick Wins for Memory Reduction**

1. **Reduce Sentinel log buffer**: 500 → 200 entries (-60% memory)
2. **Clean caches more frequently**: Every 1 hour instead of 12 hours
3. **Limit performance metrics**: 100 → 50 entries (-50% memory)
4. **Add memory cleanup intervals**: Every 5 minutes
5. **Implement size limits**: Prevent unlimited growth

These optimizations could reduce memory usage by **30-50%** while maintaining functionality.
