import asyncHandler from "express-async-handler";
import Category from "../models/Category.mjs";

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({}).sort({ 'name.en': 1 });
  res.json({ success: true, data: categories });
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

  const slug = name.en.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');

  const categoryExists = await Category.findOne({ slug });

  if (categoryExists) {
    res.status(400);
    throw new Error('A category with this name already exists.');
  }

  const category = new Category({
    name,
    slug,
    description,
  });

  const createdCategory = await category.save();
  res.status(201).json({ success: true, data: createdCategory });
});
