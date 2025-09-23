import asyncHandler from "express-async-handler";
import User from "../models/User.mjs";
import generateToken from "../utils/generateToken.mjs";
import passport from "passport";
import Comment from "../models/Comment.mjs";
import Like from "../models/Like.mjs";
import Follow from "../models/Follow.mjs";
import ActivityLog from "../models/ActivityLog.mjs";
import UserLogin from "../models/UserLogin.mjs";
import logger from '../utils/logger.mjs';
import crypto from "crypto";
import { sendPasswordResetEmail } from '../utils/emailService.mjs';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  // Check if user exists
  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  // Create user
  const user = await User.create({
    username,
    email,
    password,
    role: req.body.role || 'user'
  });

  if (user) {
    generateToken(res, user);
    
    // Log user registration activity
    try {
      const { logActivity } = await import('./activityController.mjs');
      await logActivity({
        userId: user._id,
        action: 'user.register',
        entity: 'user',
        entityId: user._id.toString(),
        description: `New user registered: ${user.username}`,
        metadata: {
          email: user.email,
          username: user.username,
          role: user.role,
          registrationMethod: 'email'
        },
        severity: 'low',
        req
      });
    } catch (error) {
      logger.error('Failed to log registration activity:', error);
    }
    
    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      profileImage: user.profileImage,
      role: user.role,
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Check for user email
  const user = await User.findOne({ email }).select('+password');

  if (user && (await user.matchPassword(password))) {
    const token = generateToken(res, user);

    // Log successful login activity
    try {
      const { logActivity } = await import('./activityController.mjs');
      await logActivity({
        userId: user._id,
        action: 'user.login',
        entity: 'user',
        entityId: user._id.toString(),
        description: `User ${user.username} logged in successfully`,
        metadata: {
          email: user.email,
          role: user.role,
          loginMethod: 'password'
        },
        severity: 'low',
        req
      });
    } catch (error) {
      logger.error('Failed to log login activity:', error);
    }

    res.status(200).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      profileImage: user.profileImage,
      role: user.role,
      token: token // Include token in response for debugging
    });
  } else {
    // Log failed login attempt
    try {
      const { logActivity } = await import('./activityController.mjs');
      await logActivity({
        userId: null, // No user ID for failed login
        action: 'user.login_failed',
        entity: 'user',
        description: `Failed login attempt for email: ${email}`,
        metadata: {
          email,
          reason: 'invalid_credentials'
        },
        severity: 'medium',
        req
      });
    } catch (error) {
      logger.error('Failed to log failed login activity:', error);
    }

    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// @desc    Google OAuth login/register
// @route   GET /api/auth/google
// @access  Public
const googleAuth = (req, res, next) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    return res.redirect(`${frontendUrl}/en/login?error=google_oauth_not_configured`);
  }
  
  // Check if Google strategy is available
  const googleStrategy = passport._strategies.google;
  if (!googleStrategy) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    return res.redirect(`${frontendUrl}/en/login?error=google_oauth_strategy_unavailable`);
  }
  
  return passport.authenticate('google', {
    scope: ['profile', 'email', 'https://www.googleapis.com/auth/userinfo.profile']
  })(req, res, next);
};

