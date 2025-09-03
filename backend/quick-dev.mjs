import dotenv from 'dotenv';
dotenv.config();
import connectDB from './config/db.mjs';
import Settings from './models/Settings.mjs';
import logger from '../utils/logger.mjs';

async function quickDev() {
  try {
    logger.info('🚀 Quick Development Setup');
    logger.info('==========================');
    
    await connectDB();
    
    // Disable maintenance mode for development
    await Settings.updateCategorySettings('general', { 
      maintenanceMode: false 
    }, '000000000000000000000000');
    
    logger.info('✅ Maintenance mode disabled for development');
    logger.info('✅ You can now access the site normally');
    logger.info('\n💡 To enable maintenance mode:');
    logger.info('   - Go to Admin → Settings → General');
    logger.info('   - Toggle "Maintenance Mode" to ON');
    logger.info('   - Save settings');
    
    logger.info('\n🔧 Development Tips:');
    logger.info('   - Use "npm run dev" to start the server');
    logger.info('   - Login as admin to access admin panel');
    logger.info('   - Test maintenance mode from admin settings');
    
    process.exit(0);
  } catch (error) {
    logger.error('Error:', error);
    process.exit(1);
  }
}

quickDev(); 