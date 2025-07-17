import express from 'express';
import { getStats } from '../controllers/dashboardController.mjs';
import { protect, admin } from '../middleware/auth.mjs';

const router = express.Router();

router.route('/stats').get(protect, admin, getStats);

export default router;
