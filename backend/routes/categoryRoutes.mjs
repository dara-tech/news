import express from "express";
import { 
  getCategories, 
  createCategory, 
  getCategoryById, 
  updateCategory, 
  deleteCategory, 
  bulkDeleteCategories,
  getCategoryBySlug 
} from "../controllers/categoryController.mjs";
import { protect, admin } from "../middleware/auth.mjs";

const router = express.Router();

// Bulk operations (must come before /:id routes)
router.route('/bulk')
  .delete(protect, admin, bulkDeleteCategories);

// Get category by slug
router.route('/slug/:slug')
  .get(getCategoryBySlug);

// Main CRUD routes
router.route('/')
  .get(getCategories)
  .post(protect, admin, createCategory);

// Debug middleware for /:id route
router.use('/:id', (req, res, next) => {
  next();
});

router.route('/:id')
  .get(getCategoryById)
  .put(protect, admin, updateCategory)
  .delete((req, res, next) => {
    next();
  }, protect, admin, deleteCategory);

export default router;
