import asyncHandler from "express-async-handler";
import Category from "../models/Category.mjs";
import News from "../models/News.mjs";
import logger from '../utils/logger.mjs';

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
export const getCategories = asyncHandler(async (req, res) => {
  try {
    // Fetch all categories
    const categories = await Category.find({ isActive: true }).sort({ 'name.en': 1 });

    // Get article counts for each category
    const categoriesWithCounts = await Promise.all(
      categories.map(async (cat) => {
        const articleCount = await News.countDocuments({ 
          category: cat._id, 
          status: 'published' 
        });
        
        return {
          ...cat.toObject(),
          articlesCount: articleCount,
          newsCount: articleCount // Also add newsCount for compatibility
        };
      })
    );

    res.json({ success: true, data: categoriesWithCounts });
  } catch (error) {
    logger.error('Error fetching categories:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch categories' });
  }
});

// @desc    Create a new category
// @route   POST /api/categories
// @access  Private/Admin
export const createCategory = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  if (!name || !name.en || !name.kh) {
    res.status(400);
    throw new Error('Category name (EN and KH) is required.');
  }

  const slugEn = name.en.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
  const slugKh = name.kh.toLowerCase()
    .replace(/[\u1780-\u17FF]/g, 'kh')
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '');

  const categoryExists = await Category.findOne({ 
    $or: [
      { 'slug.en': slugEn },
      { 'slug.kh': slugKh }
    ]
  });

  if (categoryExists) {
    res.status(400);
    throw new Error('A category with this name already exists.');
  }

  const category = new Category({
    name,
    slug: {
      en: slugEn,
      kh: slugKh
    },
    description,
  });

  const createdCategory = await category.save();
  res.status(201).json({ success: true, data: createdCategory });
});

// @desc    Get category by ID
// @route   GET /api/categories/:id
// @access  Public
export const getCategoryById = asyncHandler(async (req, res) => {
  
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      res.status(404);
      throw new Error('Category not found');
    }

    res.json({ success: true, data: category });
  } catch (error) {
    throw error;
  }
});

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private/Admin
export const updateCategory = asyncHandler(async (req, res) => {
  const { name, description, color, isActive } = req.body;

  const category = await Category.findById(req.params.id);

  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }

  // Check if the new name conflicts with existing categories (excluding current one)
  if (name && name.en) {
    const slug = name.en.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
    const existingCategory = await Category.findOne({ 
      slug, 
      _id: { $ne: req.params.id } 
    });

    if (existingCategory) {
      res.status(400);
      throw new Error('A category with this name already exists.');
    }
  }

  // Update fields
  if (name) category.name = name;
  if (description) category.description = description;
  if (color !== undefined) category.color = color;
  if (isActive !== undefined) category.isActive = isActive;

  const updatedCategory = await category.save();
  res.json({ success: true, data: updatedCategory });
});

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }

  // Check if category is being used by any news articles
  // Note: You might want to import your News model and check for references
  // const newsCount = await News.countDocuments({ category: req.params.id });
  // if (newsCount > 0) {
  //   res.status(400);
  //   throw new Error('Cannot delete category that is being used by news articles');
  // }

  await Category.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Category deleted successfully' });
});

// @desc    Bulk delete categories
// @route   DELETE /api/categories/bulk
// @access  Private/Admin
export const bulkDeleteCategories = asyncHandler(async (req, res) => {
  const { ids } = req.body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    res.status(400);
    throw new Error('Please provide an array of category IDs to delete');
  }

  // Check if categories exist
  const categories = await Category.find({ _id: { $in: ids } });
  if (categories.length !== ids.length) {
    res.status(404);
    throw new Error('One or more categories not found');
  }

  // Check if any categories are being used by news articles
  // Note: You might want to import your News model and check for references
  // const newsCount = await News.countDocuments({ category: { $in: ids } });
  // if (newsCount > 0) {
  //   res.status(400);
  //   throw new Error('Cannot delete categories that are being used by news articles');
  // }

  const result = await Category.deleteMany({ _id: { $in: ids } });
  res.json({ 
    success: true, 
    message: `${result.deletedCount} categories deleted successfully`,
    deletedCount: result.deletedCount
  });
});

// @desc    Get category by slug
// @route   GET /api/categories/slug/:slug
// @access  Public
export const getCategoryBySlug = asyncHandler(async (req, res) => {
  const slug = req.params.slug;
  
  // Try to find by English slug
  let category = await Category.findOne({ 'slug.en': slug });
  
  // If not found, try to find by Khmer slug
  if (!category) {
    category = await Category.findOne({ 'slug.kh': slug });
  }
  
  // If still not found, try case-insensitive search on both slug fields
  if (!category) {
    category = await Category.findOne({ 
      $or: [
        { 'slug.en': { $regex: new RegExp('^' + slug + '$', 'i') } },
        { 'slug.kh': { $regex: new RegExp('^' + slug + '$', 'i') } }
      ]
    });
  }

  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }

  res.json({ success: true, data: category });
});
