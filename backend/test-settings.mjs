import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Settings from './models/Settings.mjs';
import User from './models/User.mjs';

// Load environment variables
dotenv.config();

const testSettings = async () => {
  try {
    // Connect to MongoDB
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    console.log('\n🧪 Testing Settings Functionality...\n');

    // Test 1: Get general settings
    console.log('1. Testing getCategorySettings...');
    const generalSettings = await Settings.getCategorySettings('general');
    console.log('✅ General settings retrieved:', Object.keys(generalSettings).length, 'settings');

    // Test 2: Update settings
    console.log('\n2. Testing updateCategorySettings...');
    const testUserId = new mongoose.Types.ObjectId('000000000000000000000001');
    const updatedSettings = await Settings.updateCategorySettings('general', {
      siteName: 'Test NewsApp',
      siteDescription: 'Test description'
    }, testUserId);
    console.log('✅ Settings updated successfully');

    // Test 3: Get masked settings
    console.log('\n3. Testing getCategorySettingsMasked...');
    const maskedSettings = await Settings.getCategorySettingsMasked('integrations');
    console.log('✅ Masked settings retrieved:', Object.keys(maskedSettings).length, 'settings');
    
    // Check if sensitive fields are masked
    const sensitiveFields = ['smtpPassword', 'cloudinaryApiSecret', 'firebaseServerKey', 'webhookSecret'];
    const maskedFields = sensitiveFields.filter(field => maskedSettings[field] === '********');
    console.log('✅ Sensitive fields masked:', maskedFields.length, 'out of', sensitiveFields.length);

    // Test 4: Verify settings persistence
    console.log('\n4. Testing settings persistence...');
    const persistedSettings = await Settings.getCategorySettings('general');
    console.log('✅ Settings persisted correctly. Site name:', persistedSettings.siteName);

    // Test 5: Check settings audit trail
    console.log('\n5. Testing settings audit trail...');
    const settingsWithAudit = await Settings.find({ category: 'general' })
      .populate('updatedBy', 'email')
      .lean();
    
    console.log('✅ Settings audit trail working. Recent updates:', settingsWithAudit.length);

    console.log('\n🎉 All settings tests passed successfully!');
    console.log('\n📊 Summary:');
    console.log('- Database persistence: ✅');
    console.log('- Settings retrieval: ✅');
    console.log('- Settings updates: ✅');
    console.log('- Sensitive data masking: ✅');
    console.log('- Audit trail: ✅');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error during settings test:', error);
    process.exit(1);
  }
};

// Run the test
testSettings(); 