// @desc    Google OAuth callback
// @route   GET /api/auth/google/callback
// @access  Public
const googleAuthCallback = asyncHandler(async (req, res) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    return res.redirect(`${frontendUrl}/en/login?error=oauth_not_configured`);
  }

  // Check if Google strategy is available
  const googleStrategy = passport._strategies.google;
  if (!googleStrategy) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    return res.redirect(`${frontendUrl}/en/login?error=oauth_strategy_unavailable`);
  }

  passport.authenticate('google', { session: false }, async (err, user) => {
    if (err) {
      logger.error('Google OAuth error:', err);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      return res.redirect(`${frontendUrl}/en/login?error=google_auth_failed`);
    }

    try {
      if (!user) {
        logger.error('No user received from Google OAuth');
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        return res.redirect(`${frontendUrl}/en/login?error=no_user`);
      }

      // Generate token
      const token = generateToken(res, user);
      logger.info('✅ Google OAuth successful - Token generated for user:', user.email);
      logger.info('🔗 Redirecting to:', process.env.FRONTEND_URL || 'http://localhost:3000');

      // Create user data to pass to frontend (including token)
      const userData = {
        _id: user._id,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage,
        role: user.role,
        token: token // Include the JWT token for frontend API calls
      };

      // Redirect to frontend with success parameter and user data
      const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const userDataEncoded = encodeURIComponent(JSON.stringify(userData));
      const redirectUrl = user.role === 'admin' 
        ? `${baseUrl}/admin/dashboard?auth=success&user=${userDataEncoded}`
        : `${baseUrl}?auth=success&user=${userDataEncoded}`;
      
      logger.info('🎯 Final redirect URL:', redirectUrl);
      res.redirect(redirectUrl);
    } catch (error) {
      logger.error('Google OAuth error:', error);
      logger.error('Error details:', {
        message: error.message,
        code: error.code,
        name: error.name
      });
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      res.redirect(`${frontendUrl}/en/login?error=registration_failed`);
    }
  })(req, res);
});

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  if (!req.user) {
    res.status(404);
    throw new Error('User not found');
  }

  res.json({
    _id: req.user._id,
    username: req.user.username,
    email: req.user.email,
    profileImage: req.user.profileImage,
    role: req.user.role,
  });
});

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Private
const logoutUser = asyncHandler(async (req, res) => {
  // Log logout activity
  if (req.user) {
    try {
      const { logActivity } = await import('./activityController.mjs');
      await logActivity({
        userId: req.user._id,
        action: 'user.logout',
        entity: 'user',
        entityId: req.user._id.toString(),
        description: `User ${req.user.username} logged out`,
        metadata: {
          email: req.user.email,
          role: req.user.role
        },
        severity: 'low',
        req
      });
    } catch (error) {
      logger.error('Failed to log logout activity:', error);
    }
  }

  res.clearCookie('jwt');
  res.json({ message: 'Logged out successfully' });
});

// @desc    Promote user to admin
// @route   PUT /api/auth/promote
// @access  Private
const promoteToAdmin = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  user.role = 'admin';
  await user.save();

  res.json({
    _id: user._id,
    username: user.username,
    email: user.email,
    role: user.role
  });
});

// @desc    Update user role
// @route   PATCH /api/auth/role
// @access  Private
const updateUserRole = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.role = req.body.role;
    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      role: updatedUser.role,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private

const updateUserProfile = asyncHandler(async (req, res) => {
  // The user object is attached to the request by the 'protect' middleware.
  // There is no need to fetch it again.
  const user = req.user;

  user.username = req.body.username || user.username;
  user.email = req.body.email || user.email;

  const updatedUser = await user.save();

  res.json({
    _id: updatedUser._id,
    username: updatedUser.username,
    email: updatedUser.email,
    profileImage: updatedUser.profileImage,
    role: updatedUser.role,
  });
});

// @desc    Update user password
// @route   PUT /api/auth/password
// @access  Private
const updateUserPassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('+password');

  if (user && (await user.matchPassword(req.body.currentPassword))) {
    user.password = req.body.newPassword;
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } else {
    res.status(401);
    throw new Error('Invalid current password');
  }
});

// @desc    Update user profile image
// @route   PUT /api/auth/profile/image
// @access  Private
const updateUserProfileImage = asyncHandler(async (req, res) => {
  const user = req.user;

  if (!req.file) {
    res.status(400);
    throw new Error('No image file provided');
  }

  try {
    // Upload to Cloudinary
    const { v2: cloudinary } = await import('cloudinary');
    
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'profile-images',
      public_id: `user-${user._id}-${Date.now()}`,
      transformation: [
        { width: 400, height: 400, crop: 'fill', gravity: 'face' },
        { quality: 'auto' }
      ]
    });

    // Update user profile image
    user.profileImage = result.secure_url;
    await user.save();

    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      profileImage: user.profileImage,
      role: user.role,
    });
  } catch (error) {
    res.status(500);
    throw new Error('Failed to upload image');
  }
});

