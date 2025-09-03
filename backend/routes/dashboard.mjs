import express from "express";
import { getStats, getAdvancedStats, getAnalytics } from "../controllers/dashboardController.mjs";
import { protect, admin } from "../middleware/auth.mjs";
import logger from '../utils/logger.mjs';

const router = express.Router();

logger.info('Registering dashboard routes...');
logger.info('getStats function:', typeof getStats);
logger.info('getAdvancedStats function:', typeof getAdvancedStats);
logger.info('getAnalytics function:', typeof getAnalytics);

router.route('/stats').get(protect, admin, getStats);
router.route('/advanced-stats').get(protect, admin, getAdvancedStats);
router.route('/analytics').get(protect, admin, getAnalytics);

logger.info('Dashboard routes registered successfully');

export default router;
