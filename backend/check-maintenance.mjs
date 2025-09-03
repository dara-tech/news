import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Settings from './models/Settings.mjs';
import logger from '../utils/logger.mjs';

dotenv.config();

const checkMaintenance = async () => {
  try {
    logger.info('Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI);
    logger.info('Connected to database');

    // Get all general settings
    logger.info('Getting general settings...');
    const settings = await Settings.getCategorySettings('general');
    logger.info('All general settings:', JSON.stringify(settings, null, 2));
    
    // Check maintenance mode specifically
    logger.info('Checking maintenance mode setting...');
    const maintenanceSetting = await Settings.findOne({ 
      category: 'general', 
      key: 'maintenanceMode' 
    });
    
    logger.info('Maintenance mode setting:', maintenanceSetting);
    
  } catch (error) {
    logger.error('Error:', error);
  } finally {
    logger.info('Disconnecting from database...');
    await mongoose.disconnect();
    logger.info('Disconnected');
  }
};

checkMaintenance(); 