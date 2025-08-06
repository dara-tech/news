import express from 'express';
import { protect, admin } from '../middleware/auth.mjs';
import upload from '../middleware/upload.mjs';
import {
  getGeneralSettings,
  updateGeneralSettings,
  getSecuritySettings,
  updateSecuritySettings,
  getIntegrationSettings,
  updateIntegrationSettings,
  getSecurityStats,
  forceLogoutAllUsers,
  testEmailConfiguration,
  testWebhookConfiguration,
  getSettingsAuditLog,
  getLogoSettings,
  updateLogoSettings,
  uploadLogo,
  deleteLogo,
  getLogoPreview
} from '../controllers/settingsController.mjs';

const router = express.Router();

// All routes require admin access
router.use(protect, admin);

// General Settings Routes
router.route('/general')
  .get(getGeneralSettings)
  .put(updateGeneralSettings);

// Security Settings Routes  
router.route('/security')
  .get(getSecuritySettings)
  .put(updateSecuritySettings);

// Integration Settings Routes
router.route('/integrations')
  .get(getIntegrationSettings)
  .put(updateIntegrationSettings);

// Logo Settings Routes
router.route('/logo')
  .get(getLogoSettings)
  .put(updateLogoSettings)
  .delete(deleteLogo);

router.post('/logo/upload', upload.single('logo'), uploadLogo);
router.get('/logo/preview', getLogoPreview);

// Security Stats and Actions
router.get('/security/stats', getSecurityStats);
router.post('/security/force-logout-all', forceLogoutAllUsers);

// Integration Testing
router.post('/integrations/test-email', testEmailConfiguration);
router.post('/integrations/test-webhook', testWebhookConfiguration);

// Settings Audit Log
router.get('/audit', getSettingsAuditLog);

export default router;