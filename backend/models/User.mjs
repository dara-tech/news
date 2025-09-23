import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Please add a username'],
      unique: true,
      trim: true,
      maxlength: [50, 'Username cannot be more than 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        'Please add a valid email',
      ],
    },
    password: {
      type: String,
      required: function() {
        return !this.googleId; // Password is required only if not using Google OAuth
      },
      minlength: 6,
      select: false,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true, // Allows multiple null values
    },
    facebookId: {
      type: String,
      unique: true,
      sparse: true, // Allows multiple null values
    },
    profileImage: {
      type: String,
      default: null,
    },
    role: {
      type: String,
      enum: ['user', 'editor', 'admin'],
      default: 'user',
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    lastLogout: {
      type: Date,
      default: null,
    },
    sessions: {
      invalidated: {
        type: Boolean,
        default: false,
      },
      lastInvalidation: {
        type: Date,
        default: null,
      },
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpire: {
      type: Date,
    },
    resetPin: {
      type: String,
    },
    resetPinExpire: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Encrypt password using bcrypt
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Sign JWT and return
userSchema.methods.getSignedJwtToken = function () {
  return jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE,
    }
  );
};

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash password reset token
userSchema.methods.getResetPasswordToken = function () {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set expire
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

  return resetToken;
};

// Generate and hash password reset PIN
userSchema.methods.getResetPasswordPin = function () {
  // Generate 6-digit PIN
  const pin = Math.floor(100000 + Math.random() * 900000).toString();

  // Hash PIN and set to resetPin field
  this.resetPin = crypto
    .createHash('sha256')
    .update(pin)
    .digest('hex');

  // Set expire (5 minutes for PIN)
  this.resetPinExpire = Date.now() + 5 * 60 * 1000; // 5 minutes

  return pin;
};

// Verify reset PIN
userSchema.methods.verifyResetPin = function (pin) {
  const hashedPin = crypto
    .createHash('sha256')
    .update(pin)
    .digest('hex');

  return this.resetPin === hashedPin && this.resetPinExpire > Date.now();
};

// Virtual for followers count
userSchema.virtual('followersCount', {
  ref: 'Follow',
  localField: '_id',
  foreignField: 'following',
  count: true
});

// Virtual for following count
userSchema.virtual('followingCount', {
  ref: 'Follow',
  localField: '_id',
  foreignField: 'follower',
  count: true
});

// Virtual for followers
userSchema.virtual('followers', {
  ref: 'Follow',
  localField: '_id',
  foreignField: 'following',
  populate: {
    path: 'follower',
    select: 'username profileImage'
  }
});

// Virtual for following
userSchema.virtual('following', {
  ref: 'Follow',
  localField: '_id',
  foreignField: 'follower',
  populate: {
    path: 'following',
    select: 'username profileImage'
  }
});

const User = mongoose.model('User', userSchema);

export default User;
