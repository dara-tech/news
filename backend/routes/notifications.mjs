import express from 'express';
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  getNotificationCount,
  createNotification,
  createNewsNotification
} from "../controllers/notificationController.mjs";
import { protect, admin } from "../middleware/auth.mjs";

const router = express.Router();

// All routes are protected
router.use(protect);

// User routes
router.route('/')
  .get(getUserNotifications);

router.route('/count')
  .get(getNotificationCount);

router.route('/read-all')
  .patch(markAllNotificationsAsRead);

router.route('/:id/read')
  .patch(markNotificationAsRead);

router.route('/:id')
  .delete(deleteNotification);

// Admin routes
router.route('/create')
  .post(admin, createNotification);

router.route('/news')
  .post(admin, createNewsNotification);

export default router; 