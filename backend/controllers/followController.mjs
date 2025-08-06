import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import Follow from '../models/Follow.mjs';
import User from '../models/User.mjs';
import Notification from '../models/Notification.mjs';

// @desc    Follow a user
// @route   POST /api/follows/:userId
// @access  Private
const followUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const followerId = req.user._id;

  // Check if user exists
  const userToFollow = await User.findById(userId);
  if (!userToFollow) {
    res.status(404);
    throw new Error('User not found');
  }

  // Prevent self-following
  if (followerId.toString() === userId) {
    res.status(400);
    throw new Error('You cannot follow yourself');
  }

  // Check if already following
  const existingFollow = await Follow.findOne({ follower: followerId, following: userId });
  if (existingFollow) {
    res.status(400);
    throw new Error('You are already following this user');
  }

  // Create follow relationship
  const follow = await Follow.create({
    follower: followerId,
    following: userId
  });

  // Populate user details
  await follow.populate('follower', 'username profileImage');
  await follow.populate('following', 'username profileImage');

  // Create notification for the followed user
  try {
    await Notification.create({
      recipient: userId,
      sender: followerId,
      type: 'follow',
      title: 'New Follower',
      message: `${req.user.username} started following you`,
      data: {
        followerId: followerId,
        followerName: req.user.username
      }
    });
  } catch (error) {
    console.error('Error creating follow notification:', error);
  }

  res.status(201).json({
    success: true,
    data: follow,
    message: 'User followed successfully'
  });
});

// @desc    Unfollow a user
// @route   DELETE /api/follows/:userId
// @access  Private
const unfollowUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const followerId = req.user._id;

  // Check if follow relationship exists
  const follow = await Follow.findOne({ follower: followerId, following: userId });
  if (!follow) {
    res.status(404);
    throw new Error('Follow relationship not found');
  }

  // Remove the follow relationship
  await Follow.findByIdAndDelete(follow._id);

  res.json({
    success: true,
    message: 'User unfollowed successfully'
  });
});

// @desc    Toggle follow status (follow if not following, unfollow if following)
// @route   POST /api/follows/:userId/toggle
// @access  Private
const toggleFollow = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const followerId = req.user._id;

  // Check if user exists
  const userToFollow = await User.findById(userId);
  if (!userToFollow) {
    res.status(404);
    throw new Error('User not found');
  }

  // Prevent self-following
  if (followerId.toString() === userId) {
    res.status(400);
    throw new Error('You cannot follow yourself');
  }

  // Check if already following
  const existingFollow = await Follow.findOne({ follower: followerId, following: userId });
  
  if (existingFollow) {
    // Unfollow the user
    await Follow.findByIdAndDelete(existingFollow._id);
    
    res.json({
      success: true,
      following: false,
      message: 'User unfollowed successfully'
    });
  } else {
    // Follow the user
    const follow = await Follow.create({
      follower: followerId,
      following: userId
    });

    // Populate user details
    await follow.populate('follower', 'username profileImage');
    await follow.populate('following', 'username profileImage');

    // Create notification for the followed user
    try {
      await Notification.create({
        recipient: userId,
        sender: followerId,
        type: 'follow',
        title: 'New Follower',
        message: `${req.user.username} started following you`,
        data: {
          followerId: followerId,
          followerName: req.user.username
        }
      });
    } catch (error) {
      console.error('Error creating follow notification:', error);
    }

    res.status(201).json({
      success: true,
      following: true,
      data: follow,
      message: 'User followed successfully'
    });
  }
});

// @desc    Get followers count for a user
// @route   GET /api/follows/:userId/followers/count
// @access  Public
const getFollowersCount = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  // Check if user exists
  const user = await User.findById(userId);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const count = await Follow.countDocuments({ following: userId });

  res.json({
    success: true,
    count,
    userId
  });
});

// @desc    Get following count for a user
// @route   GET /api/follows/:userId/following/count
// @access  Public
const getFollowingCount = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  // Check if user exists
  const user = await User.findById(userId);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const count = await Follow.countDocuments({ follower: userId });

  res.json({
    success: true,
    count,
    userId
  });
});

// @desc    Check if current user is following another user
// @route   GET /api/follows/:userId/check
// @access  Private
const checkFollowStatus = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const followerId = req.user._id;

  // Check if user exists
  const user = await User.findById(userId);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const follow = await Follow.findOne({ follower: followerId, following: userId });
  const isFollowing = !!follow;

  res.json({
    success: true,
    isFollowing,
    userId
  });
});

