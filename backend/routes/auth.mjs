import express from "express";
import {
  registerUser,
  loginUser,
  googleAuth,
  googleAuthCallback,
  getUserProfile,
  logoutUser,
  updateUserProfile,
  updateUserPassword,
} from "../controllers/authController.mjs";
import { protect } from "../middleware/auth.mjs";

const router = express.Router();

router.route('/register').post(registerUser);
router.post('/login', loginUser);
router.get('/google', googleAuth);
router.get('/google/callback', googleAuthCallback);
router
  .route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);
router.post('/logout', logoutUser);
router.put('/password', protect, updateUserPassword);

export default router;
