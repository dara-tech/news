import asyncHandler from "express-async-handler";
import Save from "../models/Save.mjs";
import News from "../models/News.mjs";
import User from "../models/User.mjs";
import logger from '../utils/logger.mjs';

// @desc    Toggle save status for an article
// @route   POST /api/saves/:articleId/toggle
// @access  Private
export const toggleSave = asyncHandler(async (req, res) => {
  const { articleId } = req.params;
  const userId = req.user._id;

  try {
    // Check if article exists
    const article = await News.findById(articleId);
    if (!article) {
      res.status(404);
      throw new Error('Article not found');
    }

    // Check if save already exists
    const existingSave = await Save.findOne({ user: userId, article: articleId });

    if (existingSave) {
      // Remove save
      await Save.findByIdAndDelete(existingSave._id);
      
      // Update article save count
      const saveCount = await Save.countDocuments({ article: articleId });
      await News.findByIdAndUpdate(articleId, { saves: saveCount });

      logger.info(`User ${userId} unsaved article ${articleId}`);
      
      res.json({
        success: true,
        message: 'Article removed from saved list',
        saved: false,
        count: saveCount
      });
    } else {
      // Create new save
      const newSave = new Save({
        user: userId,
        article: articleId
      });
      
      await newSave.save();
      
      // Update article save count
      const saveCount = await Save.countDocuments({ article: articleId });
      await News.findByIdAndUpdate(articleId, { saves: saveCount });

      logger.info(`User ${userId} saved article ${articleId}`);
      
      res.json({
        success: true,
        message: 'Article saved successfully',
        saved: true,
        count: saveCount
      });
    }
  } catch (error) {
    logger.error('Error toggling save:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle save status',
      error: error.message
    });
  }
});

// @desc    Get save status for an article
// @route   GET /api/saves/:articleId/status
// @access  Private
export const getSaveStatus = asyncHandler(async (req, res) => {
  const { articleId } = req.params;
  const userId = req.user._id;

  try {
    // Check if user has saved this article
    const save = await Save.findOne({ user: userId, article: articleId });
    const saved = !!save;

    // Get total save count for this article
    const saveCount = await Save.countDocuments({ article: articleId });

    res.json({
      success: true,
      saved,
      count: saveCount
    });
  } catch (error) {
    logger.error('Error getting save status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get save status',
      error: error.message
    });
  }
});

// @desc    Get all saved articles for the current user
// @route   GET /api/saves/articles
// @access  Private
export const getSavedArticles = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { page = 1, limit = 20 } = req.query;

  try {
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get saved articles with pagination
    const saves = await Save.find({ user: userId })
      .populate({
        path: 'article',
        select: 'title description content thumbnail images author category publishedAt createdAt views likes comments saves isFeatured isBreaking slug',
        populate: [
          {
            path: 'author',
            select: 'name username email avatar profileImage role'
          },
          {
            path: 'category',
            select: 'name slug'
          }
        ]
      })
      .sort({ savedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Filter out null articles (in case article was deleted)
    const validSaves = saves.filter(save => save.article);
    const articles = validSaves.map(save => save.article);

    // Get total count
    const totalSaves = await Save.countDocuments({ user: userId });
    const totalPages = Math.ceil(totalSaves / parseInt(limit));

    res.json({
      success: true,
      data: articles,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: totalSaves,
        hasMore: parseInt(page) < totalPages
      }
    });
  } catch (error) {
    logger.error('Error getting saved articles:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get saved articles',
      error: error.message
    });
  }
});

// @desc    Remove an article from saved list
// @route   DELETE /api/saves/:articleId
// @access  Private
export const removeSave = asyncHandler(async (req, res) => {
  const { articleId } = req.params;
  const userId = req.user._id;

  try {
    const save = await Save.findOneAndDelete({ user: userId, article: articleId });
    
    if (!save) {
      res.status(404);
      throw new Error('Save not found');
    }

    // Update article save count
    const saveCount = await Save.countDocuments({ article: articleId });
    await News.findByIdAndUpdate(articleId, { saves: saveCount });

    logger.info(`User ${userId} removed save for article ${articleId}`);
    
    res.json({
      success: true,
      message: 'Article removed from saved list',
      saved: false,
      count: saveCount
    });
  } catch (error) {
    logger.error('Error removing save:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove save',
      error: error.message
    });
  }
});
