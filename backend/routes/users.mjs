import express from 'express';
import {
  getUsers,
  deleteUser,
  getUserById,
  updateUser,
  createUser,
} from "../controllers/userController.mjs";
import { protect, admin } from "../middleware/auth.mjs";

const router = express.Router();

router.route('/')
  .get(protect, admin, getUsers)
  .post(protect, admin, createUser);

router.route('/:id')
  .delete(protect, admin, deleteUser)
  .get(protect, admin, getUserById)
  .put(protect, admin, updateUser);

export default router;