// @desc    Get followers list for a user
// @route   GET /api/follows/:userId/followers
// @access  Public
const getFollowers = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;

  // Check if user exists
  const user = await User.findById(userId);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const skip = (page - 1) * limit;

  const followers = await Follow.find({ following: userId })
    .populate('follower', 'username profileImage')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Follow.countDocuments({ following: userId });

  res.json({
    success: true,
    data: followers,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

// @desc    Get following list for a user
// @route   GET /api/follows/:userId/following
// @access  Public
const getFollowing = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;

  // Check if user exists
  const user = await User.findById(userId);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const skip = (page - 1) * limit;

  const following = await Follow.find({ follower: userId })
    .populate('following', 'username profileImage')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Follow.countDocuments({ follower: userId });

  res.json({
    success: true,
    data: following,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

// @desc    Get all follow relationships (Admin only)
// @route   GET /api/admin/follows
// @access  Private/Admin
const getAllFollows = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;
  const skip = (page - 1) * limit;

  const follows = await Follow.find({})
    .populate('follower', 'username email role profileImage avatar')
    .populate('following', 'username email role profileImage avatar')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Follow.countDocuments({});

  res.json({
    success: true,
    data: follows,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

// @desc    Get follow relationship by ID (Admin only)
// @route   GET /api/admin/follows/:id
// @access  Private/Admin
const getFollowById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const follow = await Follow.findById(id)
    .populate('follower', 'username email role profileImage avatar')
    .populate('following', 'username email role profileImage avatar');

  if (!follow) {
    res.status(404);
    throw new Error('Follow relationship not found');
  }

  res.json({
    success: true,
    data: follow
  });
});

// @desc    Delete follow relationship (Admin only)
// @route   DELETE /api/admin/follows/:id
// @access  Private/Admin
const deleteFollow = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const follow = await Follow.findById(id);
  if (!follow) {
    res.status(404);
    throw new Error('Follow relationship not found');
  }

  await Follow.findByIdAndDelete(id);

  res.json({
    success: true,
    message: 'Follow relationship removed successfully'
  });
});

// @desc    Update follow relationship status (Admin only)
// @route   PATCH /api/admin/follows/:id
// @access  Private/Admin
const updateFollowStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['active', 'suspended'].includes(status)) {
    res.status(400);
    throw new Error('Invalid status. Must be "active" or "suspended"');
  }

  const follow = await Follow.findById(id);
  if (!follow) {
    res.status(404);
    throw new Error('Follow relationship not found');
  }

  follow.status = status;
  await follow.save();

  await follow.populate('follower', 'username email role profileImage avatar');
  await follow.populate('following', 'username email role profileImage avatar');

  res.json({
    success: true,
    data: follow,
    message: `Follow relationship ${status} successfully`
  });
});

// @desc    Get follow statistics (Admin only)
// @route   GET /api/admin/follows/stats/overview
// @access  Private/Admin
const getFollowStats = asyncHandler(async (req, res) => {
  const totalFollows = await Follow.countDocuments({});
  const activeFollows = await Follow.countDocuments({ status: { $ne: 'suspended' } });
  const suspendedFollows = await Follow.countDocuments({ status: 'suspended' });
  
  // Get recent follows (last 24 hours)
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const recentFollows = await Follow.countDocuments({ 
    createdAt: { $gte: oneDayAgo } 
  });

  // Get suspicious follows (user following admin)
  const suspiciousFollows = await Follow.aggregate([
    {
      $lookup: {
        from: 'users',
        localField: 'follower',
        foreignField: '_id',
        as: 'followerUser'
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'following',
        foreignField: '_id',
        as: 'followingUser'
      }
    },
    {
      $match: {
        'followerUser.role': 'user',
        'followingUser.role': 'admin'
      }
    },
    {
      $count: 'count'
    }
  ]);

  res.json({
    success: true,
    data: {
      totalFollows,
      activeFollows,
      suspendedFollows,
      recentFollows,
      suspiciousFollows: suspiciousFollows[0]?.count || 0
    }
  });
});

// @desc    Bulk delete follow relationships (Admin only)
// @route   DELETE /api/admin/follows/bulk
// @access  Private/Admin
const bulkDeleteFollows = asyncHandler(async (req, res) => {
  const { followIds } = req.body;

  if (!Array.isArray(followIds) || followIds.length === 0) {
    res.status(400);
    throw new Error('Follow IDs array is required');
  }

  const result = await Follow.deleteMany({ _id: { $in: followIds } });

  res.json({
    success: true,
    message: `${result.deletedCount} follow relationships deleted successfully`
  });
});

// @desc    Bulk update follow status (Admin only)
// @route   PATCH /api/admin/follows/bulk
// @access  Private/Admin
const bulkUpdateFollowStatus = asyncHandler(async (req, res) => {
  const { followIds, status } = req.body;

  if (!Array.isArray(followIds) || followIds.length === 0) {
    res.status(400);
    throw new Error('Follow IDs array is required');
  }

  if (!['active', 'suspended'].includes(status)) {
    res.status(400);
    throw new Error('Invalid status. Must be "active" or "suspended"');
  }

  const result = await Follow.updateMany(
    { _id: { $in: followIds } },
    { status }
  );

  res.json({
    success: true,
    message: `${result.modifiedCount} follow relationships ${status} successfully`
  });
});

export {
  followUser,
  unfollowUser,
  toggleFollow,
  checkFollowStatus,
  getFollowersCount,
  getFollowingCount,
  getFollowers,
  getFollowing,
  getAllFollows,
  getFollowById,
  deleteFollow,
  updateFollowStatus,
  getFollowStats,
  bulkDeleteFollows,
  bulkUpdateFollowStatus
}; 