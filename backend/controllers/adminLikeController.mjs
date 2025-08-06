import asyncHandler from "express-async-handler";
import Like from '../models/Like.mjs';
import News from '../models/News.mjs';
import User from '../models/User.mjs';

// @desc    Get all likes for admin management
// @route   GET /api/admin/likes
// @access  Private/Admin
const getAllLikes = asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 20, 
    search, 
    sort = 'newest',
    newsId,
    userId 
  } = req.query;

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  // Build filter
  const filter = {};
  if (newsId) filter.news = newsId;
  if (userId) filter.user = userId;

  // Build search filter
  if (search) {
    filter.$or = [
      { 'user.username': { $regex: search, $options: 'i' } },
      { 'news.title.en': { $regex: search, $options: 'i' } },
      { 'news.title.kh': { $regex: search, $options: 'i' } }
    ];
  }

  // Build sort object
  let sortObj = {};
  switch (sort) {
    case 'oldest':
      sortObj = { createdAt: 1 };
      break;
    case 'user':
      sortObj = { 'user.username': 1 };
      break;
    case 'article':
      sortObj = { 'news.title.en': 1 };
      break;
    default:
      sortObj = { createdAt: -1 };
  }

  // Get likes with populated data
  const likes = await Like.find(filter)
    .populate('user', 'username email profileImage role')
    .populate('news', 'title slug thumbnail')
    .sort(sortObj)
    .skip(skip)
    .limit(limitNum);

  // Get total count for pagination
  const total = await Like.countDocuments(filter);

  // Get statistics
  const stats = await Like.aggregate([
    {
      $group: {
        _id: null,
        totalLikes: { $sum: 1 },
        uniqueUsers: { $addToSet: '$user' },
        uniqueArticles: { $addToSet: '$news' }
      }
    }
  ]);

  const likeStats = {
    total: total,
    uniqueUsers: stats.length > 0 ? stats[0].uniqueUsers.length : 0,
    uniqueArticles: stats.length > 0 ? stats[0].uniqueArticles.length : 0
  };

  res.json({
    success: true,
    data: likes,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum)
    },
    stats: likeStats
  });
});

// @desc    Delete a like (admin)
// @route   DELETE /api/admin/likes/:likeId
// @access  Private/Admin
const deleteLike = asyncHandler(async (req, res) => {
  const { likeId } = req.params;

  const like = await Like.findById(likeId);
  if (!like) {
    res.status(404);
    throw new Error('Like not found');
  }

  await Like.findByIdAndDelete(likeId);

  res.json({
    success: true,
    message: 'Like deleted successfully'
  });
});

// @desc    Bulk delete likes
// @route   DELETE /api/admin/likes/bulk-delete
// @access  Private/Admin
const bulkDeleteLikes = asyncHandler(async (req, res) => {
  const { likeIds } = req.body;

  if (!likeIds || !Array.isArray(likeIds) || likeIds.length === 0) {
    res.status(400);
    throw new Error('Like IDs array is required');
  }

  const result = await Like.deleteMany({ _id: { $in: likeIds } });

  res.json({
    success: true,
    message: `${result.deletedCount} likes deleted successfully`
  });
});

// @desc    Get like statistics for admin
// @route   GET /api/admin/likes/stats
// @access  Private/Admin
const getLikeStats = asyncHandler(async (req, res) => {
  const { period = '30' } = req.query; // days
  const daysAgo = new Date();
  daysAgo.setDate(daysAgo.getDate() - parseInt(period));

  const [
    totalLikes,
    recentLikes,
    topLikedArticles,
    topLikers,
    likesByDay,
    likesByArticle
  ] = await Promise.all([
    Like.countDocuments(),
    Like.countDocuments({ createdAt: { $gte: daysAgo } }),
    Like.aggregate([
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
        $limit: 10
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
          title: '$newsData.title',
          slug: '$newsData.slug',
          likeCount: 1
        }
      }
    ]),
    Like.aggregate([
      {
        $group: {
          _id: '$user',
          likeCount: { $sum: 1 }
        }
      },
      {
        $sort: { likeCount: -1 }
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
          likeCount: 1
        }
      }
    ]),
    Like.aggregate([
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
    ]),
    Like.aggregate([
      {
        $group: {
          _id: '$news',
          likeCount: { $sum: 1 }
        }
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
          title: '$newsData.title',
          slug: '$newsData.slug',
          likeCount: 1
        }
      },
      {
        $sort: { likeCount: -1 }
      }
    ])
  ]);

  res.json({
    success: true,
    data: {
      total: totalLikes,
      recent: recentLikes,
      topLikedArticles,
      topLikers,
      likesByDay,
      likesByArticle
    }
  });
});

// @desc    Get likes by article
// @route   GET /api/admin/likes/article/:newsId
// @access  Private/Admin
const getLikesByArticle = asyncHandler(async (req, res) => {
  const { newsId } = req.params;
  const { page = 1, limit = 20 } = req.query;

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  const likes = await Like.find({ news: newsId })
    .populate('user', 'username email profileImage role')
    .populate('news', 'title slug')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum);

  const total = await Like.countDocuments({ news: newsId });

  res.json({
    success: true,
    data: likes,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum)
    }
  });
});

// @desc    Get likes by user
// @route   GET /api/admin/likes/user/:userId
// @access  Private/Admin
const getLikesByUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { page = 1, limit = 20 } = req.query;

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  const likes = await Like.find({ user: userId })
    .populate('user', 'username email profileImage role')
    .populate('news', 'title slug thumbnail')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum);

  const total = await Like.countDocuments({ user: userId });

  res.json({
    success: true,
    data: likes,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum)
    }
  });
});

export {
  getAllLikes,
  deleteLike,
  bulkDeleteLikes,
  getLikeStats,
  getLikesByArticle,
  getLikesByUser
}; 