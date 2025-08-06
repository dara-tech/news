import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Settings from './models/Settings.mjs';

dotenv.config();

const checkMaintenance = async () => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to database');

    // Get all general settings
    console.log('Getting general settings...');
    const settings = await Settings.getCategorySettings('general');
    console.log('All general settings:', JSON.stringify(settings, null, 2));
    
    // Check maintenance mode specifically
    console.log('Checking maintenance mode setting...');
    const maintenanceSetting = await Settings.findOne({ 
      category: 'general', 
      key: 'maintenanceMode' 
    });
    
    console.log('Maintenance mode setting:', maintenanceSetting);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    console.log('Disconnecting from database...');
    await mongoose.disconnect();
    console.log('Disconnected');
  }
};

checkMaintenance(); 