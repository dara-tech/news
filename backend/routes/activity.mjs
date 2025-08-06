import express from 'express';
import { protect, admin } from '../middleware/auth.mjs';
import {
  getActivityLogs,
  getActivityStats,
  getSecurityEvents,
  exportActivityLogs,
  cleanupActivityLogs
} from '../controllers/activityController.mjs';

const router = express.Router();

// All routes require admin access
router.use(protect, admin);

// Activity log routes
router.get('/', getActivityLogs);
router.get('/stats', getActivityStats);
router.get('/security', getSecurityEvents);
router.get('/export', exportActivityLogs);
router.delete('/cleanup', cleanupActivityLogs);

export default router;