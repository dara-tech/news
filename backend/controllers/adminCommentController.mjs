import asyncHandler from "express-async-handler";
import Comment from '../models/Comment.mjs';
import News from '../models/News.mjs';
import User from '../models/User.mjs';

// WebSocket instance will be injected
let commentWebSocket = null;

export const setCommentWebSocket = (ws) => {
  commentWebSocket = ws;
};

// @desc    Get all comments for admin management
// @route   GET /api/admin/comments
// @access  Private/Admin
const getAllComments = asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 20, 
    status, 
    search, 
    sort = 'newest',
    newsId 
  } = req.query;

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  // Build filter
  const filter = {};
  if (status) filter.status = status;
  if (newsId) filter.news = newsId;

  // Build search filter
  if (search) {
    filter.$or = [
      { content: { $regex: search, $options: 'i' } },
      { 'user.username': { $regex: search, $options: 'i' } }
    ];
  }

  // Build sort object
  let sortObj = {};
  switch (sort) {
    case 'oldest':
      sortObj = { createdAt: 1 };
      break;
    case 'mostLiked':
      sortObj = { 'likes.length': -1, createdAt: -1 };
      break;
    case 'pending':
      sortObj = { status: 1, createdAt: -1 };
      break;
    default:
      sortObj = { createdAt: -1 };
  }

  // Get comments with populated data
  const comments = await Comment.find(filter)
    .populate('user', 'username email profileImage role')
    .populate('news', 'title slug')
    .populate('parentComment', 'content')
    .populate('likes', 'username')
    .sort(sortObj)
    .skip(skip)
    .limit(limitNum);

  // Get total count for pagination
  const total = await Comment.countDocuments(filter);

  // Get statistics
  const stats = await Comment.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  const statusStats = {
    total: total,
    approved: 0,
    pending: 0,
    rejected: 0
  };

  stats.forEach(stat => {
    statusStats[stat._id] = stat.count;
  });

  res.json({
    success: true,
    data: comments,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum)
    },
    stats: statusStats
  });
});

// @desc    Approve a comment
// @route   PUT /api/admin/comments/:commentId/approve
// @access  Private/Admin
const approveComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  const comment = await Comment.findById(commentId);
  if (!comment) {
    res.status(404);
    throw new Error('Comment not found');
  }

  comment.status = 'approved';
  comment.moderatedBy = req.user._id;
  comment.moderatedAt = new Date();
  await comment.save();

  await comment.populate('user', 'username email profileImage');
  await comment.populate('news', 'title slug');

  res.json({
    success: true,
    data: comment,
    message: 'Comment approved successfully'
  });
});

// @desc    Reject a comment
// @route   PUT /api/admin/comments/:commentId/reject
// @access  Private/Admin
const rejectComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { reason } = req.body;

  const comment = await Comment.findById(commentId);
  if (!comment) {
    res.status(404);
    throw new Error('Comment not found');
  }

  comment.status = 'rejected';
  comment.moderatedBy = req.user._id;
  comment.moderatedAt = new Date();
  comment.rejectionReason = reason || 'Comment rejected by moderator';
  await comment.save();

  await comment.populate('user', 'username email profileImage');
  await comment.populate('news', 'title slug');

  res.json({
    success: true,
    data: comment,
    message: 'Comment rejected successfully'
  });
});

// @desc    Delete a comment (admin)
// @route   DELETE /api/admin/comments/:commentId
// @access  Private/Admin
const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  const comment = await Comment.findById(commentId);
  if (!comment) {
    res.status(404);
    throw new Error('Comment not found');
  }

  // Delete comment and all its replies
  await Comment.deleteMany({
    $or: [
      { _id: commentId },
      { parentComment: commentId }
    ]
  });

  res.json({
    success: true,
    message: 'Comment deleted successfully'
  });
});

// @desc    Bulk approve comments
// @route   PUT /api/admin/comments/bulk-approve
// @access  Private/Admin
const bulkApproveComments = asyncHandler(async (req, res) => {
  const { commentIds } = req.body;

  if (!commentIds || !Array.isArray(commentIds) || commentIds.length === 0) {
    res.status(400);
    throw new Error('Comment IDs array is required');
  }

  const result = await Comment.updateMany(
    { _id: { $in: commentIds } },
    { 
      status: 'approved',
      moderatedBy: req.user._id,
      moderatedAt: new Date()
    }
  );

  res.json({
    success: true,
    message: `${result.modifiedCount} comments approved successfully`
  });
});

// @desc    Bulk reject comments
// @route   PUT /api/admin/comments/bulk-reject
// @access  Private/Admin
const bulkRejectComments = asyncHandler(async (req, res) => {
  const { commentIds, reason } = req.body;

  if (!commentIds || !Array.isArray(commentIds) || commentIds.length === 0) {
    res.status(400);
    throw new Error('Comment IDs array is required');
  }

  const result = await Comment.updateMany(
    { _id: { $in: commentIds } },
    { 
      status: 'rejected',
      moderatedBy: req.user._id,
      moderatedAt: new Date(),
      rejectionReason: reason || 'Comment rejected by moderator'
    }
  );

  res.json({
    success: true,
    message: `${result.modifiedCount} comments rejected successfully`
  });
});

// @desc    Bulk delete comments
// @route   DELETE /api/admin/comments/bulk-delete
// @access  Private/Admin
const bulkDeleteComments = asyncHandler(async (req, res) => {
  const { commentIds } = req.body;

  if (!commentIds || !Array.isArray(commentIds) || commentIds.length === 0) {
    res.status(400);
    throw new Error('Comment IDs array is required');
  }

  // Delete comments and all their replies
  const result = await Comment.deleteMany({
    $or: [
      { _id: { $in: commentIds } },
      { parentComment: { $in: commentIds } }
    ]
  });

  res.json({
    success: true,
    message: `${result.deletedCount} comments deleted successfully`
  });
});

// @desc    Get comment statistics for admin
// @route   GET /api/admin/comments/stats
// @access  Private/Admin
const getCommentStats = asyncHandler(async (req, res) => {
  const { period = '30' } = req.query; // days
  const daysAgo = new Date();
  daysAgo.setDate(daysAgo.getDate() - parseInt(period));

  const [
    totalComments,
    approvedComments,
    pendingComments,
    rejectedComments,
    recentComments,
    topCommenters,
    commentsByDay
  ] = await Promise.all([
    Comment.countDocuments(),
    Comment.countDocuments({ status: 'approved' }),
    Comment.countDocuments({ status: 'pending' }),
    Comment.countDocuments({ status: 'rejected' }),
    Comment.countDocuments({ createdAt: { $gte: daysAgo } }),
    Comment.aggregate([
      {
        $group: {
          _id: '$user',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 10
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userData'
        }
      },
      {
        $unwind: '$userData'
      },
      {
        $project: {
          username: '$userData.username',
          email: '$userData.email',
          count: 1
        }
      }
    ]),
    Comment.aggregate([
      {
        $match: {
          createdAt: { $gte: daysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$createdAt'
            }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ])
  ]);

  res.json({
    success: true,
    data: {
      total: totalComments,
      approved: approvedComments,
      pending: pendingComments,
      rejected: rejectedComments,
      recent: recentComments,
      topCommenters,
      commentsByDay
    }
  });
});

export {
  getAllComments,
  approveComment,
  rejectComment,
  deleteComment,
  bulkApproveComments,
  bulkRejectComments,
  bulkDeleteComments,
  getCommentStats
}; 