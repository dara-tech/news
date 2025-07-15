import express from 'express';
import {
  createNews,
  getNews,
  getNewsById,
  getNewsBySlug,
  updateNews,
  deleteNews,
  getFeaturedNews,
  getBreakingNews,
  getNewsByCategory,
  getNewsForAdmin
} from '../controllers/newsController.js';
import { protect, admin } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// Public routes
router.route('/')
  .get(getNews);

router.get('/featured', getFeaturedNews);
router.get('/breaking', getBreakingNews);
router.get('/category/:category', getNewsByCategory);
router.get('/admin', protect, admin, getNewsForAdmin);

// The ID route uses a regex to specifically match a 24-character MongoDB ObjectId.
router.get('/:id([0-9a-fA-F]{24})', protect, getNewsById);

// The slug route will handle any other string, acting as a fallback.
router.get('/:slug', getNewsBySlug);

// Protected Admin routes
router.route('/')
  .post(
    protect, 
    admin, 
    upload.any(), 
    createNews
  );

router.route('/:id')
  .put(
    protect, 
    admin, 
    upload.any(), 
    updateNews
  )
  .delete(protect, admin, deleteNews);

export default router;