// @desc    Data Deletion Callback URL for OAuth providers
// @route   POST /api/auth/data-deletion-callback
// @access  Public (called by OAuth providers)
const dataDeletionCallback = asyncHandler(async (req, res) => {
  try {
    const { 
      signed_request, 
      user_id, 
      confirmation_code,
      platform = 'unknown'
    } = req.body;

    logger.info('🗑️ Data Deletion Callback received:', {
      platform,
      userId: user_id,
      hasSignedRequest: !!signed_request,
      hasConfirmationCode: !!confirmation_code
    });

    // Validate the request
    if (!user_id) {
      logger.error('❌ Data deletion callback missing user_id');
      return res.status(400).json({
        url: `${process.env.FRONTEND_URL || 'https://news-eta-vert.vercel.app'}/data-deletion-status?status=error&message=missing_user_id`
      });
    }

    // Find user by OAuth ID
    let user = null;
    if (platform === 'google') {
      user = await User.findOne({ googleId: user_id });
    } else if (platform === 'facebook') {
      user = await User.findOne({ facebookId: user_id });
    } else {
      // Try to find by any OAuth ID
      user = await User.findOne({
        $or: [
          { googleId: user_id },
          { facebookId: user_id }
        ]
      });
    }

    if (!user) {
      logger.info('⚠️  User not found for deletion:', { user_id, platform });
      return res.status(200).json({
        url: `${process.env.FRONTEND_URL || 'https://news-eta-vert.vercel.app'}/data-deletion-status?status=success&message=user_not_found`
      });
    }

    logger.info('🗑️ Processing data deletion for user:', {
      userId: user._id,
      email: user.email,
      platform
    });

    // Delete all user data
    const deletionResults = await Promise.allSettled([
      // Delete user account
      User.findByIdAndDelete(user._id),
      // Delete user comments
      Comment.deleteMany({ userId: user._id }),
      // Delete user likes
      Like.deleteMany({ userId: user._id }),
      // Delete user follows
      Follow.deleteMany({ 
        $or: [
          { follower: user._id }, 
          { following: user._id }
        ] 
      }),
      // Delete user activity logs
      ActivityLog.deleteMany({ userId: user._id }),
      // Delete user login history
      UserLogin.deleteMany({ userId: user._id })
    ]);

    // Check deletion results
    const successfulDeletions = deletionResults.filter(result => result.status === 'fulfilled').length;
    const failedDeletions = deletionResults.filter(result => result.status === 'rejected').length;

    logger.info('📊 Data deletion results:', {
      successful: successfulDeletions,
      failed: failedDeletions,
      total: deletionResults.length
    });

    // Log the deletion activity
    try {
      const { logActivity } = await import('./activityController.mjs');
      await logActivity({
        userId: null, // User is deleted, so no userId
        action: 'user.data_deletion_callback',
        entity: 'user',
        entityId: user._id.toString(),
        description: `User data deleted via ${platform} callback`,
        metadata: {
          platform,
          oauthUserId: user_id,
          userEmail: user.email,
          successfulDeletions,
          failedDeletions,
          confirmationCode: confirmation_code
        },
        severity: 'high',
        req
      });
    } catch (error) {
      logger.error('Failed to log data deletion activity:', error);
    }

    // Return success URL
    const successUrl = `${process.env.FRONTEND_URL || 'https://news-eta-vert.vercel.app'}/data-deletion-status?status=success&deleted=true&platform=${platform}`;
    
    logger.info('✅ Data deletion completed successfully');
    logger.info('🔗 Redirecting to:', successUrl);

    res.status(200).json({
      url: successUrl
    });

  } catch (error) {
    logger.error('❌ Data deletion callback error:', error);
    
    const errorUrl = `${process.env.FRONTEND_URL || 'https://news-eta-vert.vercel.app'}/data-deletion-status?status=error&message=${encodeURIComponent(error.message)}`;
    
    res.status(500).json({
      url: errorUrl
    });
  }
});

