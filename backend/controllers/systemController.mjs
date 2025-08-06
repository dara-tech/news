import asyncHandler from "express-async-handler";
import os from 'os';

// @desc    Get system metrics
// @route   GET /api/admin/system/metrics
// @access  Private/Admin
export const getSystemMetrics = asyncHandler(async (req, res) => {
  try {
    // Calculate uptime
    const uptimeSeconds = os.uptime();
    const days = Math.floor(uptimeSeconds / (24 * 60 * 60));
    const hours = Math.floor((uptimeSeconds % (24 * 60 * 60)) / (60 * 60));
    const uptime = `${days} days, ${hours} hours`;

    // Get memory usage
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;
    const memoryUsage = Math.round((usedMemory / totalMemory) * 100);

    // Mock CPU usage (in production, you'd use a proper monitoring library)
    const cpuUsage = Math.floor(Math.random() * 30) + 40;

    // Mock disk usage (in production, you'd check actual disk usage)
    const diskUsage = Math.floor(Math.random() * 20) + 25;

    // Mock network latency
    const networkLatency = Math.floor(Math.random() * 50) + 10;

    // Mock response time
    const responseTime = Math.floor(Math.random() * 200) + 50;

    // Mock requests per minute
    const requestsPerMinute = Math.floor(Math.random() * 1000) + 500;

    const metrics = {
      server: {
        uptime,
        status: 'healthy',
        responseTime,
        requestsPerMinute
      },
      database: {
        status: 'healthy',
        connectionPool: Math.floor(Math.random() * 20) + 10,
        slowQueries: Math.floor(Math.random() * 5),
        size: '2.4 GB'
      },
      performance: {
        cpuUsage,
        memoryUsage,
        diskUsage,
        networkLatency
      },
      endpoints: [
        {
          name: 'API Server',
          url: '/api/health',
          status: 'up',
          responseTime: Math.floor(Math.random() * 100) + 20,
          lastChecked: new Date().toISOString()
        },
        {
          name: 'Database',
          url: 'mongodb://localhost',
          status: 'up',
          responseTime: Math.floor(Math.random() * 50) + 10,
          lastChecked: new Date().toISOString()
        },
        {
          name: 'File Storage',
          url: '/uploads',
          status: 'up',
          responseTime: Math.floor(Math.random() * 150) + 30,
          lastChecked: new Date().toISOString()
        },
        {
          name: 'Email Service',
          url: 'smtp://mail.server.com',
          status: Math.random() > 0.8 ? 'slow' : 'up',
          responseTime: Math.floor(Math.random() * 500) + 100,
          lastChecked: new Date().toISOString()
        }
      ],
      errors: [
        {
          timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
          level: 'warning',
          message: 'High memory usage detected',
          count: 3
        },
        {
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          level: 'error',
          message: 'Failed to connect to external API',
          count: 1
        },
        {
          timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
          level: 'info',
          message: 'Database backup completed successfully',
          count: 1
        }
      ]
    };

    res.json({
      success: true,
      metrics
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching system metrics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});