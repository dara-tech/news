import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import Comment from '../models/Comment.mjs';
import News from '../models/News.mjs';
import { checkModerationRequired } from '../middleware/settings.mjs';
import logger from '../utils/logger.mjs';

// WebSocket instance will be injected
let commentWebSocket = null;

export const setCommentWebSocket = (ws) => {
  commentWebSocket = ws;
};

// @desc    Get comments for a news article
// @route   GET /api/comments/:newsId
// @access  Public
const getComments = asyncHandler(async (req, res) => {
  const { newsId } = req.params;
  const { page = 1, limit = 10, sort = 'newest' } = req.query;

  // Check if news article exists
  const news = await News.findById(newsId);
  if (!news) {
    res.status(404);
    throw new Error('News article not found');
  }

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  // Build sort object
  let sortObj = {};
  switch (sort) {
    case 'oldest':
      sortObj = { createdAt: 1 };
      break;
    case 'mostLiked':
      sortObj = { 'likes.length': -1, createdAt: -1 };
      break;
    default:
      sortObj = { createdAt: -1 };
  }

  // Get top-level comments (no parent) - only approved for public
  const comments = await Comment.find({
    news: newsId,
    parentComment: null,
    status: 'approved'
  })
  .populate('user', 'username profileImage avatar')
  .populate({
    path: 'replies',
    match: { status: 'approved' },
    populate: {
      path: 'user',
      select: 'username profileImage avatar'
    },
    options: { sort: { createdAt: 1 } }
  })
  .populate('likes', 'username')
  .sort(sortObj)
  .skip(skip)
  .limit(limitNum);

  // Get total count for pagination
  const total = await Comment.countDocuments({
    news: newsId,
    parentComment: null,
    status: 'approved'
  });

  res.json({
    success: true,
    data: comments,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum)
    }
  });
});

// @desc    Create a new comment
// @route   POST /api/comments/:newsId
// @access  Private
const createComment = asyncHandler(async (req, res) => {
  const { newsId } = req.params;
  const { content, parentCommentId } = req.body;
  const userId = req.user._id;

  // Check if news article exists
  const news = await News.findById(newsId);
  if (!news) {
    res.status(404);
    throw new Error('News article not found');
  }

  // Validate content
  if (!content || content.trim().length === 0) {
    res.status(400);
    throw new Error('Comment content is required');
  }

  if (content.length > 1000) {
    res.status(400);
    throw new Error('Comment is too long (max 1000 characters)');
  }

  // If this is a reply, check if parent comment exists
  if (parentCommentId) {
    const parentComment = await Comment.findById(parentCommentId);
    if (!parentComment) {
      res.status(404);
      throw new Error('Parent comment not found');
    }
  }

  // Check if moderation is required
  const moderationRequired = await checkModerationRequired();
  
  // Create comment with appropriate status
  const comment = await Comment.create({
    user: userId,
    news: newsId,
    content: content.trim(),
    parentComment: parentCommentId || null,
    status: moderationRequired ? 'pending' : 'approved'
  });

  // Populate user details
  await comment.populate('user', 'username profileImage avatar');

  // Broadcast real-time update only if approved
  if (comment.status === 'approved' && commentWebSocket) {
    try {
      commentWebSocket.broadcastCommentCreated(newsId, comment);
    } catch (error) {
      logger.error('Error broadcasting comment creation:', error);
      // Don't fail the request if WebSocket broadcast fails
    }
  }

  res.status(201).json({
    success: true,
    data: comment,
    message: moderationRequired 
      ? 'Comment submitted for approval' 
      : 'Comment created successfully'
  });
});

