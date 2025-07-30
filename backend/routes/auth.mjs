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
  updateUserProfileImage,
} from "../controllers/authController.mjs";
import { protect } from "../middleware/auth.mjs";
import upload from "../middleware/upload.mjs";

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
router.put('/profile/image', protect, upload.single('profileImage'), updateUserProfileImage);

export default router;
