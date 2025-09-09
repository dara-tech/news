import express from 'express';
import {
  autoPublishSentinelDrafts,
  getAutoPublishStatus,
  getAutoPublishStats,
  getAutoPublishSettings,
  updateAutoPublishSettings,
  getAutoPublishLogs,
  getTelegramSettings,
  updateTelegramSettings,
  testTelegramConnection,
  sendTelegramNotification
} from '../controllers/autoPublishController.mjs';
import { protect, admin } from '../middleware/auth.mjs';

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);
router.use(admin);

// Auto-publish main routes
router.post('/sentinel', autoPublishSentinelDrafts);
router.get('/status', getAutoPublishStatus);
router.get('/stats', getAutoPublishStats);

// Settings routes
router.get('/settings', getAutoPublishSettings);
router.put('/settings', updateAutoPublishSettings);

// Logs routes
router.get('/logs', getAutoPublishLogs);

// Telegram routes
router.get('/telegram-settings', getTelegramSettings);
router.put('/telegram-settings', updateTelegramSettings);
router.post('/test-telegram', testTelegramConnection);
router.post('/telegram-notification/:id', sendTelegramNotification);

export default router;

