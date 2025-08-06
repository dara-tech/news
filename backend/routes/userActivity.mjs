import express from 'express';
import { protect } from '../middleware/auth.mjs';
import {
  getUserActivityLogs,
  getUserActivityStats,
  exportUserActivityLogs
} from '../controllers/userActivityController.mjs';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get user's activity logs
router.get('/', getUserActivityLogs);

// Get user's activity statistics
router.get('/stats', getUserActivityStats);

// Export user's activity logs as CSV
router.get('/export', exportUserActivityLogs);

export default router; 