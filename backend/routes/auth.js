import express from 'express';
import {
  registerUser,
  loginUser,
  getUserProfile,
  logoutUser,
  updateUserProfile,
  updateUserPassword,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.route('/register').post(registerUser);
router.post('/login', loginUser);
router
  .route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);
router.post('/logout', logoutUser);
router.put('/password', protect, updateUserPassword);

export default router;
