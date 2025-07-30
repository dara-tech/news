import express from 'express';
import {
  getComments,
  createComment,
  updateComment,
  deleteComment,
  toggleCommentLike,
  getCommentStats
} from '../controllers/commentController.mjs';
import { protect } from '../middleware/auth.mjs';

const router = express.Router();

// Public routes
router.get('/:newsId', getComments);
router.get('/:newsId/stats', getCommentStats);

// Protected routes (require authentication)
router.use(protect);

// Comment management
router.post('/:newsId', createComment);
router.put('/:commentId', updateComment);
router.delete('/:commentId', deleteComment);
router.post('/:commentId/like', toggleCommentLike);

export default router; 