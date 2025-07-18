import express from 'express';
import {
  createNews,
  getNews,
  getNewsByIdentifier,
  updateNews,
  deleteNews,
  getFeaturedNews,
  getBreakingNews,
  getNewsByCategory,
  getNewsForAdmin,
  duplicateNews,
  updateNewsStatus
} from "../controllers/newsController.mjs";
import { protect, admin } from "../middleware/auth.mjs";
import upload from "../middleware/upload.mjs";

const router = express.Router();

// Public routes
router.route('/')
  .get(getNews);

router.get('/featured', getFeaturedNews);
router.get('/breaking', getBreakingNews);
router.get('/category/:category', getNewsByCategory);
router.get('/admin', protect, admin, getNewsForAdmin);

// This route will handle both slugs and MongoDB ObjectIds
router.get('/:identifier', getNewsByIdentifier);

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

// Route for updating status
router.route('/:id/status').patch(protect, admin, updateNewsStatus);

// Route for duplicating an article
router.route('/:id/duplicate').post(protect, admin, duplicateNews);

export default router;