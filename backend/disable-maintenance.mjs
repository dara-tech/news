import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Settings from './models/Settings.mjs';

dotenv.config();

const disableMaintenance = async () => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to database');

    // Update maintenance mode to false
    console.log('Updating maintenance mode to false...');
    await Settings.updateOne(
      { category: 'general', key: 'maintenanceMode' },
      { 
        value: false,
        updatedAt: new Date(),
        updatedBy: new mongoose.Types.ObjectId('687362dbfcd8692cef0917df')
      }
    );

    console.log('✅ Maintenance mode disabled');
    
    // Verify the change
    const settings = await Settings.getCategorySettings('general');
    console.log('Current maintenance mode:', settings.maintenanceMode);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    console.log('Disconnecting from database...');
    await mongoose.disconnect();
    console.log('Disconnected');
  }
};

disableMaintenance(); 