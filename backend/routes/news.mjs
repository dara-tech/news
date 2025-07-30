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
  updateNewsStatus,
  getNewsByCategorySlug,
  getAuthorProfile
} from "../controllers/newsController.mjs";
import { protect, admin } from "../middleware/auth.mjs";
import upload from "../middleware/upload.mjs";

const router = express.Router();

// Debug: Log all routes being registered
console.log('Registering news routes...');

// Public routes - specific routes first
router.get('/', getNews);

router.get('/featured', getFeaturedNews);
router.get('/breaking', getBreakingNews);
router.get('/category/:category', getNewsByCategory);

// Debug: Log author route registration
console.log('Registering author route: /author/:authorId');
console.log('getAuthorProfile function:', typeof getAuthorProfile);

// Test route to see if routing works
router.get('/test-author', (req, res) => {
  console.log('Author test route hit');
  res.json({ message: 'Author test route working' });
});

router.get('/author/:authorId', getAuthorProfile);

router.get('/admin', protect, admin, getNewsForAdmin);

// This route will handle both slugs and MongoDB ObjectIds - MUST BE LAST
router.get('/:identifier', getNewsByIdentifier);

// Protected Admin routes
router.post('/', protect, admin, upload.any(), createNews);

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

console.log('News routes registered successfully');

export default router;