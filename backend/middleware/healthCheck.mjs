import mongoose from 'mongoose';

// Health check middleware
export const healthCheckMiddleware = async (req, res, next) => {
  try {
    // Check database connection
    const dbState = mongoose.connection.readyState;
    const isDbConnected = dbState === 1; // 1 = connected

    // Check memory usage
    const memUsage = process.memoryUsage();
    const memUsageMB = {
      rss: Math.round(memUsage.rss / 1024 / 1024),
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
      external: Math.round(memUsage.external / 1024 / 1024),
    };

    // Check uptime
    const uptime = process.uptime();

    // Determine overall health
    const isHealthy = isDbConnected && memUsageMB.heapUsed < 1000; // Less than 1GB heap usage

    const healthStatus = {
      status: isHealthy ? 'OK' : 'DEGRADED',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      uptime: Math.round(uptime),
      database: {
        connected: isDbConnected,
        state: dbState,
      },
      memory: memUsageMB,
      version: process.env.npm_package_version || '1.0.0',
    };

    // Add to request for use in routes
    req.healthStatus = healthStatus;

    if (req.path === '/health' || req.path === '/api/health') {
      const statusCode = isHealthy ? 200 : 503;
      return res.status(statusCode).json(healthStatus);
    }

    next();
  } catch (error) {const errorStatus = {
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      error: error.message,
    };

    if (req.path === '/health' || req.path === '/api/health') {
      return res.status(503).json(errorStatus);
    }

    next();
  }
};

// Detailed health check for admin
export const detailedHealthCheck = async (req, res) => {
  try {
    const db = mongoose.connection.db;
    
    // Get database stats
    const dbStats = await db.stats();
    
    // Get collection counts
    const collections = await db.listCollections().toArray();
    const collectionStats = {};
    
    for (const collection of collections) {
      try {
        const count = await db.collection(collection.name).countDocuments();
        collectionStats[collection.name] = count;
      } catch (error) {
        collectionStats[collection.name] = 'Error: ' + error.message;
      }
    }

    // Get server info
    const serverInfo = await db.admin().serverStatus();
    
    const detailedStatus = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      uptime: Math.round(process.uptime()),
      database: {
        connected: mongoose.connection.readyState === 1,
        name: db.databaseName,
        stats: {
          collections: dbStats.collections,
          dataSize: Math.round(dbStats.dataSize / 1024 / 1024) + ' MB',
          storageSize: Math.round(dbStats.storageSize / 1024 / 1024) + ' MB',
          indexes: dbStats.indexes,
        },
        collections: collectionStats,
        server: {
          version: serverInfo.version,
          uptime: serverInfo.uptime,
          connections: serverInfo.connections,
        },
      },
      memory: {
        rss: Math.round(process.memoryUsage().rss / 1024 / 1024) + ' MB',
        heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB',
        heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
        external: Math.round(process.memoryUsage().external / 1024 / 1024) + ' MB',
      },
      version: process.env.npm_package_version || '1.0.0',
    };

    res.json(detailedStatus);
  } catch (error) {res.status(500).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      error: error.message,
    });
  }
};

