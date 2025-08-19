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
import { formatArticleContent } from "../utils/contentFormatter.mjs";

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

// Format content for an article (server-side formatting helper)
router.post('/:id/format-content', protect, admin, async (req, res) => {
  try {
    const content = req.body?.content;
    const formatted = {
      en: formatArticleContent(content?.en || ''),
      kh: formatArticleContent(content?.kh || ''),
    };
    res.json({ success: true, data: { content: formatted } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to format content', error: error.message });
  }
});

// Route for duplicating an article
router.route('/:id/duplicate').post(protect, admin, duplicateNews);

console.log('News routes registered successfully');

export default router;