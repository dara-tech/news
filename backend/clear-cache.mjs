import dotenv from 'dotenv';
dotenv.config();
import connectDB from './config/db.mjs';
import Settings from './models/Settings.mjs';
import logger from '../utils/logger.mjs';

async function clearCache() {
  try {
    logger.info('Connecting to database...');
    await connectDB();
    
    logger.info('Clearing settings cache...');
    // Force a fresh fetch from database
    const settings = await Settings.getCategorySettings('general');
    logger.info('Current maintenance mode:', settings.maintenanceMode);
    
    logger.info('Cache cleared successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Error clearing cache:', error);
    process.exit(1);
  }
}

clearCache(); 