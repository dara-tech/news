import express from 'express';
import {
  getAllFollows,
  getFollowById,
  deleteFollow,
  updateFollowStatus,
  getFollowStats,
  bulkDeleteFollows,
  bulkUpdateFollowStatus
} from '../controllers/followController.mjs';
import { protect, admin } from '../middleware/auth.mjs';

const router = express.Router();

// All routes require authentication and admin privileges
router.use(protect);
router.use(admin);

// Get all follow relationships
router.get('/', getAllFollows);

// Get follow statistics
router.get('/stats/overview', getFollowStats);

// Get specific follow relationship
router.get('/:id', getFollowById);

// Delete follow relationship
router.delete('/:id', deleteFollow);

// Update follow status
router.patch('/:id', updateFollowStatus);

// Bulk operations
router.delete('/bulk', bulkDeleteFollows);
router.patch('/bulk', bulkUpdateFollowStatus);

export default router; 