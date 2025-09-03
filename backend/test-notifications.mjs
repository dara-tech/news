import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.mjs';
import Notification from './models/Notification.mjs';
import User from './models/User.mjs';
import News from './models/News.mjs';
import Category from './models/Category.mjs';
import logger from '../utils/logger.mjs';

dotenv.config();

const createTestNotifications = async () => {
  try {
    await connectDB();
    logger.info('Connected to database');

    // Get a user and news article for testing
    const user = await User.findOne();
    const news = await News.findOne().populate('category');
    
    if (!user || !news) {
      logger.info('No user or news found. Please create some data first.');
      return;
    }

    logger.info(`Creating notifications for user: ${user.username}`);
    logger.info(`Using news: ${news.title.en}`);

    // Create different types of notifications
    const notifications = [
      {
        recipient: user._id,
        type: 'breaking_news',
        title: {
          en: 'Breaking News!',
          kh: 'ព័ត៌មានថ្មី!'
        },
        message: {
          en: `${news.title.en} has been published as breaking news`,
          kh: `${news.title.kh} ត្រូវបានចេញផ្សាយជាព័ត៌មានថ្មី`
        },
        data: {
          newsId: news._id,
          categoryId: news.category._id,
          actionUrl: `/news/${news.slug}`,
          imageUrl: news.thumbnail
        },
        isImportant: true,
        isRead: false
      },
      {
        recipient: user._id,
        type: 'news_published',
        title: {
          en: 'New Article Published',
          kh: 'អត្ថបទថ្មីត្រូវបានចេញផ្សាយ'
        },
        message: {
          en: `${news.title.en} has been published`,
          kh: `${news.title.kh} ត្រូវបានចេញផ្សាយ`
        },
        data: {
          newsId: news._id,
          categoryId: news.category._id,
          actionUrl: `/news/${news.slug}`,
          imageUrl: news.thumbnail
        },
        isImportant: false,
        isRead: false
      },
      {
        recipient: user._id,
        type: 'news_updated',
        title: {
          en: 'Article Updated',
          kh: 'អត្ថបទត្រូវបានធ្វើបច្ចុប្បន្នភាព'
        },
        message: {
          en: `${news.title.en} has been updated with new information`,
          kh: `${news.title.kh} ត្រូវបានធ្វើបច្ចុប្បន្នភាពជាមួយព័ត៌មានថ្មី`
        },
        data: {
          newsId: news._id,
          categoryId: news.category._id,
          actionUrl: `/news/${news.slug}`,
          imageUrl: news.thumbnail
        },
        isImportant: false,
        isRead: true
      },
      {
        recipient: user._id,
        type: 'system',
        title: {
          en: 'System Notification',
          kh: 'ការជូនដំណឹងប្រព័ន្ធ'
        },
        message: {
          en: 'Welcome to Razewire! Your account has been successfully created.',
          kh: 'សូមស្វាគមន៍មកកាន់ Razewire! គណនីរបស់អ្នកត្រូវបានបង្កើតដោយជោគជ័យ។'
        },
        data: {},
        isImportant: false,
        isRead: false
      }
    ];

    // Clear existing notifications for this user
    await Notification.deleteMany({ recipient: user._id });
    logger.info('Cleared existing notifications');

    // Create new notifications
    const createdNotifications = await Notification.insertMany(notifications);
    logger.info(`Created ${createdNotifications.length} test notifications`);

    // Display the notifications
    const allNotifications = await Notification.find({ recipient: user._id })
      .populate('data.newsId', 'title slug')
      .populate('data.categoryId', 'name');

    logger.info('\nCreated notifications:');
    allNotifications.forEach((notification, index) => {
      logger.info(`${index + 1}. ${notification.title.en} - ${notification.type} - ${notification.isRead ? 'Read' : 'Unread'}`);
    });

    logger.info('\nTest notifications created successfully!');
    process.exit(0);
  } catch (error) {
    logger.error('Error creating test notifications:', error);
    process.exit(1);
  }
};

createTestNotifications(); 