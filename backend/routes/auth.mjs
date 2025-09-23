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
  dataDeletionCallback,
  checkDataDeletionStatus,
  forgotPassword,
  verifyPinAndResetPassword,
  resetPassword,
} from "../controllers/authController.mjs";
import { protect } from "../middleware/auth.mjs";
import { registrationMiddleware } from "../middleware/settings.mjs";
import upload from "../middleware/upload.mjs";

const router = express.Router();

router.route('/register').post(registrationMiddleware, registerUser);
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

// Data deletion callback routes
router.post('/data-deletion-callback', dataDeletionCallback);
router.get('/data-deletion-status/:userId', checkDataDeletionStatus);

// Password reset routes
router.post('/forgot-password', forgotPassword);
router.post('/verify-pin-reset', verifyPinAndResetPassword);
router.put('/reset-password/:resettoken', resetPassword);

export default router;
