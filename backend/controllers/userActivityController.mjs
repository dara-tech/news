import asyncHandler from "express-async-handler";
import ActivityLog from "../models/ActivityLog.mjs";

// @desc    Get user's own activity logs with pagination and filtering
// @route   GET /api/user/activity
// @access  Private
export const getUserActivityLogs = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  // Build filter object - only show current user's activities
  const filter = { userId: req.user._id };

  // Add optional filters
  if (req.query.action && req.query.action !== 'all') {
    filter.action = req.query.action;
  }
  if (req.query.entity && req.query.entity !== 'all') {
    filter.entity = req.query.entity;
  }
  if (req.query.severity && req.query.severity !== 'all') {
    filter.severity = req.query.severity;
  }
  if (req.query.search) {
    filter.description = { $regex: req.query.search, $options: 'i' };
  }
  if (req.query.startDate) {
    filter.timestamp = { $gte: new Date(req.query.startDate) };
  }
  if (req.query.endDate) {
    if (filter.timestamp) {
      filter.timestamp.$lte = new Date(req.query.endDate);
    } else {
      filter.timestamp = { $lte: new Date(req.query.endDate) };
    }
  }

  try {
    const [logs, total] = await Promise.all([
      ActivityLog.find(filter)
        .populate('userId', 'username email')
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit),
      ActivityLog.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      logs,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit
      }
    });
  } catch (error) {
    console.error('Error fetching user activity logs:', error);
    res.status(500);
    throw new Error('Failed to fetch activity logs');
  }
});

// @desc    Get user's activity statistics
// @route   GET /api/user/activity/stats
// @access  Private
export const getUserActivityStats = asyncHandler(async (req, res) => {
  const days = parseInt(req.query.days) || 30;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  try {
    const [
      totalActivities,
      actionStats,
      entityStats,
      severityStats,
      dailyStats,
      lastLogin,
      mostActiveDay
    ] = await Promise.all([
      // Total activities in period
      ActivityLog.countDocuments({
        userId: req.user._id,
        timestamp: { $gte: startDate }
      }),

      // Action statistics
      ActivityLog.aggregate([
        {
          $match: {
            userId: req.user._id,
            timestamp: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: '$action',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ]),

      // Entity statistics
      ActivityLog.aggregate([
        {
          $match: {
            userId: req.user._id,
            timestamp: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: '$entity',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ]),

      // Severity statistics
      ActivityLog.aggregate([
        {
          $match: {
            userId: req.user._id,
            timestamp: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: '$severity',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ]),

      // Daily statistics
      ActivityLog.aggregate([
        {
          $match: {
            userId: req.user._id,
            timestamp: { $gte: startDate }
          }
        },
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
        { $sort: { '_id.year': -1, '_id.month': -1, '_id.day': -1 } }
      ]),

      // Last login
      ActivityLog.findOne({
        userId: req.user._id,
        action: 'user.login'
      }).sort({ timestamp: -1 }),

      // Most active day
      ActivityLog.aggregate([
        {
          $match: {
            userId: req.user._id,
            timestamp: { $gte: startDate }
          }
        },
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
        { $sort: { count: -1 } },
        { $limit: 1 }
      ])
    ]);

    res.json({
      success: true,
      stats: {
        totalActivities,
        actionStats,
        entityStats,
        severityStats,
        dailyStats,
        period: `${days} days`,
        lastLogin: lastLogin?.timestamp,
        mostActiveDay: mostActiveDay[0]?._id ? 
          new Date(mostActiveDay[0]._id.year, mostActiveDay[0]._id.month - 1, mostActiveDay[0]._id.day) : null
      }
    });
  } catch (error) {
    console.error('Error fetching user activity stats:', error);
    res.status(500);
    throw new Error('Failed to fetch activity statistics');
  }
});

// @desc    Export user's activity logs as CSV
// @route   GET /api/user/activity/export
// @access  Private
export const exportUserActivityLogs = asyncHandler(async (req, res) => {
  // Build filter object - only show current user's activities
  const filter = { userId: req.user._id };

  // Add optional filters
  if (req.query.action && req.query.action !== 'all') {
    filter.action = req.query.action;
  }
  if (req.query.entity && req.query.entity !== 'all') {
    filter.entity = req.query.entity;
  }
  if (req.query.severity && req.query.severity !== 'all') {
    filter.severity = req.query.severity;
  }
  if (req.query.search) {
    filter.description = { $regex: req.query.search, $options: 'i' };
  }
  if (req.query.startDate) {
    filter.timestamp = { $gte: new Date(req.query.startDate) };
  }
  if (req.query.endDate) {
    if (filter.timestamp) {
      filter.timestamp.$lte = new Date(req.query.endDate);
    } else {
      filter.timestamp = { $lte: new Date(req.query.endDate) };
    }
  }

  try {
    const logs = await ActivityLog.find(filter)
      .populate('userId', 'username email')
      .sort({ timestamp: -1 });

    // Convert to CSV format
    const csvHeaders = [
      'Timestamp',
      'Action',
      'Entity',
      'Description',
      'Severity',
      'IP Address',
      'User Agent'
    ];

    const csvRows = logs.map(log => [
      new Date(log.timestamp).toISOString(),
      log.action,
      log.entity,
      log.description,
      log.severity,
      log.ipAddress || '',
      log.userAgent || ''
    ]);

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.map(field => `"${field}"`).join(','))
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="my-activity-logs-${new Date().toISOString().split('T')[0]}.csv"`);
    res.send(csvContent);
  } catch (error) {
    console.error('Error exporting user activity logs:', error);
    res.status(500);
    throw new Error('Failed to export activity logs');
  }
}); 