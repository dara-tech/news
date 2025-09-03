import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Settings from './models/Settings.mjs';
import logger from '../utils/logger.mjs';

dotenv.config();

const disableMaintenance = async () => {
  try {
    logger.info('Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI);
    logger.info('Connected to database');

    // Update maintenance mode to false
    logger.info('Updating maintenance mode to false...');
    await Settings.updateOne(
      { category: 'general', key: 'maintenanceMode' },
      { 
        value: false,
        updatedAt: new Date(),
        updatedBy: new mongoose.Types.ObjectId('687362dbfcd8692cef0917df')
      }
    );

    logger.info('✅ Maintenance mode disabled');
    
    // Verify the change
    const settings = await Settings.getCategorySettings('general');
    logger.info('Current maintenance mode:', settings.maintenanceMode);
    
  } catch (error) {
    logger.error('Error:', error);
  } finally {
    logger.info('Disconnecting from database...');
    await mongoose.disconnect();
    logger.info('Disconnected');
  }
};

disableMaintenance(); 