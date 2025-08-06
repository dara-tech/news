import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Settings from '../models/Settings.mjs';

// Load environment variables
dotenv.config();

const initializeSettings = async () => {
  try {
    // Connect to MongoDB
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Check if settings already exist
    const settingsCount = await Settings.countDocuments();
    
    if (settingsCount === 0) {
      console.log('No settings found. Initializing default settings...');
      await Settings.initializeDefaults();
      console.log('✅ Default settings initialized successfully');
    } else {
      console.log(`Found ${settingsCount} existing settings. Skipping initialization.`);
    }

    // Display current settings
    console.log('\n📋 Current Settings:');
    
    const categories = ['general', 'security', 'integrations'];
    for (const category of categories) {
      console.log(`\n--- ${category.toUpperCase()} SETTINGS ---`);
      const settings = await Settings.getCategorySettings(category);
      Object.entries(settings).forEach(([key, value]) => {
        console.log(`${key}: ${value}`);
      });
    }

    console.log('\n✅ Settings migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during settings migration:', error);
    process.exit(1);
  }
};

// Run the migration
initializeSettings(); 