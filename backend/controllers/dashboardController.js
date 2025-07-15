import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import News from '../models/News.js';

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private/Admin
export const getStats = asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments();
  const totalNews = await News.countDocuments();
  
  const categories = await News.distinct('category');
  const totalCategories = categories.length;

  const newsByCategory = await News.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $project: { name: '$_id', count: 1, _id: 0 } },
    { $sort: { name: 1 } }
  ]);

  res.json({
    totalUsers,
    totalNews,
    totalCategories,
    newsByCategory,
  });
});
