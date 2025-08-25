import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import News from "../models/News.mjs";
import Category from "../models/Category.mjs";
import Notification from "../models/Notification.mjs";
import User from "../models/User.mjs";
import { v2 as cloudinary } from "cloudinary";
import socialMediaService from "../services/socialMediaService.mjs";
import sentinelService from "../services/sentinelService.mjs";

// @desc    Get all news articles for admin (including drafts)
// @route   GET /api/admin/news
// @access  Private/Admin
export const getNewsForAdmin = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    const query = {};
    if (status) {
      query.status = status;
    }
    
    const articles = await News.find(query)
      .populate('author', 'username email profileImage')
      .populate('category', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    
    const total = await News.countDocuments(query);
    
    res.json({
      success: true,
      articles,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      totalArticles: total
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @desc    Create a news article
// @route   POST /api/news
// @access  Private/Admin
export const createNews = asyncHandler(async (req, res) => {
  try {
    // Handle JSON data
    const { 
      title, 
      content, 
      description, 
      category, 
      tags, 
      isFeatured, 
      isBreaking,
      status,
      seo,
      thumbnailUrl // Add thumbnailUrl to destructuring
    } = req.body;

    const thumbnailFile = req.files?.find(file => file.fieldname === 'thumbnail');
    const imageFiles = req.files?.filter(file => file.fieldname === 'images');

    // Parse JSON strings for multilingual fields
    const titleObj = JSON.parse(title);
    const contentObj = JSON.parse(content);
    const descriptionObj = JSON.parse(description);
    const seoObj = seo ? JSON.parse(seo) : {};

    // Validate required fields
    const requiredFields = [
      { field: 'title.en', value: titleObj.en },
      { field: 'title.kh', value: titleObj.kh },
      { field: 'description.en', value: descriptionObj.en },
      { field: 'description.kh', value: descriptionObj.kh },
      { field: 'content.en', value: contentObj.en },
      { field: 'content.kh', value: contentObj.kh },
      { field: 'category', value: category }
    ];

    const missingFields = requiredFields.filter(field => !field.value.trim());
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.map(f => f.field).join(', ')}`);
    }

    // Validate category
    if (!mongoose.Types.ObjectId.isValid(category)) {
      res.status(400);
      throw new Error('Invalid category ID format.');
    }
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      res.status(400);
      throw new Error('Category not found.');
    }

    // Generate slug from title
    const slug = titleObj.en.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const news = new News({
      title: titleObj,
      content: contentObj, // Use original content, let Sentinel handle formatting
      description: descriptionObj,
      slug,
      category,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      author: req.user._id,
      isFeatured: isFeatured === 'true',
      isBreaking: isBreaking === 'true',
      status: status || 'draft'
    });

    // Set publishedAt if creating as published
    if (status === 'published') {
      news.publishedAt = Date.now();
    }

    if (seoObj) {
      if (seoObj.metaDescription) news.metaDescription = seoObj.metaDescription;
      if (seoObj.keywords) news.keywords = seoObj.keywords;
    }

    if (thumbnailFile) {
      const result = await cloudinary.uploader.upload(thumbnailFile.path, {
        folder: 'news/thumbnails',
        public_id: `${news.slug}-${Date.now()}`
      });
      news.thumbnail = result.secure_url;
    } else if (thumbnailUrl) {
      // If a URL is provided directly in the body, use it
      news.thumbnail = thumbnailUrl;
    }

    if (imageFiles?.length) {
      const newImages = [];
      for (const file of imageFiles) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: 'news/gallery',
          public_id: `${news.slug}-gallery-${Date.now()}`
        });
        newImages.push(result.secure_url);
      }
      news.images = newImages;
    }

    // Auto-process content using Sentinel service (keep existing functionality)
    if (contentObj.en && contentObj.en.trim()) {
      try {
        console.log('Auto-processing content for article:', titleObj.en);
        const autoProcessedContent = await sentinelService.autoProcessContent(contentObj.en, titleObj.en);
        
        if (autoProcessedContent) {
          // Update content with auto-processed results
          news.content = {
            en: autoProcessedContent.en,
            kh: autoProcessedContent.kh || contentObj.kh || ''
          };
          
          // Add auto-processing metadata
          news.autoProcessingMetadata = {
            formatted: true,
            translated: !!autoProcessedContent.kh,
            analyzed: !!autoProcessedContent.analysis,
            analysis: autoProcessedContent.analysis,
            processedAt: new Date().toISOString()
          };
          
          console.log('Content auto-processed successfully');
        }
      } catch (error) {
        console.error('Auto-processing failed:', error);
        // Continue with original content if auto-processing fails
      }
    }

    const createdNews = await news.save();
    res.status(201).json(createdNews);
  } catch (error) {
    res.status(500).json({
      message: 'Internal server error',
      error: error.message
    });
  }
});

// @desc    Get all news articles
// @route   GET /api/news
// @access  Public
export const getNews = asyncHandler(async (req, res) => {

  // --- Pagination Parameters ---
  const pageSize = Number(req.query.limit) || 10;
  const page = Number(req.query.page) || 1;
  const keyword = req.query.keyword;
  const category = req.query.category;
  const dateRange = req.query.dateRange;
  const sortBy = req.query.sortBy;
  const featured = req.query.featured;
  const breaking = req.query.breaking;

  // --- Build the MongoDB Query ---
  // Start with a base query to only find documents with 'published' status.
  const query = { status: 'published' };

  // If a keyword is provided, add search conditions.
  if (keyword) {
    query.$or = [
      { 'title.en': { $regex: keyword, $options: 'i' } },
      { 'title.kh': { $regex: keyword, $options: 'i' } },
      { 'content.en': { $regex: keyword, $options: 'i' } },
      { 'content.kh': { $regex: keyword, $options: 'i' } },
      { 'description.en': { $regex: keyword, $options: 'i' } },
      { 'description.kh': { $regex: keyword, $options: 'i' } },
      { 'tags': { $regex: keyword, $options: 'i' } }
    ];
  }

  // Category filter
  if (category) {
    query.category = category;
  }

  // Date range filter
  if (dateRange && dateRange !== 'all') {
    const now = new Date();
    let startDate;
    
    switch (dateRange) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
    }
    
    if (startDate) {
      query.createdAt = { $gte: startDate };
    }
  }

  // Featured filter
  if (featured === 'true') {
    query.isFeatured = true;
  }

  // Breaking filter
  if (breaking === 'true') {
    query.isBreaking = true;
  }

  // Build sort object
  let sortObject = { publishedAt: -1, createdAt: -1 }; // Default sort
  
  if (sortBy) {
    switch (sortBy) {
      case 'date':
        sortObject = { publishedAt: -1, createdAt: -1 };
        break;
      case 'views':
        sortObject = { views: -1 };
        break;
      case 'title':
        sortObject = { 'title.en': 1 };
        break;
      case 'relevance':
      default:
        // For relevance, we'll keep the default sort but could implement text score
        if (keyword) {
          sortObject = { score: { $meta: 'textScore' } };
        }
        break;
    }
  }

  try {
    // --- Execute Queries ---
    // First, count the total number of documents that match the query.
    const count = await News.countDocuments(query);

    // Then, find the documents for the current page.
    let newsQuery = News.find(query)
      .sort(sortObject)
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .populate({
        path: 'author',
        select: 'username email role profileImage'
      })
      .populate('category', 'name color slug');

    // If sorting by relevance and keyword exists, add text score
    if (sortBy === 'relevance' && keyword) {
      newsQuery = newsQuery.select({ score: { $meta: 'textScore' } });
    }

    const news = await newsQuery;
    
    // Debug: Log first news item author
    if (news.length > 0) {
      console.log('DEBUG - First news author:', JSON.stringify(news[0].author, null, 2));
    }
    
    // --- Send Response ---
    const responsePayload = {
      news,
      page,
      pages: Math.ceil(count / pageSize),
      total: count
    };

    res.json(responsePayload);

  } catch (error) {
    res.status(500).json({ message: 'Error fetching news data.' });
  }
});

// @desc    Get single news article by slug or ID
// @route   GET /api/news/:identifier
// @access  Public
export const getNewsByIdentifier = asyncHandler(async (req, res) => {
  try {
    const { identifier } = req.params;
    let query;

    // Check if the identifier is a valid MongoDB ObjectId
    if (mongoose.Types.ObjectId.isValid(identifier)) {
      query = { _id: identifier };
    } else {
      query = { slug: identifier };
    }

    const news = await News.findOne(query)
      .populate({
        path: 'author',
        select: 'username email role profileImage'
      })
      .populate('category', 'name color slug');

    // Debug: Log the author data
    console.log('DEBUG getNewsByIdentifier - Author:', JSON.stringify(news?.author, null, 2));

    if (!news) {
      res.status(404);
      throw new Error('News article not found');
    }

    // Increment views and save
    news.views = (news.views || 0) + 1;
    await news.save();

    res.json({
      success: true,
      data: news
    });
  } catch (error) {
    // Ensure a 404 status is sent if the error was 'News article not found'
    if (error.message === 'News article not found') {
      res.status(404);
    }
    
    
    res.status(res.statusCode !== 200 ? res.statusCode : 500).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
});

// @desc    Update a news article
// @route   PUT /api/news/:id
// @access  Private/Admin
export const updateNews = asyncHandler(async (req, res) => {
  const news = await News.findById(req.params.id);

  if (!news) {
    res.status(404);
    throw new Error('News article not found');
  }

  // Authorization: only the author or an admin can update
  const isAuthor = news.author.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';

  if (!isAuthor && !isAdmin) {
    res.status(403);
    throw new Error('Not authorized to update this news article');
  }

  // Parse JSON fields from request body
  const { 
    title, 
    content, 
    description, 
    category, 
    tags, 
    isFeatured, 
    isBreaking,
    status,
    seo,
    existingImages
  } = req.body;

  try {
    // Update multilingual fields
    if (title) news.title = JSON.parse(title);
    if (content) {
      const contentObj = JSON.parse(content);
      news.content = contentObj; // Use original content, let Sentinel handle formatting
    }
    if (description) news.description = JSON.parse(description);
    
    if (seo) {
      const seoObj = JSON.parse(seo);
      if (seoObj.metaDescription) news.metaDescription = seoObj.metaDescription;
      if (seoObj.keywords) news.keywords = seoObj.keywords;
    }

    // Update other fields
    if (category) {
      if (!mongoose.Types.ObjectId.isValid(category)) {
        res.status(400);
        throw new Error('Invalid category ID format.');
      }
      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        res.status(400);
        throw new Error('Category not found.');
      }
      news.category = category;
    }
    if (tags) news.tags = tags.split(',').map(tag => tag.trim());
    if (isFeatured !== undefined) news.isFeatured = isFeatured === 'true';
    if (isBreaking !== undefined) news.isBreaking = isBreaking === 'true';
    if (status) {
      news.status = status;
      if (status === 'published' && !news.publishedAt) {
        news.publishedAt = Date.now();
      }
    }

    // Handle thumbnail upload
    const thumbnailFile = req.files?.find(file => file.fieldname === 'thumbnail');
    if (thumbnailFile) {
      const result = await cloudinary.uploader.upload(thumbnailFile.path, {
        folder: 'news/thumbnails',
        public_id: `${news.slug}-${Date.now()}`
      });
      news.thumbnail = result.secure_url;
    }

    // Handle gallery image uploads, preserving existing ones
    const existingImagesArray = existingImages ? JSON.parse(existingImages) : [];
    const newImageFiles = req.files?.filter(file => file.fieldname === 'images');
    let newImageUrls = [];

    if (newImageFiles?.length) {
      for (const file of newImageFiles) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: 'news/gallery',
          public_id: `${news.slug}-gallery-${Date.now()}`
        });
        newImageUrls.push(result.secure_url);
      }
    }

    news.images = [...existingImagesArray, ...newImageUrls];

    // Auto-process content using Sentinel service (if content was updated)
    if (content && news.content.en && news.content.en.trim()) {
      try {
        console.log('Auto-processing updated content for article:', news.title.en);
        const autoProcessedContent = await sentinelService.autoProcessContent(news.content.en, news.title.en);
        
        if (autoProcessedContent) {
          // Update content with auto-processed results
          news.content = {
            en: autoProcessedContent.en,
            kh: autoProcessedContent.kh || news.content.kh || ''
          };
          
          // Add auto-processing metadata
          news.autoProcessingMetadata = {
            formatted: true,
            translated: !!autoProcessedContent.kh,
            analyzed: !!autoProcessedContent.analysis,
            analysis: autoProcessedContent.analysis,
            processedAt: new Date().toISOString()
          };
          
          console.log('Updated content auto-processed successfully');
        }
      } catch (error) {
        console.error('Auto-processing failed for update:', error);
        // Continue with original content if auto-processing fails
      }
    }

    // Save and return the updated news article
    const savedNews = await news.save();
    const populatedNews = await News.findById(savedNews._id).populate('author', 'username role profileImage').populate('category', 'name color slug');

    res.json({ success: true, data: populatedNews });
  } catch (error) {
    res.status(500).json({ message: 'Error updating news article', error: error.message });
  }
});

// @desc    Duplicate a news article
// @route   POST /api/news/:id/duplicate
// @access  Private/Admin
export const duplicateNews = asyncHandler(async (req, res) => {
  const originalNews = await News.findById(req.params.id).lean();

  if (!originalNews) {
    res.status(404);
    throw new Error('News article not found');
  }

  // Create a new article object, removing fields that should be unique or reset
  const { _id, slug, createdAt, updatedAt, publishedAt, views, ...restOfNews } = originalNews;

  const newArticle = new News({
    ...restOfNews,
    title: {
      en: `Copy of ${originalNews.title.en}`.substring(0, 100), // Prevent overly long titles
      kh: `ច្បាប់ចម្លងនៃ ${originalNews.title.kh}`.substring(0, 100),
    },
    slug: `${originalNews.slug}-copy-${Date.now()}`,
    status: 'draft',
    author: req.user._id,
    views: 0,
    publishedAt: null,
    // We intentionally do not copy images to avoid complex Cloudinary duplication.
    // The user can add new images when editing the duplicated draft.
    thumbnail: null,
    images: [],
  });

  const createdArticle = await newArticle.save();
  res.status(201).json(createdArticle);
});

// @desc    Update news article status
// @route   PATCH /api/news/:id/status
// @access  Private/Admin
export const updateNewsStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!status) {
    res.status(400);
    throw new Error('Status is required');
  }

  const allowedStatuses = ['draft', 'published', 'archived'];
  if (!allowedStatuses.includes(status)) {
    res.status(400);
    throw new Error(`Invalid status. Must be one of: ${allowedStatuses.join(', ')}`);
  }

  const news = await News.findById(req.params.id)
    .populate('category', 'name color')
    .populate('author', 'username');

  if (!news) {
    res.status(404);
    throw new Error('News article not found');
  }

  const wasPublished = news.status === 'published';
  news.status = status;
  
  if (status === 'published' && !news.publishedAt) {
    news.publishedAt = Date.now();
    
    // Format content when moving to published status
    try {
      const { formatContentAdvanced } = await import('../utils/advancedContentFormatter.mjs');
      
      // Format English content
      if (news.content?.en && news.content.en.trim()) {
        const enResult = await formatContentAdvanced(news.content.en, {
          enableAIEnhancement: true,
          enableReadabilityOptimization: true,
          enableSEOOptimization: true,
          enableVisualEnhancement: true,
          addSectionHeadings: true,
          enhanceQuotes: true,
          optimizeLists: true,
          enableContentAnalysis: false
        });
        
        if (enResult.success) {
          news.content.en = enResult.content;
          console.log('Content formatted for English when publishing');
        }
      }
      
      // Format Khmer content
      if (news.content?.kh && news.content.kh.trim()) {
        const khResult = await formatContentAdvanced(news.content.kh, {
          enableAIEnhancement: true,
          enableReadabilityOptimization: true,
          enableSEOOptimization: true,
          enableVisualEnhancement: true,
          addSectionHeadings: true,
          enhanceQuotes: true,
          optimizeLists: true,
          enableContentAnalysis: false
        });
        
        if (khResult.success) {
          news.content.kh = khResult.content;
          console.log('Content formatted for Khmer when publishing');
        }
      }
    } catch (error) {
      console.error('Content formatting failed during status update:', error);
      // Continue with original content if formatting fails
    }
  }

  const updatedNews = await news.save();

  // Create notifications when news is published for the first time
  if (status === 'published' && !wasPublished) {
    try {
      // Get all users except the author
      const users = await User.find({ 
        _id: { $ne: news.author._id },
        role: { $in: ['user', 'editor', 'admin'] } 
      });

      const notifications = [];
      const notificationType = news.isBreaking ? 'breaking_news' : 'news_published';

      for (const user of users) {
        const notificationData = {
          recipient: user._id,
          type: notificationType,
          title: {
            en: notificationType === 'breaking_news' ? 'Breaking News!' : 'New Article Published',
            kh: notificationType === 'breaking_news' ? 'ព័ត៌មានថ្មី!' : 'អត្ថបទថ្មីត្រូវបានចេញផ្សាយ'
          },
          message: {
            en: `${news.title.en} has been ${notificationType === 'breaking_news' ? 'published as breaking news' : 'published'}`,
            kh: `${news.title.kh} ត្រូវបាន${notificationType === 'breaking_news' ? 'ចេញផ្សាយជាព័ត៌មានថ្មី' : 'ចេញផ្សាយ'}`
          },
          data: {
            newsId: news._id,
            categoryId: news.category._id,
            actionUrl: `/news/${news.slug}`,
            imageUrl: news.thumbnail
          },
          isImportant: notificationType === 'breaking_news',
          expiresAt: notificationType === 'breaking_news' ? new Date(Date.now() + 24 * 60 * 60 * 1000) : null // 24 hours for breaking news
        };

        const notification = new Notification(notificationData);
        notifications.push(notification);
      }

      if (notifications.length > 0) {
        await Notification.insertMany(notifications);
        console.log(`Created ${notifications.length} notifications for news: ${news.title.en}`);
      }

      // Auto-post to social media when news is published
      try {
        const autoPostResult = await socialMediaService.autoPostContent(news, req.user);
        console.log('Auto-posting result:', autoPostResult);
        
        if (autoPostResult.success) {
          console.log(`Successfully posted to ${autoPostResult.successfulPosts}/${autoPostResult.totalPlatforms} platforms`);
        } else {
          console.log('Auto-posting failed or disabled:', autoPostResult.message);
        }
      } catch (error) {
        console.error('Error in auto-posting:', error);
        // Don't fail the request if auto-posting fails
      }
    } catch (error) {
      console.error('Error creating notifications:', error);
      // Don't fail the request if notification creation fails
    }
  }

  res.json(updatedNews);
});

// @desc    Delete a news article
// @route   DELETE /api/news/:id
// @access  Private/Admin
export const deleteNews = asyncHandler(async (req, res) => {
  try {
    const news = await News.findById(req.params.id);

    if (news) {
      // Authorization: only the author or an admin can delete
      const isAuthor = news.author.toString() === req.user._id.toString();
      const isAdmin = req.user.role === 'admin';

      if (!isAuthor && !isAdmin) {
        res.status(401);
        throw new Error('User not authorized to delete this article');
      }

      // Delete thumbnail from Cloudinary
      if (news.thumbnail) {
        const publicId = news.thumbnail.split('/').slice(-2).join('/').split('.')[0];
        await cloudinary.uploader.destroy(publicId);
      }

      // Delete gallery images from Cloudinary
      if (news.images?.length) {
        for (const image of news.images) {
          const publicId = image.split('/').slice(-2).join('/').split('.')[0];
          await cloudinary.uploader.destroy(publicId);
        }
      }

      await News.deleteOne({ _id: news._id });
      res.json({ message: 'News article removed' });
    } else {
      res.status(404);
      throw new Error('News article not found');
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error while deleting news.' });
  }
});

// @desc    Get featured news
// @route   GET /api/news/featured
// @access  Public
export const getFeaturedNews = asyncHandler(async (req, res) => {
  const featuredNews = await News.find({ 
    isFeatured: true, 
    status: 'published' 
  })
  .sort({ publishedAt: -1 })
  .limit(5)
  .populate('author', 'username')
  .populate('category', 'name color slug');
  
  res.json(featuredNews);
});

// @desc    Get breaking news
// @route   GET /api/news/breaking
// @access  Public
export const getBreakingNews = asyncHandler(async (req, res) => {
  const breakingNews = await News.find({ 
    isBreaking: true, 
    status: 'published' 
  })
  .sort({ publishedAt: -1 })
  .limit(5)
  .populate('author', 'username')
  .populate('category', 'name color slug');
  
  res.json(breakingNews);
});

// @desc    Get news by category
// @route   GET /api/news/category/:category
// @access  Public
export const getNewsByCategory = asyncHandler(async (req, res) => {
  try {
    
    const pageSize = 10;
    const page = Number(req.query.page) || 1;
    const category = req.params.category.toLowerCase();

    // First, try to find the category by slug
    let categoryDoc = await Category.findOne({ slug: category });

    // If not found by slug, try by name (legacy support)
    if (!categoryDoc) {
      categoryDoc = await Category.findOne({ 
        name: { $regex: new RegExp('^' + category + '$', 'i') } 
      });
    }

    if (!categoryDoc) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
        category
      });
    }


    // Count total matching documents
    const count = await News.countDocuments({ 
      category: categoryDoc._id,
      status: 'published' 
    });
    
    // Get paginated results
    const news = await News.find({ 
      category: categoryDoc._id,
      status: 'published' 
    })
    .sort({ publishedAt: -1 })
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .populate('author', 'username')
    .populate('category', 'name color slug');


    res.json({
      success: true,
      news,
      page,
      pages: Math.ceil(count / pageSize),
      total: count,
      category: categoryDoc.name
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching news by category',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});


// @desc    Get news by category slug
// @route   GET /api/news/category/:slug
// @access  Public
export const getNewsByCategorySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  // Find the category by slug
  const categoryDoc = await Category.findOne({ slug });
  if (!categoryDoc) {
    return res.status(404).json({
      success: false,
      message: 'Category not found',
      category: slug
    });
  }

  // Find news with this category ObjectId
  const news = await News.find({ 
    category: categoryDoc._id,
    status: 'published'
  })
  .sort({ publishedAt: -1 })
  .populate('author', 'username')
  .populate('category', 'name color slug');

  res.json({
    success: true,
    news,
    category: categoryDoc.name
  });
});

// @desc    Get author profile and articles
// @route   GET /api/news/author/:authorId
// @access  Public
export const getAuthorProfile = asyncHandler(async (req, res) => {
  console.log('getAuthorProfile called with params:', req.params);
  try {
    const { authorId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Validate author ID
    if (!mongoose.Types.ObjectId.isValid(authorId)) {
      res.status(400);
      throw new Error('Invalid author ID format.');
    }

    // Get author information
    const author = await User.findById(authorId).select('username email avatar profileImage role createdAt');
    console.log('🔍 Raw author from DB:', JSON.stringify(author, null, 2));
    if (!author) {
      res.status(404);
      throw new Error('Author not found.');
    }

    // Get author's published articles
    const articles = await News.find({ 
      author: authorId,
      status: 'published' 
    })
    .populate('category', 'name color slug')
    .sort({ publishedAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

    // Get total count for pagination
    const totalArticles = await News.countDocuments({ 
      author: authorId,
      status: 'published' 
    });

    // Calculate author stats
    const totalViews = await News.aggregate([
      { $match: { author: new mongoose.Types.ObjectId(authorId), status: 'published' } },
      { $group: { _id: null, totalViews: { $sum: { $ifNull: ['$views', 0] } } } }
    ]);

    const totalLikes = await News.aggregate([
      { $match: { author: new mongoose.Types.ObjectId(authorId), status: 'published' } },
      { $group: { _id: null, totalLikes: { $sum: { $ifNull: ['$likes', 0] } } } }
    ]);

    // Get author's join date (first article date or user creation date)
    const firstArticle = await News.findOne({ 
      author: authorId,
      status: 'published' 
    }).sort({ publishedAt: 1 });

    const authorStats = {
      totalArticles,
      totalViews: totalViews[0]?.totalViews || 0,
      totalLikes: totalLikes[0]?.totalLikes || 0,
      joinDate: firstArticle?.publishedAt || author.createdAt
    };

    res.json({
      success: true,
      author: {
        _id: author._id,
        username: author.username,
        email: author.email,
        avatar: author.avatar,
        profileImage: author.profileImage,
        role: author.role,
        stats: authorStats
      },
      articles,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalArticles / limit),
        totalArticles
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching author profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});