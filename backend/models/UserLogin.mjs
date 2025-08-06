import mongoose from "mongoose";

const userLoginSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  username: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  loginTime: {
    type: Date,
    default: Date.now
  },
  logoutTime: {
    type: Date,
    default: null
  },
  sessionDuration: {
    type: Number, // in minutes
    default: 0
  },
  ipAddress: {
    type: String,
    required: true
  },
  location: {
    country: String,
    region: String,
    city: String,
    timezone: String,
    coordinates: {
      type: [Number], // [longitude, latitude] for MongoDB geospatial queries
      index: '2dsphere'
    }
  },
  device: {
    type: String, // desktop, mobile, tablet
    required: true
  },
  browser: {
    name: String,
    version: String,
    userAgent: String
  },
  os: {
    name: String,
    version: String,
    platform: String
  },
  screenResolution: {
    width: Number,
    height: Number
  },
  loginMethod: {
    type: String,
    enum: ['email', 'google', 'facebook', 'twitter'],
    default: 'email'
  },
  success: {
    type: Boolean,
    default: true
  },
  failureReason: String,
  securityFlags: [{
    type: String,
    enum: ['suspicious_ip', 'multiple_failed_attempts', 'unusual_location', 'new_device', 'vpn_detected']
  }],
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Indexes for better query performance
userLoginSchema.index({ userId: 1, loginTime: -1 });
userLoginSchema.index({ loginTime: -1 });
userLoginSchema.index({ 'location.country': 1 });
userLoginSchema.index({ 'location.city': 1 });
userLoginSchema.index({ device: 1 });
userLoginSchema.index({ success: 1 });

// Auto-delete old logs (keep only last 90 days)
userLoginSchema.index({ loginTime: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

const UserLogin = mongoose.model('UserLogin', userLoginSchema);

export default UserLogin; 