import express from 'express';
import {
  getAnalytics,
  getAnalyticsSummary
} from '../controllers/analyticsController.mjs';
import { protect, admin } from '../middleware/auth.mjs';

const router = express.Router();

// All routes require admin access
router.use(protect);
router.use(admin);

// Get analytics data
router.get('/', getAnalytics);

// Get analytics summary
router.get('/summary', getAnalyticsSummary);

export default router; 