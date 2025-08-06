import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Settings from './backend/models/Settings.mjs';

dotenv.config();

const checkMaintenance = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to database');

    // Get all general settings
    const settings = await Settings.getCategorySettings('general');
    console.log('All general settings:', settings);
    
    // Check maintenance mode specifically
    const maintenanceSetting = await Settings.findOne({ 
      category: 'general', 
      key: 'maintenanceMode' 
    });
    
    console.log('Maintenance mode setting:', maintenanceSetting);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
};

checkMaintenance(); 