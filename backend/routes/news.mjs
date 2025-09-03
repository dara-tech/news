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
import { trackPageView } from "../middleware/userTracking.mjs";
import logger from '../utils/logger.mjs';

const router = express.Router();


logger.info('Registering news routes...');

// Public routes - specific routes first
router.get('/', getNews);

router.get('/featured', getFeaturedNews);
router.get('/breaking', getBreakingNews);
router.get('/category/:category', getNewsByCategory);


logger.info('Registering author route: /author/:authorId');
logger.info('getAuthorProfile function:', typeof getAuthorProfile);

// Test route to see if routing works
router.get('/test-author', (req, res) => {
  logger.info('Author test route hit');
  res.json({ message: 'Author test route working' });
});

router.get('/author/:authorId', getAuthorProfile);

router.get('/admin', protect, admin, getNewsForAdmin);

// This route will handle both slugs and MongoDB ObjectIds - MUST BE LAST
router.get('/:identifier', trackPageView, getNewsByIdentifier);

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
    const { content, options } = req.body;
    
    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Content is required'
      });
    }
    
    // Use advanced formatting if options are provided
    if (options) {
      const { formatContentAdvanced } = await import('../utils/advancedContentFormatter.mjs');
      
      // Handle both string and object content formats
      let formattedContent;
      if (typeof content === 'string') {
        // Single string content - assume it's English and format it
        const result = await formatContentAdvanced(content, options);
        if (result.success) {
          formattedContent = {
            en: result.content,
            kh: '' // Don't auto-translate, let user handle Khmer separately
          };
        } else {
          return res.status(500).json({
            success: false,
            message: 'Failed to format content',
            error: result.error
          });
        }
      } else if (content.en || content.kh) {
        // Object with en/kh properties
        const formattedEn = content.en ? await formatContentAdvanced(content.en, options) : null;
        const formattedKh = content.kh ? await formatContentAdvanced(content.kh, options) : null;
        
        formattedContent = {
          en: formattedEn?.success ? formattedEn.content : content.en,
          kh: formattedKh?.success ? formattedKh.content : content.kh
        };
      } else {
        return res.status(400).json({
          success: false,
          message: 'Invalid content format'
        });
      }
      
      logger.info('Formatted content structure:', JSON.stringify(formattedContent, null, 2));
      
      return res.json({
        success: true,
        data: {
          content: formattedContent
        }
      });
    }
    
    // Fallback to basic formatting
    const { formatArticleContent } = await import('../utils/contentFormatter.mjs');
    let formatted;
    
    if (typeof content === 'string') {
      // Single string - format as English only
      formatted = {
        en: formatArticleContent(content),
        kh: ''
      };
    } else {
      // Object with en/kh properties
      formatted = {
        en: formatArticleContent(content?.en || ''),
        kh: formatArticleContent(content?.kh || '')
      };
    }
    
    return res.json({
      success: true,
      data: {
        content: formatted
      }
    });
  } catch (error) {
    logger.error('Content formatting error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to format content',
      error: error.message
    });
  }
});

// Analyze content quality
router.post('/analyze-content', protect, admin, async (req, res) => {
  try {
    const { content } = req.body;
    
    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Content is required'
      });
    }
    
    const { analyzeContent } = await import('../utils/advancedContentFormatter.mjs');
    const analysis = await analyzeContent(content);
    
    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to analyze content', error: error.message });
  }
});

// Route for duplicating an article
router.route('/:id/duplicate').post(protect, admin, duplicateNews);

logger.info('News routes registered successfully');

export default router;