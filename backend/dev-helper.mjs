import dotenv from 'dotenv';
dotenv.config();
import connectDB from './config/db.mjs';
import Settings from './models/Settings.mjs';

async function devHelper() {
  try {
    console.log('🔧 Development Helper');
    console.log('====================');
    
    await connectDB();
    
    // Check current maintenance mode
    const settings = await Settings.getCategorySettings('general');
    console.log(`\n📊 Current Settings:`);
    console.log(`   Maintenance Mode: ${settings.maintenanceMode ? '🟡 ENABLED' : '🟢 DISABLED'}`);
    console.log(`   Site Name: ${settings.siteName || 'Not set'}`);
    console.log(`   Allow Registration: ${settings.allowRegistration ? 'Yes' : 'No'}`);
    
    console.log('\n🛠️  Available Commands:');
    console.log('   1. Enable maintenance mode');
    console.log('   2. Disable maintenance mode');
    console.log('   3. Check maintenance status');
    console.log('   4. Exit');
    
    // For now, just show the status
    console.log('\n💡 Tip: Use these commands to manage maintenance mode:');
    console.log('   node disable-maintenance.mjs  - Disable maintenance mode');
    console.log('   node check-maintenance.mjs    - Check current status');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

devHelper(); 