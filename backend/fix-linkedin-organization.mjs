import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Settings from './models/Settings.mjs';
import logger from '../utils/logger.mjs';

dotenv.config();

async function fixLinkedInOrganization() {
  logger.info('🔗 LinkedIn Organization ID Fix Tool');
  logger.info('====================================\n');
  
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    logger.info('✅ Connected to MongoDB');
    
    // Get current settings
    const settings = await Settings.getCategorySettings('social-media');
    logger.info('📋 Current LinkedIn Configuration:');
    logger.info(`Client ID: ${settings.linkedinClientId || 'Not set'}`);
    logger.info(`Client Secret: ${settings.linkedinClientSecret ? 'Set' : 'Not set'}`);
    logger.info(`Access Token: ${settings.linkedinAccessToken ? 'Set' : 'Not set'}`);
    logger.info(`Refresh Token: ${settings.linkedinRefreshToken ? 'Set' : 'Not set'}`);
    logger.info(`Organization ID: ${settings.linkedinOrganizationId || 'Not set'}`);
    logger.info(`Enabled: ${settings.linkedinEnabled}\n`);
    
    // The correct Organization ID from your LinkedIn URL
    const correctOrganizationId = '108162812';
    
    logger.info('🎯 Found Organization ID from LinkedIn URL:');
    logger.info(`Organization ID: ${correctOrganizationId}`);
    logger.info(`LinkedIn URL: https://www.linkedin.com/company/${correctOrganizationId}/admin/dashboard/\n`);
    
    // Update the Organization ID
    logger.info('💾 Updating LinkedIn Organization ID in database...');
    await Settings.updateCategorySettings('social-media', {
      linkedinOrganizationId: correctOrganizationId
    });
    
    logger.info('✅ Organization ID updated successfully!');
    
    // Test the configuration
    logger.info('\n🧪 Testing LinkedIn configuration...');
    const updatedSettings = await Settings.getCategorySettings('social-media');
    
    if (updatedSettings.linkedinOrganizationId === correctOrganizationId) {
      logger.info('✅ Organization ID is correctly set');
    } else {
      logger.info('❌ Organization ID update failed');
    }
    
    // Check if we have all required credentials
    const missingCredentials = [];
    if (!updatedSettings.linkedinClientId) missingCredentials.push('Client ID');
    if (!updatedSettings.linkedinClientSecret) missingCredentials.push('Client Secret');
    if (!updatedSettings.linkedinAccessToken) missingCredentials.push('Access Token');
    if (!updatedSettings.linkedinRefreshToken) missingCredentials.push('Refresh Token');
    
    if (missingCredentials.length > 0) {
      logger.info('\n⚠️  Missing LinkedIn credentials:');
      missingCredentials.forEach(cred => logger.info(`   - ${cred}`));
      logger.info('\n💡 You need to add these credentials to enable LinkedIn auto-posting');
    } else {
      logger.info('\n✅ All LinkedIn credentials are configured!');
      logger.info('🎉 LinkedIn auto-posting should now work correctly');
    }
    
    logger.info('\n📋 Next Steps:');
    logger.info('1. Go to: Admin → System → Auto-Posting → LinkedIn');
    logger.info('2. Verify Organization ID is set to: 108162812');
    logger.info('3. Add any missing credentials (Client ID, Client Secret, etc.)');
    logger.info('4. Test the connection');
    logger.info('5. Enable LinkedIn auto-posting');
    
  } catch (error) {
    logger.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

// Run the fix
fixLinkedInOrganization();
