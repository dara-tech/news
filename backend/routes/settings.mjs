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
  getLogoPreview,
  getSocialMediaSettings,
  updateSocialMediaSettings,
  getPublicSocialMediaSettings,
  getPublicLogoSettings,
  getPublicFooterSettings,
  getFooterSettings,
  updateFooterSettings,
  testSocialMediaConnection,
  getSocialMediaStats,
  manualSocialMediaPost
} from '../controllers/settingsController.mjs';

const router = express.Router();

// Public routes (no authentication required)
router.get('/public/social-media', getPublicSocialMediaSettings);
router.get('/public/logo', getPublicLogoSettings);
router.get('/public/footer', getPublicFooterSettings);

// Protected routes (require authentication)
router.use(protect);
router.use(admin);

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

// Social Media Settings Routes
router.route('/social-media')
  .get(getSocialMediaSettings)
  .put(updateSocialMediaSettings);

router.post('/social-media/test', testSocialMediaConnection);
router.get('/social-media/stats', getSocialMediaStats);
router.post('/social-media/post', manualSocialMediaPost);

// Footer Settings Routes
router.route('/footer')
  .get(getFooterSettings)
  .put(updateFooterSettings);

// Security Stats and Actions
router.get('/security/stats', getSecurityStats);
router.post('/security/force-logout-all', forceLogoutAllUsers);

// Integration Testing
router.post('/integrations/test-email', testEmailConfiguration);
router.post('/integrations/test-webhook', testWebhookConfiguration);

// Settings Audit Log
router.get('/audit', getSettingsAuditLog);

export default router;