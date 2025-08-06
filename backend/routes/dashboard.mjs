import express from "express";
import { getStats, getAdvancedStats, getAnalytics } from "../controllers/dashboardController.mjs";
import { protect, admin } from "../middleware/auth.mjs";

const router = express.Router();

console.log('Registering dashboard routes...');
console.log('getStats function:', typeof getStats);
console.log('getAdvancedStats function:', typeof getAdvancedStats);
console.log('getAnalytics function:', typeof getAnalytics);

router.route('/stats').get(protect, admin, getStats);
router.route('/advanced-stats').get(protect, admin, getAdvancedStats);
router.route('/analytics').get(protect, admin, getAnalytics);

console.log('Dashboard routes registered successfully');

export default router;
