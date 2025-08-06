import express from 'express';
import { protect, admin } from '../middleware/auth.mjs';
import { getSystemMetrics } from '../controllers/systemController.mjs';

const router = express.Router();

// System metrics route
router.get('/metrics', getSystemMetrics);

export default router;