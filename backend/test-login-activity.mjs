import fetch from 'node-fetch';

const testLoginActivity = async () => {
  console.log('🧪 Testing Login Activity Logging...\n');

  try {
    // Test login
    console.log('1️⃣ Attempting login...');
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
      console.log('✅ Login successful for:', loginResult.username);
    } else {
      console.log('❌ Login failed:', loginResult.message);
    }

    // Wait a bit for the activity to be logged
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Check activity logs
    console.log('\n2️⃣ Checking recent activity logs...');
    const activityResponse = await fetch('http://localhost:5001/api/admin/activity?limit=5', {
      headers: {
        'Authorization': `Bearer ${loginResult.token}`,
      }
    });

    if (activityResponse.status === 401) {
      console.log('⚠️  Activity endpoint requires authentication');
      console.log('💡 Login activity should still be logged in database');
    } else {
      const activityResult = await activityResponse.json();
      console.log('📊 Recent activities:', activityResult);
    }

  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
};

testLoginActivity();