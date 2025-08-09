import express from 'express';
import { protect, admin } from '../middleware/auth.mjs';
import { getSystemMetrics, getSentinelConfig, updateSentinelConfig, runSentinelOnce, getSentinelLogs, importSentinelUrl } from '../controllers/systemController.mjs';

const router = express.Router();

// System metrics route
router.get('/metrics', protect, admin, getSystemMetrics);
router.get('/sentinel', protect, admin, getSentinelConfig);
router.put('/sentinel', protect, admin, updateSentinelConfig);
router.post('/sentinel/run-once', protect, admin, runSentinelOnce);
router.get('/sentinel/logs', protect, admin, getSentinelLogs);
router.post('/sentinel/import-url', protect, admin, importSentinelUrl);

export default router;