import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import Like from '../models/Like.mjs';
import News from '../models/News.mjs';

// @desc    Like a news article
// @route   POST /api/likes/:newsId
// @access  Private
const likeNews = asyncHandler(async (req, res) => {
  const { newsId } = req.params;
  const userId = req.user._id;

  // Check if news article exists
  const news = await News.findById(newsId);
  if (!news) {
    res.status(404);
    throw new Error('News article not found');
  }

  // Check if user already liked this article
  const existingLike = await Like.findOne({ user: userId, news: newsId });
  if (existingLike) {
    res.status(400);
    throw new Error('You have already liked this article');
  }

  // Create new like
  const like = await Like.create({
    user: userId,
    news: newsId
  });

  // Populate user and news details
  await like.populate('user', 'username profileImage');
  await like.populate('news', 'title slug');

  res.status(201).json({
    success: true,
    data: like,
    message: 'Article liked successfully'
  });
});

// @desc    Unlike a news article
// @route   DELETE /api/likes/:newsId
// @access  Private
const unlikeNews = asyncHandler(async (req, res) => {
  const { newsId } = req.params;
  const userId = req.user._id;

  // Check if like exists
  const like = await Like.findOne({ user: userId, news: newsId });
  if (!like) {
    res.status(404);
    throw new Error('Like not found');
  }

  // Remove the like
  await Like.findByIdAndDelete(like._id);

  res.json({
    success: true,
    message: 'Article unliked successfully'
  });
});

// @desc    Toggle like status (like if not liked, unlike if liked)
// @route   POST /api/likes/:newsId/toggle
// @access  Private
const toggleLike = asyncHandler(async (req, res) => {
  const { newsId } = req.params;
  const userId = req.user._id;

  // Check if news article exists
  const news = await News.findById(newsId);
  if (!news) {
    res.status(404);
    throw new Error('News article not found');
  }

  // Check if user already liked this article
  const existingLike = await Like.findOne({ user: userId, news: newsId });
  
  if (existingLike) {
    // Unlike the article
    await Like.findByIdAndDelete(existingLike._id);
    
    res.json({
      success: true,
      liked: false,
      message: 'Article unliked successfully'
    });
  } else {
    // Like the article
    const like = await Like.create({
      user: userId,
      news: newsId
    });

    res.status(201).json({
      success: true,
      liked: true,
      data: like,
      message: 'Article liked successfully'
    });
  }
});

// @desc    Get like count for a news article
// @route   GET /api/likes/:newsId/count
// @access  Public
const getLikeCount = asyncHandler(async (req, res) => {
  const { newsId } = req.params;

  // Check if news article exists
  const news = await News.findById(newsId);
  if (!news) {
    res.status(404);
    throw new Error('News article not found');
  }

  const count = await Like.countDocuments({ news: newsId });

  res.json({
    success: true,
    count,
    newsId
  });
});

// @desc    Check if current user has liked a news article
// @route   GET /api/likes/:newsId/check
// @access  Private
const checkUserLike = asyncHandler(async (req, res) => {
  const { newsId } = req.params;
  const userId = req.user._id;

  // Check if news article exists
  const news = await News.findById(newsId);
  if (!news) {
    res.status(404);
    throw new Error('News article not found');
  }

  const like = await Like.findOne({ user: userId, news: newsId });
  const hasLiked = !!like;

  res.json({
    success: true,
    hasLiked,
    newsId
  });
});

// @desc    Get like status and count for a news article
// @route   GET /api/likes/:newsId/status
// @access  Private
const getLikeStatus = asyncHandler(async (req, res) => {
  const { newsId } = req.params;
  const userId = req.user._id;

  // Check if news article exists
  const news = await News.findById(newsId);
  if (!news) {
    res.status(404);
    throw new Error('News article not found');
  }

  // Validate ObjectIds
  if (!mongoose.Types.ObjectId.isValid(newsId)) {
    res.status(400);
    throw new Error('Invalid news ID format');
  }
  
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    res.status(400);
    throw new Error('Invalid user ID format');
  }

  // Get like count and user's like status
  const [count, userLike] = await Promise.all([
    Like.countDocuments({ news: newsId }),
    Like.findOne({ user: userId, news: newsId })
  ]);

  const hasLiked = !!userLike;

  res.json({
    success: true,
    count,
    hasLiked,
    newsId
  });
});

// @desc    Get like status and count for a news article (public)
// @route   GET /api/likes/:newsId/status/public
// @access  Public
const getLikeStatusPublic = asyncHandler(async (req, res) => {
  const { newsId } = req.params;

  // Check if news article exists
  const news = await News.findById(newsId);
  if (!news) {
    res.status(404);
    throw new Error('News article not found');
  }

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(newsId)) {
    res.status(400);
    throw new Error('Invalid news ID format');
  }

  // Get like count only (no user info since this is public)
  const count = await Like.countDocuments({ news: newsId });

  res.json({
    success: true,
    count,
    hasLiked: false, // Always false for public endpoint
    newsId
  });
});

// @desc    Get user's liked articles
// @route   GET /api/likes/user
// @access  Private
const getUserLikes = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const likes = await Like.find({ user: userId })
    .populate('news', 'title slug thumbnail createdAt')
    .populate('user', 'username profileImage')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Like.countDocuments({ user: userId });

  res.json({
    success: true,
    data: likes,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

// @desc    Get most liked articles
// @route   GET /api/likes/popular
// @access  Public
const getPopularArticles = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;

  // Aggregate to get articles with like counts
  const popularArticles = await Like.aggregate([
    {
      $group: {
        _id: '$news',
        likeCount: { $sum: 1 }
      }
    },
    {
      $sort: { likeCount: -1 }
    },
    {
      $limit: limit
    },
    {
      $lookup: {
        from: 'news',
        localField: '_id',
        foreignField: '_id',
        as: 'newsData'
      }
    },
    {
      $unwind: '$newsData'
    },
    {
      $project: {
        _id: '$newsData._id',
        title: '$newsData.title',
        slug: '$newsData.slug',
        thumbnail: '$newsData.thumbnail',
        likeCount: 1
      }
    }
  ]);

  res.json({
    success: true,
    data: popularArticles
  });
});

export {
  likeNews,
  unlikeNews,
  toggleLike,
  getLikeCount,
  checkUserLike,
  getLikeStatus,
  getLikeStatusPublic,
  getUserLikes,
  getPopularArticles
}; 