import asyncHandler from "express-async-handler";
import User from "../models/User.mjs";
import News from "../models/News.mjs";
import Category from "../models/Category.mjs";

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private/Admin
export const getStats = asyncHandler(async (req, res) => {
  try {
    console.log('--- Fetching Dashboard Stats ---');
    
    // Get total users
    const totalUsers = await User.countDocuments();
    console.log('Total Users:', totalUsers);
    
    // Get total published news
    const totalNews = await News.countDocuments({ status: 'published' });
    console.log('Total Published News:', totalNews);
    
    // Get distinct categories with count
    const categories = await Category.find({}).lean();
    const totalCategories = categories.length;
    console.log('Total Categories:', totalCategories);

    // Get news count by category with category names
    const newsByCategory = await News.aggregate([
      { $match: { status: 'published' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'categoryInfo'
        }
      },
      { $unwind: '$categoryInfo' },
      { 
        $project: { 
          name: '$categoryInfo.name',
          count: 1,
          _id: 0 
        } 
      },
      { $sort: { name: 1 } }
    ]);

    console.log('News by Category:', newsByCategory);

    // Get recent activities
    const recentNews = await News.find({ status: 'published' })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('author', 'username')
      .populate('category', 'name')
      .lean();

    const stats = {
      totalUsers,
      totalNews,
      totalCategories,
      newsByCategory,
      recentNews
    };

    console.log('--- Sending Dashboard Stats ---');
    res.json({
      success: true,
      data: stats
    });
    
  } catch (error) {
    console.error('Error in getStats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});
