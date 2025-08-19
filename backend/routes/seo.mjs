import express from 'express';
import {
  getArticleSEOAnalysis,
  getAllArticlesSEOAnalysis,
  getSEODashboard,
  optimizeArticleSEO,
  getSEORecommendations
} from "../controllers/seoController.mjs";
import { protect, admin } from "../middleware/auth.mjs";

const router = express.Router();

// All routes require authentication and admin privileges
router.use(protect, admin);

// SEO Dashboard
router.get('/dashboard', getSEODashboard);

// Article-specific SEO analysis
router.get('/article/:id', getArticleSEOAnalysis);

// Bulk SEO analysis
router.get('/articles', getAllArticlesSEOAnalysis);

// SEO optimization
router.post('/optimize/:id', optimizeArticleSEO);

// SEO recommendations
router.get('/recommendations', getSEORecommendations);

export default router;

