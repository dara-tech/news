import express from 'express';
import { protect, admin } from '../middleware/auth.mjs';
import {
  trackUserLogin,
  trackUserLogout,
  getUserLoginMapData,
  getUserLoginAnalytics,
  getRecentUserLogins
} from '../controllers/userLoginController.mjs';

const router = express.Router();

// Public routes (for tracking)
router.post('/login-track', trackUserLogin);
router.post('/logout-track', trackUserLogout);

// Admin routes - temporarily removing auth for testing
router.get('/map', getUserLoginMapData);
router.get('/analytics', getUserLoginAnalytics);
router.get('/recent', getRecentUserLogins);

// TODO: Re-enable authentication after testing
// router.use(protect, admin);
// router.get('/map', getUserLoginMapData);
// router.get('/analytics', getUserLoginAnalytics);
// router.get('/recent', getRecentUserLogins);

export default router; 