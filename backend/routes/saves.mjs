import express from 'express';
import {
  toggleSave,
  getSaveStatus,
  getSavedArticles,
  removeSave
} from "../controllers/saveController.mjs";
import { protect } from "../middleware/auth.mjs";
import logger from '../utils/logger.mjs';

const router = express.Router();

logger.info('Registering save routes...');

// All routes require authentication
router.use(protect);

// Toggle save status for an article
router.post('/:articleId/toggle', toggleSave);

// Get save status for an article
router.get('/:articleId/status', getSaveStatus);

// Get all saved articles for the current user
router.get('/articles', getSavedArticles);

// Remove an article from saved list
router.delete('/:articleId', removeSave);

export default router;
