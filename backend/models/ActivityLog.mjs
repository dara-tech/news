import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      'user.login', 'user.login_failed', 'user.logout', 'user.register',
      'user.create', 'user.update', 'user.delete',
      'news.create', 'news.update', 'news.delete', 'news.publish', 'news.unpublish',
      'category.create', 'category.update', 'category.delete',
      'comment.create', 'comment.update', 'comment.delete', 'comment.moderate',
      'role.create', 'role.update', 'role.delete', 'role.assign', 'role.bulk_assign',
      'settings.update', 'security.update', 'integration.update',
      'admin.force_logout', 'admin.backup_create', 'admin.system_restart'
    ]
  },
  entity: {
    type: String,
    required: true, // user, news, category, comment, role, settings, etc.
  },
  entityId: {
    type: String, // ID of the affected entity
  },
  description: {
    type: String,
    required: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed, // Additional data about the action
    default: {}
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'low'
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better query performance
activityLogSchema.index({ userId: 1, timestamp: -1 });
activityLogSchema.index({ action: 1, timestamp: -1 });
activityLogSchema.index({ entity: 1, timestamp: -1 });
activityLogSchema.index({ severity: 1, timestamp: -1 });

// Auto-delete old logs (keep only last 90 days)
activityLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);

export default ActivityLog;