import asyncHandler from "express-async-handler";
import os from 'os';
import Settings from '../models/Settings.mjs';
import sentinelService from '../services/sentinelService.mjs';
import logger from '../utils/logger.mjs';

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

// @desc    Get Sentinel configuration/state
// @route   GET /api/admin/system/sentinel
// @access  Private/Admin
export const getSentinelConfig = asyncHandler(async (req, res) => {
  try {
    // Ensure database connection before accessing any models
    const mongoose = (await import('mongoose')).default;
    if (mongoose.connection.readyState !== 1) {
      logger.info('Database not connected in getSentinelConfig, attempting to connect...');
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/newsapp');
      logger.info('Database connection established in getSentinelConfig');
    }
    
    const cfg = await Settings.getCategorySettings('integrations');
    
    // Get real-time status by checking if sentinel is actually running
    let isActuallyRunning = await checkSentinelRealTimeStatus();
    
    // If the direct check fails, try activity-based checking
    if (!isActuallyRunning) {
      isActuallyRunning = await checkSentinelStatusByActivity();
    }
    
    
  res.json({
    success: true,
    config: {
      enabled: !!cfg.sentinelEnabled,
      autoPersist: !!cfg.sentinelAutoPersist,
      frequencyMs: Number(cfg.sentinelFrequencyMs || 300000),
      sources: cfg.sentinelSources || [],
      lastRunAt: cfg.sentinelLastRunAt || null
    },
    runtime: {
        running: isActuallyRunning,
        nextRun: sentinelService.nextRunAt,
        lastRun: sentinelService.lastRunAt,
      lastCreated: sentinelService.lastCreated,
      lastProcessed: sentinelService.lastProcessed,
      cooldownUntil: sentinelService.cooldownUntilMs ? new Date(sentinelService.cooldownUntilMs) : null,
      maxPerRun: Number(process.env.SENTINEL_MAX_PER_RUN || 3),
      frequencyMs: sentinelService.frequencyMs,
        sourcesCount: sentinelService.sources?.length || 0,
        status: isActuallyRunning ? 'running' : 'stopped'
      }
    });
  } catch (error) {
    logger.error('Error getting sentinel config:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get sentinel configuration'
    });
  }
});

// Helper function to check real-time sentinel status
async function checkSentinelRealTimeStatus() {
  try {
    // Check if sentinel service has an active interval
    if (!sentinelService.intervalHandle) {
      return false;
    }
    
    // Check if sentinel service is marked as running
    if (!sentinelService.isRunning) {
      return false;
    }
    
    // Check if sentinel has sources loaded
    if (!sentinelService.sources || sentinelService.sources.length === 0) {
      return false;
    }
    
    // Check if sentinel has a valid frequency
    if (!sentinelService.frequencyMs || sentinelService.frequencyMs <= 0) {
      return false;
    }
    
    // Additional check: verify the interval is actually scheduled
    const now = Date.now();
    const nextRun = sentinelService.nextRunAt;
    
    // If nextRunAt is in the future, it's likely running
    if (nextRun && nextRun > now) {
      return true;
    }
    
    // If we have recent activity (last run within the last 10 minutes), consider it running
    const lastRun = sentinelService.lastRunAt;
    if (lastRun && (now - lastRun.getTime()) < 600000) { // 10 minutes
      return true;
    }
    
    return false;
  } catch (error) {
    logger.error('Error checking sentinel real-time status:', error);
    return false;
  }
}


// Alternative method: Check sentinel status by looking at recent activity in logs
export async function checkSentinelStatusByActivity() {
  try {
    const fs = await import('fs');
    const path = await import('path');
    
    // Read the last few lines of the combined log to check for recent sentinel activity
    const logPath = path.join(process.cwd(), 'logs', 'combined.log');
    
    if (!fs.existsSync(logPath)) {
      return false;
    }
    
    const logContent = fs.readFileSync(logPath, 'utf8');
    const lines = logContent.split('\n').filter(line => line.trim());
    const recentLines = lines.slice(-50); // Last 50 lines
    
    // Look for recent sentinel activity
    const now = Date.now();
    let hasRecentActivity = false;
    
    for (const line of recentLines) {
      try {
        const logEntry = JSON.parse(line);
        const timestamp = new Date(logEntry.timestamp).getTime();
        
        // Check if this is a recent sentinel log entry (within last 5 minutes)
        if (now - timestamp < 300000 && // 5 minutes
            logEntry.message && 
            logEntry.message.includes('[Sentinel-PP-01]')) {
          hasRecentActivity = true;
          break;
        }
      } catch (e) {
        // Skip non-JSON lines
        continue;
      }
    }
    
    return hasRecentActivity;
  } catch (error) {
    logger.error('Error checking sentinel status by activity:', error);
    return false;
  }
}

