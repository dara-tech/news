import express from 'express';
import {
  followUser,
  unfollowUser,
  toggleFollow,
  getFollowersCount,
  getFollowingCount,
  checkFollowStatus,
  getFollowers,
  getFollowing
} from "../controllers/followController.mjs";
import { protect } from "../middleware/auth.mjs";

const router = express.Router();

// Follow/unfollow routes (require auth)
router.route('/:userId')
  .post(protect, followUser)
  .delete(protect, unfollowUser);

// Toggle follow status (requires auth)
router.route('/:userId/toggle')
  .post(protect, toggleFollow);

// Check follow status (requires auth)
router.route('/:userId/check')
  .get(protect, checkFollowStatus);

// Get followers count (public)
router.route('/:userId/followers/count')
  .get(getFollowersCount);

// Get following count (public)
router.route('/:userId/following/count')
  .get(getFollowingCount);

// Get followers list (public)
router.route('/:userId/followers')
  .get(getFollowers);

// Get following list (public)
router.route('/:userId/following')
  .get(getFollowing);

export default router; 