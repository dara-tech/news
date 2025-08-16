import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Settings from './models/Settings.mjs';

dotenv.config();

async function fixLinkedInOrganization() {
  console.log('🔗 LinkedIn Organization ID Fix Tool');
  console.log('====================================\n');
  
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Get current settings
    const settings = await Settings.getCategorySettings('social-media');
    console.log('📋 Current LinkedIn Configuration:');
    console.log(`Client ID: ${settings.linkedinClientId || 'Not set'}`);
    console.log(`Client Secret: ${settings.linkedinClientSecret ? 'Set' : 'Not set'}`);
    console.log(`Access Token: ${settings.linkedinAccessToken ? 'Set' : 'Not set'}`);
    console.log(`Refresh Token: ${settings.linkedinRefreshToken ? 'Set' : 'Not set'}`);
    console.log(`Organization ID: ${settings.linkedinOrganizationId || 'Not set'}`);
    console.log(`Enabled: ${settings.linkedinEnabled}\n`);
    
    // The correct Organization ID from your LinkedIn URL
    const correctOrganizationId = '108162812';
    
    console.log('🎯 Found Organization ID from LinkedIn URL:');
    console.log(`Organization ID: ${correctOrganizationId}`);
    console.log(`LinkedIn URL: https://www.linkedin.com/company/${correctOrganizationId}/admin/dashboard/\n`);
    
    // Update the Organization ID
    console.log('💾 Updating LinkedIn Organization ID in database...');
    await Settings.updateCategorySettings('social-media', {
      linkedinOrganizationId: correctOrganizationId
    });
    
    console.log('✅ Organization ID updated successfully!');
    
    // Test the configuration
    console.log('\n🧪 Testing LinkedIn configuration...');
    const updatedSettings = await Settings.getCategorySettings('social-media');
    
    if (updatedSettings.linkedinOrganizationId === correctOrganizationId) {
      console.log('✅ Organization ID is correctly set');
    } else {
      console.log('❌ Organization ID update failed');
    }
    
    // Check if we have all required credentials
    const missingCredentials = [];
    if (!updatedSettings.linkedinClientId) missingCredentials.push('Client ID');
    if (!updatedSettings.linkedinClientSecret) missingCredentials.push('Client Secret');
    if (!updatedSettings.linkedinAccessToken) missingCredentials.push('Access Token');
    if (!updatedSettings.linkedinRefreshToken) missingCredentials.push('Refresh Token');
    
    if (missingCredentials.length > 0) {
      console.log('\n⚠️  Missing LinkedIn credentials:');
      missingCredentials.forEach(cred => console.log(`   - ${cred}`));
      console.log('\n💡 You need to add these credentials to enable LinkedIn auto-posting');
    } else {
      console.log('\n✅ All LinkedIn credentials are configured!');
      console.log('🎉 LinkedIn auto-posting should now work correctly');
    }
    
    console.log('\n📋 Next Steps:');
    console.log('1. Go to: Admin → System → Auto-Posting → LinkedIn');
    console.log('2. Verify Organization ID is set to: 108162812');
    console.log('3. Add any missing credentials (Client ID, Client Secret, etc.)');
    console.log('4. Test the connection');
    console.log('5. Enable LinkedIn auto-posting');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

// Run the fix
fixLinkedInOrganization();
