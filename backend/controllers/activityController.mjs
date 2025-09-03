import asyncHandler from "express-async-handler";
import ActivityLog from "../models/ActivityLog.mjs";
import User from "../models/User.mjs";
import logger from '../utils/logger.mjs';

// @desc    Log activity (helper function)
// @access  Internal
export const logActivity = async (data) => {
  try {
    const {
      userId,
      action,
      entity,
      entityId,
      description,
      metadata = {},
      severity = 'low',
      req
    } = data;

    // Get real IP address (handle proxies, IPv6, etc.)
    const getClientIP = (req) => {
      return req?.headers['x-forwarded-for']?.split(',')[0] ||
             req?.headers['x-real-ip'] ||
             req?.ip ||
             req?.connection?.remoteAddress ||
             req?.socket?.remoteAddress ||
             (req?.connection?.socket ? req.connection.socket.remoteAddress : null) ||
             'unknown';
    };

    let clientIP = getClientIP(req);
    
    // Convert IPv6 localhost to IPv4 for better readability
    if (clientIP === '::1' || clientIP === '::ffff:127.0.0.1') {
      clientIP = '127.0.0.1 (localhost)';
    }

    const logData = {
      userId,
      action,
      entity,
      entityId,
      description,
      metadata,
      severity,
      ipAddress: clientIP,
      userAgent: req?.get?.('User-Agent') || req?.headers?.['user-agent']
    };

    await ActivityLog.create(logData);
  } catch (error) {
    logger.error('Failed to log activity:', error);
  }
};

// @desc    Get activity logs with pagination and filtering
// @route   GET /api/admin/activity
// @access  Private/Admin
export const getActivityLogs = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      action,
      entity,
      userId,
      severity,
      startDate,
      endDate,
      search
    } = req.query;

    // Build filter query
    const filter = {};

    if (action) filter.action = action;
    if (entity) filter.entity = entity;
    if (userId) filter.userId = userId;
    if (severity) filter.severity = severity;

    // Date range filter
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }

    // Search in description
    if (search) {
      filter.description = { $regex: search, $options: 'i' };
    }

    // Execute query with pagination
    const logs = await ActivityLog.find(filter)
      .populate('userId', 'username email profileImage')
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await ActivityLog.countDocuments(filter);

    res.json({
      success: true,
      logs,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalLogs: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    res.status(500);
    throw new Error('Failed to fetch activity logs');
  }
});

// @desc    Get activity log statistics
// @route   GET /api/admin/activity/stats
// @access  Private/Admin
export const getActivityStats = asyncHandler(async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Get activity counts by action
    const actionStats = await ActivityLog.aggregate([
      { $match: { timestamp: { $gte: startDate } } },
      { $group: { _id: '$action', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Get activity counts by entity
    const entityStats = await ActivityLog.aggregate([
      { $match: { timestamp: { $gte: startDate } } },
      { $group: { _id: '$entity', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Get daily activity counts
    const dailyStats = await ActivityLog.aggregate([
      { $match: { timestamp: { $gte: startDate } } },
      {
        $group: {
          _id: {
            year: { $year: '$timestamp' },
            month: { $month: '$timestamp' },
            day: { $dayOfMonth: '$timestamp' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    // Get most active users
    const activeUsers = await ActivityLog.aggregate([
      { $match: { timestamp: { $gte: startDate } } },
      { $group: { _id: '$userId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          username: '$user.username',
          email: '$user.email',
          count: 1
        }
      }
    ]);

    // Get severity distribution
    const severityStats = await ActivityLog.aggregate([
      { $match: { timestamp: { $gte: startDate } } },
      { $group: { _id: '$severity', count: { $sum: 1 } } }
    ]);

    // Total activities in period
    const totalActivities = await ActivityLog.countDocuments({
      timestamp: { $gte: startDate }
    });

    res.json({
      success: true,
      stats: {
        totalActivities,
        actionStats,
        entityStats,
        dailyStats,
        activeUsers,
        severityStats,
        period: `${days} days`
      }
    });

  } catch (error) {
    res.status(500);
    throw new Error('Failed to fetch activity statistics');
  }
});

// @desc    Get recent security events
// @route   GET /api/admin/activity/security
// @access  Private/Admin
export const getSecurityEvents = asyncHandler(async (req, res) => {
  try {
    const { limit = 50 } = req.query;

    const securityActions = [
      'user.login', 'user.logout', 'user.register',
      'admin.force_logout', 'security.update',
      'role.create', 'role.update', 'role.delete', 'role.assign'
    ];

    const events = await ActivityLog.find({
      $or: [
        { action: { $in: securityActions } },
        { severity: { $in: ['high', 'critical'] } }
      ]
    })
      .populate('userId', 'username email profileImage')
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      events
    });

  } catch (error) {
    res.status(500);
    throw new Error('Failed to fetch security events');
  }
});

// @desc    Export activity logs
// @route   GET /api/admin/activity/export
// @access  Private/Admin
export const exportActivityLogs = asyncHandler(async (req, res) => {
  try {
    const {
      format = 'csv',
      startDate,
      endDate,
      action,
      entity,
      severity
    } = req.query;

    // Build filter
    const filter = {};
    if (action) filter.action = action;
    if (entity) filter.entity = entity;
    if (severity) filter.severity = severity;

    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }

    const logs = await ActivityLog.find(filter)
      .populate('userId', 'username email profileImage')
      .sort({ timestamp: -1 })
      .limit(10000); // Limit for performance

    if (format === 'csv') {
      const csvHeader = 'Timestamp,User,Action,Entity,Description,Severity,IP Address\n';
      const csvData = logs.map(log => {
        const user = log.userId ? `${log.userId.username} (${log.userId.email})` : 'System';
        return [
          log.timestamp.toISOString(),
          user,
          log.action,
          log.entity,
          `"${log.description.replace(/"/g, '""')}"`,
          log.severity,
          log.ipAddress || ''
        ].join(',');
      }).join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=activity-logs-${new Date().toISOString().split('T')[0]}.csv`);
      res.send(csvHeader + csvData);
    } else {
      res.json({
        success: true,
        logs,
        total: logs.length
      });
    }

  } catch (error) {
    res.status(500);
    throw new Error('Failed to export activity logs');
  }
});

// @desc    Delete old activity logs
// @route   DELETE /api/admin/activity/cleanup
// @access  Private/Admin
export const cleanupActivityLogs = asyncHandler(async (req, res) => {
  try {
    const { days = 90 } = req.body;
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const result = await ActivityLog.deleteMany({
      timestamp: { $lt: cutoffDate }
    });

    res.json({
      success: true,
      message: `Deleted ${result.deletedCount} activity logs older than ${days} days`,
      deletedCount: result.deletedCount
    });

  } catch (error) {
    res.status(500);
    throw new Error('Failed to cleanup activity logs');
  }
});