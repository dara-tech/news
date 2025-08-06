import dotenv from 'dotenv';
dotenv.config();
import connectDB from './config/db.mjs';
import Settings from './models/Settings.mjs';

async function quickDev() {
  try {
    console.log('🚀 Quick Development Setup');
    console.log('==========================');
    
    await connectDB();
    
    // Disable maintenance mode for development
    await Settings.updateCategorySettings('general', { 
      maintenanceMode: false 
    }, '000000000000000000000000');
    
    console.log('✅ Maintenance mode disabled for development');
    console.log('✅ You can now access the site normally');
    console.log('\n💡 To enable maintenance mode:');
    console.log('   - Go to Admin → Settings → General');
    console.log('   - Toggle "Maintenance Mode" to ON');
    console.log('   - Save settings');
    
    console.log('\n🔧 Development Tips:');
    console.log('   - Use "npm run dev" to start the server');
    console.log('   - Login as admin to access admin panel');
    console.log('   - Test maintenance mode from admin settings');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

quickDev(); 