// @desc    Get real-time sentinel status
// @route   GET /api/admin/system/sentinel/status
// @access  Private/Admin
// @desc    Stop sentinel service
// @route   POST /api/admin/system/sentinel/stop
// @access  Private/Admin
export const stopSentinelService = asyncHandler(async (req, res) => {
  try {
    // Ensure database connection before accessing any models
    const mongoose = (await import('mongoose')).default;
    if (mongoose.connection.readyState !== 1) {
      logger.info('Database not connected in stopSentinelService, attempting to connect...');
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/newsapp');
      logger.info('Database connection established in stopSentinelService');
    }
    
    // Stop the sentinel service
    await sentinelService.stop();
    
    logger.info('Sentinel service stopped manually');
    
    res.json({
      success: true,
      message: 'Sentinel service stopped successfully'
    });
  } catch (error) {
    logger.error('Error stopping sentinel service:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to stop sentinel service'
    });
  }
});

export const getSentinelStatus = asyncHandler(async (req, res) => {
  try {
    // Ensure database connection before accessing any models
    const mongoose = (await import('mongoose')).default;
    if (mongoose.connection.readyState !== 1) {
      logger.info('Database not connected in getSentinelStatus, attempting to connect...');
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/newsapp');
      logger.info('Database connection established in getSentinelStatus');
    }
    
    let isRunning = await checkSentinelRealTimeStatus();
    
    // If the direct check fails, try activity-based checking
    if (!isRunning) {
      isRunning = await checkSentinelStatusByActivity();
    }
    
    const cfg = await Settings.getCategorySettings('integrations');
    
    
    res.json({
      success: true,
      status: isRunning ? 'running' : 'stopped',
      running: isRunning,
      enabled: !!cfg.sentinelEnabled,
      sourcesCount: sentinelService.sources?.length || 0,
      lastRun: sentinelService.lastRunAt,
      nextRun: sentinelService.nextRunAt,
      lastCreated: sentinelService.lastCreated,
      lastProcessed: sentinelService.lastProcessed,
      frequencyMs: sentinelService.frequencyMs,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error getting sentinel status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get sentinel status'
    });
  }
});

// @desc    Update Sentinel configuration
// @route   PUT /api/admin/system/sentinel
// @access  Private/Admin
export const updateSentinelConfig = asyncHandler(async (req, res) => {
  const { enabled, autoPersist, frequencyMs, sources } = req.body;
  const userId = req.user?._id || new (await import('mongoose')).default.Types.ObjectId('000000000000000000000000');
  const updates = {};
  if (enabled !== undefined) updates.sentinelEnabled = !!enabled;
  if (autoPersist !== undefined) updates.sentinelAutoPersist = !!autoPersist;
  if (frequencyMs !== undefined) updates.sentinelFrequencyMs = Number(frequencyMs);
  if (Array.isArray(sources)) updates.sentinelSources = sources;
  const saved = await Settings.updateCategorySettings('integrations', updates, userId);
  // Restart sentinel if running
  try {
    sentinelService.stop();
    if (updates.sentinelEnabled) {
      process.env.SENTINEL_ENABLED = 'true';
      if (updates.sentinelFrequencyMs) process.env.SENTINEL_FREQUENCY_MS = String(updates.sentinelFrequencyMs);
      sentinelService.start();
    }
  } catch (e) {
    // ignore
  }
  res.json({ success: true, settings: saved });
});

// @desc    Run Sentinel one-off (no persist)
// @route   POST /api/admin/system/sentinel/run-once
// @access  Private/Admin
export const runSentinelOnce = asyncHandler(async (req, res) => {
  try {
    logger.info('[Sentinel] Starting run-once execution...');
    
    // Check if Gemini API key is available
    if (!process.env.GEMINI_API_KEY && !process.env.GOOGLE_API_KEY) {
      return res.status(500).json({ 
        success: false, 
        message: 'GEMINI_API_KEY not configured. Please add your Gemini API key to the environment variables.' 
      });
    }

    const result = await sentinelService.runOnce();
    const now = new Date();
    await Settings.updateCategorySettings('integrations', { sentinelLastRunAt: now }, req.user?._id);
    
    logger.info('[Sentinel] Run-once completed successfully:', result);
    res.json({ 
      success: true, 
      message: 'Sentinel executed successfully.',
      result: {
        processed: result.processed,
        created: result.created,
        previews: result.previews?.length || 0
      }
    });
  } catch (e) {
    logger.error('[Sentinel] Run-once error:', e);
    res.status(500).json({ 
      success: false, 
      message: e.message || 'Failed to execute Sentinel',
      error: process.env.NODE_ENV === 'development' ? e.stack : undefined
    });
  }
});

// @desc    Get recent Sentinel logs (in-memory buffer)
// @route   GET /api/admin/system/sentinel/logs
// @access  Private/Admin
export const getSentinelLogs = asyncHandler(async (req, res) => {
  const logs = sentinelService.logBuffer || [];
  res.json({ success: true, logs });
});

// @desc    Import a single URL via Sentinel (preview or persist)
// @route   POST /api/admin/system/sentinel/import-url
// @access  Private/Admin
export const importSentinelUrl = asyncHandler(async (req, res) => {
  const { url, persist } = req.body || {};
  if (!url) return res.status(400).json({ success: false, message: 'url is required' });
  const result = await sentinelService.importUrl(url, { persist: !!persist });
  if (result.success) return res.json({ success: true, ...result });
  return res.status(500).json({ success: false, message: result.message || 'Import failed' });
});