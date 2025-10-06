import express from 'express';
import { protect, admin } from '../middleware/auth.mjs';
import { getSystemMetrics, getSentinelConfig, updateSentinelConfig, runSentinelOnce, getSentinelLogs, importSentinelUrl, getSentinelStatus, stopSentinelService } from '../controllers/systemController.mjs';

const router = express.Router();

// System metrics route
router.get('/metrics', protect, admin, getSystemMetrics);
router.get('/sentinel', protect, admin, getSentinelConfig);
router.get('/sentinel/status', protect, admin, getSentinelStatus);
router.put('/sentinel', protect, admin, updateSentinelConfig);
router.post('/sentinel/run-once', protect, admin, runSentinelOnce);
router.post('/sentinel/stop', protect, admin, stopSentinelService);
router.get('/sentinel/logs', protect, admin, getSentinelLogs);
router.post('/sentinel/import-url', protect, admin, importSentinelUrl);

export default router;