import express from 'express';
import { getCategories, createCategory } from '../controllers/categoryController.mjs';
import { protect, admin } from '../middleware/auth.mjs';

const router = express.Router();

router.route('/')
  .get(getCategories)
  .post(protect, admin, createCategory);

export default router;