// @desc    Data Deletion Status Check
// @route   GET /api/auth/data-deletion-status/:userId
// @access  Public
const checkDataDeletionStatus = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { platform } = req.query;

  try {
    let user = null;
    
    if (platform === 'google') {
      user = await User.findOne({ googleId: userId });
    } else if (platform === 'facebook') {
      user = await User.findOne({ facebookId: userId });
    } else {
      user = await User.findOne({
        $or: [
          { googleId: userId },
          { facebookId: userId }
        ]
      });
    }

    res.json({
      exists: !!user,
      deleted: !user,
      platform: platform || 'unknown'
    });

  } catch (error) {
    logger.error('Error checking deletion status:', error);
    res.status(500).json({
      error: 'Failed to check deletion status'
    });
  }
});

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found with this email'
      });
    }

  // Get reset PIN
  const resetPin = user.getResetPasswordPin();

  await user.save({ validateBeforeSave: false });

  // Create reset url - extract language from request body or default to 'en'
  const language = req.body.language || req.headers['accept-language']?.split(',')[0]?.split('-')[0] || 'en';
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/${language}/reset-password`;

  try {
    // Send password reset email with PIN
    const emailResult = await sendPasswordResetEmail(user.email, resetUrl, user.username, resetPin);
    
    // Log password reset request
    try {
      const { logActivity } = await import('./activityController.mjs');
      await logActivity({
        userId: user._id,
        action: 'user.forgot_password',
        entity: 'user',
        entityId: user._id.toString(),
        description: `Password reset requested for user: ${user.username}`,
        metadata: {
          email: user.email,
          resetPin: resetPin.substring(0, 2) + '****', // Only log partial PIN for security
          resetUrl: resetUrl,
          emailSent: emailResult.success,
          messageId: emailResult.messageId
        },
        severity: 'medium',
        req
      });
    } catch (error) {
      logger.error('Failed to log forgot password activity:', error);
    }

    res.status(200).json({
      success: true,
      message: 'Password reset PIN sent to your email',
      resetUrl: process.env.NODE_ENV !== 'production' ? resetUrl : undefined, // Only show in development
      previewUrl: emailResult.previewUrl // For development email preview
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    logger.error('Failed to send password reset email:', error);
    res.status(500);
    throw new Error('Email could not be sent');
  }
  } catch (error) {
    logger.error('Forgot password error:', error);
    logger.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
});

// @desc    Verify PIN and reset password
// @route   POST /api/auth/verify-pin-reset
// @access  Public
const verifyPinAndResetPassword = asyncHandler(async (req, res) => {
  try {
    const { email, pin, password } = req.body;

    if (!email || !pin || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email, PIN, and password are required'
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found with this email'
      });
    }

    // Verify PIN
    if (!user.verifyResetPin(pin)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired PIN'
      });
    }

    // Set new password
    user.password = password;
    user.resetPin = undefined;
    user.resetPinExpire = undefined;

    await user.save();

    // Log password reset completion
    try {
      const { logActivity } = await import('./activityController.mjs');
      await logActivity({
        userId: user._id,
        action: 'user.reset_password',
        entity: 'user',
        entityId: user._id.toString(),
        description: `Password reset completed for user: ${user.username}`,
        metadata: {
          email: user.email,
          resetMethod: 'PIN',
        },
        severity: 'medium',
        req
      });
    } catch (error) {
      logger.error('Failed to log password reset activity:', error);
    }

    res.status(200).json({
      success: true,
      message: 'Password reset successful'
    });
  } catch (error) {
    logger.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during password reset'
    });
  }
});

// @desc    Reset password (legacy token method)
// @route   PUT /api/auth/reset-password/:resettoken
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
  // Get hashed token
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resettoken)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400);
    throw new Error('Invalid or expired reset token');
  }

  // Set new password
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  // Log password reset completion
  try {
    const { logActivity } = await import('./activityController.mjs');
    await logActivity({
      userId: user._id,
      action: 'user.password_reset',
      entity: 'user',
      entityId: user._id.toString(),
      description: `Password reset completed for user: ${user.username}`,
      metadata: {
        email: user.email,
        resetToken: req.params.resettoken.substring(0, 10) + '...' // Only log partial token for security
      },
      severity: 'medium',
      req
    });
  } catch (error) {
    logger.error('Failed to log password reset activity:', error);
  }

  res.status(200).json({
    success: true,
    message: 'Password reset successful',
  });
});

export {
  registerUser,
  loginUser,
  googleAuth,
  googleAuthCallback,
  getUserProfile,
  logoutUser,
  promoteToAdmin,
  updateUserRole,
  updateUserProfile,
  updateUserPassword,
  updateUserProfileImage,
  dataDeletionCallback,
  checkDataDeletionStatus,
  forgotPassword,
  verifyPinAndResetPassword,
  resetPassword,
};
