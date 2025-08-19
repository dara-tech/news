import express from 'express';
import {
  handleTelegramWebhook,
  setTelegramWebhook,
  getTelegramWebhookInfo,
  deleteTelegramWebhook
} from '../controllers/telegramWebhookController.mjs';
import { protect, admin } from '../middleware/auth.mjs';

const router = express.Router();

// Public webhook endpoint (no authentication required)
router.post('/webhook', handleTelegramWebhook);

// Admin-only webhook management endpoints
router.post('/set-webhook', protect, admin, setTelegramWebhook);
router.get('/webhook-info', protect, admin, getTelegramWebhookInfo);
router.delete('/delete-webhook', protect, admin, deleteTelegramWebhook);

export default router;

