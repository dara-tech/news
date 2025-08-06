import express from "express";
import { 
  getAllComments, 
  approveComment, 
  rejectComment, 
  deleteComment, 
  bulkApproveComments, 
  bulkRejectComments, 
  bulkDeleteComments,
  getCommentStats 
} from "../controllers/adminCommentController.mjs";
import { protect, admin } from "../middleware/auth.mjs";

const router = express.Router();

// All routes require admin authentication
router.use(protect, admin);

// Get all comments with filtering and pagination
router.route('/').get(getAllComments);

// Get comment statistics
router.route('/stats').get(getCommentStats);

// Individual comment actions
router.route('/:commentId/approve').put(approveComment);
router.route('/:commentId/reject').put(rejectComment);
router.route('/:commentId').delete(deleteComment);

// Bulk actions
router.route('/bulk-approve').put(bulkApproveComments);
router.route('/bulk-reject').put(bulkRejectComments);
router.route('/bulk-delete').delete(bulkDeleteComments);

export default router; 