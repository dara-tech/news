import dotenv from 'dotenv';
dotenv.config();
import connectDB from './config/db.mjs';
import Settings from './models/Settings.mjs';
import logger from '../utils/logger.mjs';

async function devHelper() {
  try {
    logger.info('🔧 Development Helper');
    logger.info('====================');
    
    await connectDB();
    
    // Check current maintenance mode
    const settings = await Settings.getCategorySettings('general');
    logger.info(`\n📊 Current Settings:`);
    logger.info(`   Maintenance Mode: ${settings.maintenanceMode ? '🟡 ENABLED' : '🟢 DISABLED'}`);
    logger.info(`   Site Name: ${settings.siteName || 'Not set'}`);
    logger.info(`   Allow Registration: ${settings.allowRegistration ? 'Yes' : 'No'}`);
    
    logger.info('\n🛠️  Available Commands:');
    logger.info('   1. Enable maintenance mode');
    logger.info('   2. Disable maintenance mode');
    logger.info('   3. Check maintenance status');
    logger.info('   4. Exit');
    
    // For now, just show the status
    logger.info('\n💡 Tip: Use these commands to manage maintenance mode:');
    logger.info('   node disable-maintenance.mjs  - Disable maintenance mode');
    logger.info('   node check-maintenance.mjs    - Check current status');
    
    process.exit(0);
  } catch (error) {
    logger.error('Error:', error);
    process.exit(1);
  }
}

devHelper(); 