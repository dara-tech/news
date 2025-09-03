import fetch from 'node-fetch';
import logger from '../utils/logger.mjs';

const testLoginActivity = async () => {
  logger.info('🧪 Testing Login Activity Logging...\n');

  try {
    // Test login
    logger.info('1️⃣ Attempting login...');
    const loginResponse = await fetch('http://localhost:5001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@example.com', // Replace with actual admin email
        password: 'password123'     // Replace with actual password
      })
    });

    const loginResult = await loginResponse.json();
    
    if (loginResponse.ok) {
      logger.info('✅ Login successful for:', loginResult.username);
    } else {
      logger.info('❌ Login failed:', loginResult.message);
    }

    // Wait a bit for the activity to be logged
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Check activity logs
    logger.info('\n2️⃣ Checking recent activity logs...');
    const activityResponse = await fetch('http://localhost:5001/api/admin/activity?limit=5', {
      headers: {
        'Authorization': `Bearer ${loginResult.token}`,
      }
    });

    if (activityResponse.status === 401) {
      logger.info('⚠️  Activity endpoint requires authentication');
      logger.info('💡 Login activity should still be logged in database');
    } else {
      const activityResult = await activityResponse.json();
      logger.info('📊 Recent activities:', activityResult);
    }

  } catch (error) {
    logger.error('❌ Test error:', error.message);
  }
};

testLoginActivity();