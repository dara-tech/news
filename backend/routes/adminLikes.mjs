import express from "express";
import { 
  getAllLikes, 
  deleteLike, 
  bulkDeleteLikes, 
  getLikeStats, 
  getLikesByArticle, 
  getLikesByUser 
} from "../controllers/adminLikeController.mjs";
import { protect, admin } from "../middleware/auth.mjs";

const router = express.Router();

// All routes require admin authentication
router.use(protect, admin);

// Get all likes with filtering and pagination
router.route('/').get(getAllLikes);

// Get like statistics
router.route('/stats').get(getLikeStats);

// Individual like actions
router.route('/:likeId').delete(deleteLike);

// Bulk actions
router.route('/bulk-delete').delete(bulkDeleteLikes);

// Get likes by article
router.route('/article/:newsId').get(getLikesByArticle);

// Get likes by user
router.route('/user/:userId').get(getLikesByUser);

export default router; 