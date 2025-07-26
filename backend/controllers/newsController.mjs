import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import News from "../models/News.mjs";
import Category from "../models/Category.mjs";
import { v2 as cloudinary } from "cloudinary";

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
      .populate('author', 'name email')
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
      content: contentObj,
      description: descriptionObj,
      slug,
      category,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      author: req.user._id,
      isFeatured: isFeatured === 'true',
      isBreaking: isBreaking === 'true',
      status: 'draft'
    });

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
  const pageSize = 10;
  const page = Number(req.query.page) || 1;
  const keyword = req.query.keyword;

  // --- Build the MongoDB Query ---
  // Start with a base query to only find documents with 'published' status.
  const query = { status: 'published' };

  // If a keyword is provided, add search conditions.
  if (keyword) {
    query.$or = [
      { 'title.en': { $regex: keyword, $options: 'i' } },
      { 'title.kh': { $regex: keyword, $options: 'i' } },
      { 'content.en': { $regex: keyword, $options: 'i' } },
      { 'content.kh': { $regex: keyword, $options: 'i' } }
    ];
  }


  try {
    // --- Execute Queries ---
    // First, count the total number of documents that match the query.
    const count = await News.countDocuments(query);

    // Then, find the documents for the current page.
    const news = await News.find(query)
      .sort({ publishedAt: -1, createdAt: -1 }) // Sort by newest first
      .limit(pageSize)
      .skip(pageSize * (page - 1)) // Handle pagination
      .populate('author', 'username email role') // Populate author details
      .populate('category', 'name color slug');

    
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
      .populate('author', 'name email role')
      .populate('category', 'name color slug');

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
    if (content) news.content = JSON.parse(content);
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

    // Save and return the updated news article
    const savedNews = await news.save();
    const populatedNews = await News.findById(savedNews._id).populate('author', 'username role').populate('category', 'name color slug');

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

  const news = await News.findById(req.params.id);

  if (!news) {
    res.status(404);
    throw new Error('News article not found');
  }

  news.status = status;
  if (status === 'published' && !news.publishedAt) {
    news.publishedAt = Date.now();
  }

  const updatedNews = await news.save();
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