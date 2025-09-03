import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Settings from '../models/Settings.mjs';
import logger from '../utils/logger.mjs';

// Load environment variables
dotenv.config();

const initializeSettings = async () => {
  try {
    // Connect to MongoDB
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    logger.info(`MongoDB Connected: ${conn.connection.host}`);

    // Check if settings already exist
    const settingsCount = await Settings.countDocuments();
    
    if (settingsCount === 0) {
      logger.info('No settings found. Initializing default settings...');
      await Settings.initializeDefaults();
      logger.info('✅ Default settings initialized successfully');
    } else {
      logger.info(`Found ${settingsCount} existing settings. Skipping initialization.`);
    }

    // Display current settings
    logger.info('\n📋 Current Settings:');
    
    const categories = ['general', 'security', 'integrations'];
    for (const category of categories) {
      logger.info(`\n--- ${category.toUpperCase()} SETTINGS ---`);
      const settings = await Settings.getCategorySettings(category);
      Object.entries(settings).forEach(([key, value]) => {
        logger.info(`${key}: ${value}`);
      });
    }

    logger.info('\n✅ Settings migration completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('❌ Error during settings migration:', error);
    process.exit(1);
  }
};

// Run the migration
initializeSettings(); 