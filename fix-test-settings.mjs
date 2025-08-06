import fs from 'fs';

// Read the test file
const testFile = 'test-manual-features.mjs';
let content = fs.readFileSync(testFile, 'utf8');

// Define the complete settings object
const completeSettings = {
  siteName: 'NewsApps',
  siteDescription: 'Test description',
  siteUrl: '',
  adminEmail: '',
  contactEmail: '',
  allowRegistration: true,
  commentsEnabled: true,
  moderationRequired: false,
  analyticsEnabled: true,
  maintenanceMode: false
};

// Replace all settings objects with complete ones
const settingsPatterns = [
  // Pattern 1: Registration disable
  {
    old: `settings: {
      allowRegistration: false,
      commentsEnabled: true,
      moderationRequired: false,
      analyticsEnabled: true,
      maintenanceMode: false
    }`,
    new: `settings: {
      siteName: 'NewsApps',
      siteDescription: 'Test description',
      siteUrl: '',
      adminEmail: '',
      contactEmail: '',
      allowRegistration: false,
      commentsEnabled: true,
      moderationRequired: false,
      analyticsEnabled: true,
      maintenanceMode: false
    }`
  },
  // Pattern 2: Registration enable
  {
    old: `settings: {
      allowRegistration: true,
      commentsEnabled: true,
      moderationRequired: false,
      analyticsEnabled: true,
      maintenanceMode: false
    }`,
    new: `settings: {
      siteName: 'NewsApps',
      siteDescription: 'Test description',
      siteUrl: '',
      adminEmail: '',
      contactEmail: '',
      allowRegistration: true,
      commentsEnabled: true,
      moderationRequired: false,
      analyticsEnabled: true,
      maintenanceMode: false
    }`
  },
  // Pattern 3: Comments disable
  {
    old: `settings: {
      allowRegistration: true,
      commentsEnabled: false,
      moderationRequired: false,
      analyticsEnabled: true,
      maintenanceMode: false
    }`,
    new: `settings: {
      siteName: 'NewsApps',
      siteDescription: 'Test description',
      siteUrl: '',
      adminEmail: '',
      contactEmail: '',
      allowRegistration: true,
      commentsEnabled: false,
      moderationRequired: false,
      analyticsEnabled: true,
      maintenanceMode: false
    }`
  },
  // Pattern 4: Comments enable
  {
    old: `settings: {
      allowRegistration: true,
      commentsEnabled: true,
      moderationRequired: false,
      analyticsEnabled: true,
      maintenanceMode: false
    }`,
    new: `settings: {
      siteName: 'NewsApps',
      siteDescription: 'Test description',
      siteUrl: '',
      adminEmail: '',
      contactEmail: '',
      allowRegistration: true,
      commentsEnabled: true,
      moderationRequired: false,
      analyticsEnabled: true,
      maintenanceMode: false
    }`
  },
  // Pattern 5: Moderation enable
  {
    old: `settings: {
      allowRegistration: true,
      commentsEnabled: true,
      moderationRequired: true,
      analyticsEnabled: true,
      maintenanceMode: false
    }`,
    new: `settings: {
      siteName: 'NewsApps',
      siteDescription: 'Test description',
      siteUrl: '',
      adminEmail: '',
      contactEmail: '',
      allowRegistration: true,
      commentsEnabled: true,
      moderationRequired: true,
      analyticsEnabled: true,
      maintenanceMode: false
    }`
  },
  // Pattern 6: Maintenance enable
  {
    old: `settings: {
      allowRegistration: true,
      commentsEnabled: true,
      moderationRequired: false,
      analyticsEnabled: true,
      maintenanceMode: true
    }`,
    new: `settings: {
      siteName: 'NewsApps',
      siteDescription: 'Test description',
      siteUrl: '',
      adminEmail: '',
      contactEmail: '',
      allowRegistration: true,
      commentsEnabled: true,
      moderationRequired: false,
      analyticsEnabled: true,
      maintenanceMode: true
    }`
  },
  // Pattern 7: Maintenance disable
  {
    old: `settings: {
      allowRegistration: true,
      commentsEnabled: true,
      moderationRequired: false,
      analyticsEnabled: true,
      maintenanceMode: false
    }`,
    new: `settings: {
      siteName: 'NewsApps',
      siteDescription: 'Test description',
      siteUrl: '',
      adminEmail: '',
      contactEmail: '',
      allowRegistration: true,
      commentsEnabled: true,
      moderationRequired: false,
      analyticsEnabled: true,
      maintenanceMode: false
    }`
  }
];

// Apply all replacements
for (const pattern of settingsPatterns) {
  content = content.replace(pattern.old, pattern.new);
}

// Write the updated content back
fs.writeFileSync(testFile, content);

console.log('✅ Updated all settings objects in test-manual-features.mjs');
console.log('Now all settings updates include required fields'); 