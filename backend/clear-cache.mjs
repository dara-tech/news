import dotenv from 'dotenv';
dotenv.config();
import connectDB from './config/db.mjs';
import Settings from './models/Settings.mjs';

async function clearCache() {
  try {
    console.log('Connecting to database...');
    await connectDB();
    
    console.log('Clearing settings cache...');
    // Force a fresh fetch from database
    const settings = await Settings.getCategorySettings('general');
    console.log('Current maintenance mode:', settings.maintenanceMode);
    
    console.log('Cache cleared successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error clearing cache:', error);
    process.exit(1);
  }
}

clearCache(); 