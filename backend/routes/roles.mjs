import express from 'express';
import { protect, admin } from '../middleware/auth.mjs';
import {
  getRoles,
  createRole,
  updateRole,
  deleteRole,
  getRoleById,
  assignRoleToUser,
  getAvailablePermissions,
  bulkAssignRole,
  getRoleStats
} from '../controllers/roleController.mjs';

const router = express.Router();

// All routes require admin access
router.use(protect, admin);

// Role CRUD routes
router.route('/')
  .get(getRoles)
  .post(createRole);

// Role statistics
router.get('/stats', getRoleStats);

// Available permissions
router.get('/permissions', getAvailablePermissions);

// Bulk role assignment
router.post('/bulk-assign', bulkAssignRole);

router.route('/:id')
  .get(getRoleById)
  .put(updateRole)
  .delete(deleteRole);

// Role assignment
router.put('/:roleId/assign/:userId', assignRoleToUser);

export default router;