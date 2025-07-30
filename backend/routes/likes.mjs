import express from 'express';
import {
  likeNews,
  unlikeNews,
  toggleLike,
  getLikeCount,
  checkUserLike,
  getLikeStatus,
  getUserLikes,
  getPopularArticles,
  getLikeStatusPublic
} from '../controllers/likeController.mjs';
import { protect } from '../middleware/auth.mjs';

const router = express.Router();

// Public routes
router.get('/popular', getPopularArticles);
router.get('/:newsId/count', getLikeCount);
router.get('/:newsId/status/public', getLikeStatusPublic);

// Protected routes (require authentication)
router.use(protect);

// User like management
router.post('/:newsId', likeNews);
router.delete('/:newsId', unlikeNews);
router.post('/:newsId/toggle', toggleLike);
router.get('/:newsId/check', checkUserLike);
router.get('/:newsId/status', getLikeStatus);
router.get('/user', getUserLikes);

export default router; 