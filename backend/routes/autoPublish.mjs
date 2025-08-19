import express from 'express';
import {
  autoPublishSentinelDrafts,
  getAutoPublishStats,
  testTelegramNotification,
  getPendingSentinelDrafts
} from '../controllers/autoPublishController.mjs';
import { protect, admin } from '../middleware/auth.mjs';

const router = express.Router();

// All routes require authentication and admin privileges
router.use(protect);
router.use(admin);

// Auto-publish Sentinel drafts
router.post('/sentinel', autoPublishSentinelDrafts);

// Get auto-publish statistics
router.get('/stats', getAutoPublishStats);

// Test Telegram notification
router.post('/test-telegram', testTelegramNotification);

// Get pending Sentinel drafts
router.get('/pending', getPendingSentinelDrafts);

export default router;

