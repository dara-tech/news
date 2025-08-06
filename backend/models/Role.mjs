import mongoose from "mongoose";

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Role name is required'],
      unique: true,
      trim: true,
      maxlength: [50, 'Role name cannot be more than 50 characters'],
    },
    displayName: {
      type: String,
      required: [true, 'Display name is required'],
      trim: true,
      maxlength: [100, 'Display name cannot be more than 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot be more than 500 characters'],
    },
    permissions: [{
      type: String,
      required: true,
      trim: true
    }],
    level: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 10
    },
    isSystemRole: {
      type: Boolean,
      default: false
    },
    isActive: {
      type: Boolean,
      default: true
    },
    color: {
      type: String,
      default: '#6b7280', // Default gray color
      match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Please enter a valid hex color']
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true,
  }
);

// Indexes for better performance
roleSchema.index({ level: 1 });
roleSchema.index({ isActive: 1 });

// Virtual for user count
roleSchema.virtual('userCount', {
  ref: 'User',
  localField: 'name',
  foreignField: 'role',
  count: true
});

// Ensure virtual fields are serialized
roleSchema.set('toJSON', { virtuals: true });
roleSchema.set('toObject', { virtuals: true });

// Pre-save middleware to ensure system roles can't be modified inappropriately
roleSchema.pre('save', function(next) {
  if (this.isSystemRole && this.isModified('name')) {
    const error = new Error('System role names cannot be modified');
    return next(error);
  }
  next();
});

// Pre-remove middleware to prevent deletion of system roles
roleSchema.pre('deleteOne', { document: true, query: false }, function(next) {
  if (this.isSystemRole) {
    const error = new Error('System roles cannot be deleted');
    return next(error);
  }
  next();
});

// Static method to get available permissions
roleSchema.statics.getAvailablePermissions = function() {
  return [
    // News permissions
    'news.create',
    'news.read',
    'news.update',
    'news.delete',
    'news.publish',
    'news.moderate',
    
    // User permissions
    'users.create',
    'users.read',
    'users.update',
    'users.delete',
    'users.roles',
    'users.moderate',
    
    // Category permissions
    'categories.create',
    'categories.read',
    'categories.update',
    'categories.delete',
    
    // Comment permissions
    'comments.create',
    'comments.read',
    'comments.update',
    'comments.delete',
    'comments.moderate',
    
    // Like permissions
    'likes.create',
    'likes.read',
    'likes.delete',
    
    // Analytics permissions
    'analytics.view',
    'analytics.export',
    
    // Admin permissions
    'admin.dashboard',
    'admin.settings',
    'admin.logs',
    'admin.security',
    'admin.roles',
    'admin.system',
    
    // Report permissions
    'reports.view',
    'reports.export',
    'reports.create',
    
    // Notification permissions
    'notifications.create',
    'notifications.read',
    'notifications.update',
    'notifications.delete',
    'notifications.broadcast'
  ];
};

// Instance method to check if role has permission
roleSchema.methods.hasPermission = function(permission) {
  return this.permissions.includes(permission);
};

// Instance method to add permission
roleSchema.methods.addPermission = function(permission) {
  if (!this.permissions.includes(permission)) {
    this.permissions.push(permission);
  }
  return this;
};

// Instance method to remove permission
roleSchema.methods.removePermission = function(permission) {
  this.permissions = this.permissions.filter(p => p !== permission);
  return this;
};

export default mongoose.model('Role', roleSchema);