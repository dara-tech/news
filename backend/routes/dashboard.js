import express from 'express';
import { getStats } from '../controllers/dashboardController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.route('/stats').get(protect, admin, getStats);

export default router;
