import asyncHandler from "express-async-handler";
import Notification from "../models/Notification.mjs";
import News from "../models/News.mjs";
import User from "../models/User.mjs";

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
export const getUserNotifications = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false } = req.query;
    const userId = req.user._id;

    const query = { recipient: userId };
    if (unreadOnly === 'true') {
      query.isRead = false;
    }

    const notifications = await Notification.find(query)
      .populate('data.newsId', 'title slug thumbnail')
      .populate('data.categoryId', 'name color')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({ 
      recipient: userId, 
      isRead: false 
    });

    res.json({
      success: true,
      notifications,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      totalNotifications: total,
      unreadCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching notifications'
    });
  }
});

// @desc    Mark notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
export const markNotificationAsRead = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, recipient: userId },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      res.status(404);
      throw new Error('Notification not found');
    }

    res.json({
      success: true,
      notification
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating notification'
    });
  }
});

// @desc    Mark all notifications as read
// @route   PATCH /api/notifications/read-all
// @access  Private
export const markAllNotificationsAsRead = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;

    await Notification.updateMany(
      { recipient: userId, isRead: false },
      { isRead: true }
    );

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating notifications'
    });
  }
});

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
export const deleteNotification = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const notification = await Notification.findOneAndDelete({
      _id: id,
      recipient: userId
    });

    if (!notification) {
      res.status(404);
      throw new Error('Notification not found');
    }

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting notification'
    });
  }
});

// @desc    Get notification count
// @route   GET /api/notifications/count
// @access  Private
export const getNotificationCount = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;

    const unreadCount = await Notification.countDocuments({
      recipient: userId,
      isRead: false
    });

    res.json({
      success: true,
      unreadCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching notification count'
    });
  }
});

// @desc    Create notification (internal use)
// @route   POST /api/notifications/create
// @access  Private/Admin
export const createNotification = asyncHandler(async (req, res) => {
  try {
    const {
      recipientId,
      type,
      title,
      message,
      data = {},
      isImportant = false,
      expiresAt = null
    } = req.body;

    // Validate recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      res.status(400);
      throw new Error('Recipient not found');
    }

    const notification = new Notification({
      recipient: recipientId,
      type,
      title,
      message,
      data,
      isImportant,
      expiresAt
    });

    const savedNotification = await notification.save();

    res.status(201).json({
      success: true,
      notification: savedNotification
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating notification'
    });
  }
});

// @desc    Create news notification (when news is published)
// @route   POST /api/notifications/news
// @access  Private/Admin
export const createNewsNotification = asyncHandler(async (req, res) => {
  try {
    const { newsId, type = 'news_published' } = req.body;

    // Get the news article
    const news = await News.findById(newsId)
      .populate('category', 'name color')
      .populate('author', 'username');

    if (!news) {
      res.status(404);
      throw new Error('News article not found');
    }

    // Get all users (or specific users based on preferences)
    const users = await User.find({ role: { $in: ['user', 'editor', 'admin'] } });

    const notifications = [];

    for (const user of users) {
      // Skip if user is the author of the news
      if (user._id.toString() === news.author._id.toString()) {
        continue;
      }

      const notificationData = {
        recipient: user._id,
        type,
        title: {
          en: type === 'breaking_news' ? 'Breaking News!' : 'New Article Published',
          kh: type === 'breaking_news' ? 'ព័ត៌មានថ្មី!' : 'អត្ថបទថ្មីត្រូវបានចេញផ្សាយ'
        },
        message: {
          en: `${news.title.en} has been ${type === 'breaking_news' ? 'published as breaking news' : 'published'}`,
          kh: `${news.title.kh} ត្រូវបាន${type === 'breaking_news' ? 'ចេញផ្សាយជាព័ត៌មានថ្មី' : 'ចេញផ្សាយ'}`
        },
        data: {
          newsId: news._id,
          categoryId: news.category._id,
          actionUrl: `/news/${news.slug}`,
          imageUrl: news.thumbnail
        },
        isImportant: type === 'breaking_news',
        expiresAt: type === 'breaking_news' ? new Date(Date.now() + 24 * 60 * 60 * 1000) : null // 24 hours for breaking news
      };

      const notification = new Notification(notificationData);
      notifications.push(notification);
    }

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    res.json({
      success: true,
      message: `Notifications created for ${notifications.length} users`,
      count: notifications.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating news notifications'
    });
  }
}); 