// @desc    Update a comment
// @route   PUT /api/comments/:commentId
// @access  Private
const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;
  const userId = req.user._id;

  // Find comment
  const comment = await Comment.findById(commentId);
  if (!comment) {
    res.status(404);
    throw new Error('Comment not found');
  }

  // Check if user owns the comment or is admin
  if (comment.user.toString() !== userId.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to edit this comment');
  }

  // Validate content
  if (!content || content.trim().length === 0) {
    res.status(400);
    throw new Error('Comment content is required');
  }

  if (content.length > 1000) {
    res.status(400);
    throw new Error('Comment is too long (max 1000 characters)');
  }

  // Update comment
  comment.content = content.trim();
  comment.isEdited = true;
  comment.editedAt = new Date();
  await comment.save();

  // Populate user details
  await comment.populate('user', 'username profileImage avatar');

  // Broadcast real-time update
  if (commentWebSocket) {
    try {
      commentWebSocket.broadcastCommentUpdated(comment.news.toString(), comment);
    } catch (error) {
      logger.error('Error broadcasting comment update:', error);
      // Don't fail the request if WebSocket broadcast fails
    }
  }

  res.json({
    success: true,
    data: comment,
    message: 'Comment updated successfully'
  });
});

// @desc    Delete a comment
// @route   DELETE /api/comments/:commentId
// @access  Private
const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user._id;

  // Find comment
  const comment = await Comment.findById(commentId);
  if (!comment) {
    res.status(404);
    throw new Error('Comment not found');
  }

  // Check if user owns the comment or is admin
  if (comment.user.toString() !== userId.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to delete this comment');
  }

  // Delete comment and all its replies
  await Comment.deleteMany({
    $or: [
      { _id: commentId },
      { parentComment: commentId }
    ]
  });

  // Broadcast real-time update
  if (commentWebSocket) {
    try {
      commentWebSocket.broadcastCommentDeleted(comment.news.toString(), commentId);
    } catch (error) {
      logger.error('Error broadcasting comment deletion:', error);
      // Don't fail the request if WebSocket broadcast fails
    }
  }

  res.json({
    success: true,
    message: 'Comment deleted successfully'
  });
});

// @desc    Like/unlike a comment
// @route   POST /api/comments/:commentId/like
// @access  Private
const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user._id;

  // Find comment
  const comment = await Comment.findById(commentId);
  if (!comment) {
    res.status(404);
    throw new Error('Comment not found');
  }

  // Check if user already liked the comment
  const hasLiked = comment.likes.includes(userId);

  if (hasLiked) {
    // Unlike
    comment.likes = comment.likes.filter(id => id.toString() !== userId.toString());
  } else {
    // Like
    comment.likes.push(userId);
  }

  await comment.save();
  await comment.populate('user', 'username profileImage avatar');

  // Broadcast real-time update
  if (commentWebSocket) {
    try {
      commentWebSocket.broadcastCommentLiked(comment.news.toString(), comment);
    } catch (error) {
      logger.error('Error broadcasting comment like:', error);
      // Don't fail the request if WebSocket broadcast fails
    }
  }

  res.json({
    success: true,
    data: comment,
    message: hasLiked ? 'Comment unliked' : 'Comment liked'
  });
});

// @desc    Get comment statistics
// @route   GET /api/comments/:newsId/stats
// @access  Public
const getCommentStats = asyncHandler(async (req, res) => {
  const { newsId } = req.params;

  try {
    const [totalComments, totalReplies, commentsWithLikes] = await Promise.all([
      Comment.countDocuments({ news: newsId, parentComment: null, status: 'approved' }),
      Comment.countDocuments({ news: newsId, parentComment: { $ne: null }, status: 'approved' }),
      Comment.find({ news: newsId, status: 'approved' }).select('likes')
    ]);

    // Calculate total likes manually
    const totalLikes = commentsWithLikes.reduce((sum, comment) => sum + (comment.likes?.length || 0), 0);

    res.json({
      success: true,
      data: {
        totalComments,
        totalReplies,
        totalLikes
      }
    });
  } catch (error) {
    logger.error('Error getting comment stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get comment statistics'
    });
  }
});

export {
  getComments,
  createComment,
  updateComment,
  deleteComment,
  toggleCommentLike,
  getCommentStats
}; 