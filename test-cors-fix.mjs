import axios from 'axios';

async function testCORS() {
  console.log('🧪 Testing CORS Configuration...\n');

  const testOrigins = [
    'https://www.razewire.online',
    'http://localhost:3000',
    'https://news-vzdx.onrender.com'
  ];

  const apiUrl = 'https://news-vzdx.onrender.com';

  for (const origin of testOrigins) {
    console.log(`Testing origin: ${origin}`);
    
    try {
      // Test OPTIONS preflight request
      const preflightResponse = await axios.options(`${apiUrl}/api/categories`, {
        headers: {
          'Origin': origin,
          'Access-Control-Request-Method': 'GET',
          'Access-Control-Request-Headers': 'Content-Type, Authorization'
        },
        timeout: 5000
      });

      console.log(`✅ Preflight successful for ${origin}`);
      console.log(`   Status: ${preflightResponse.status}`);
      console.log(`   CORS Headers:`, {
        'Access-Control-Allow-Origin': preflightResponse.headers['access-control-allow-origin'],
        'Access-Control-Allow-Methods': preflightResponse.headers['access-control-allow-methods'],
        'Access-Control-Allow-Headers': preflightResponse.headers['access-control-allow-headers'],
        'Access-Control-Allow-Credentials': preflightResponse.headers['access-control-allow-credentials']
      });

    } catch (error) {
      console.log(`❌ Preflight failed for ${origin}:`, error.message);
      if (error.response) {
        console.log(`   Status: ${error.response.status}`);
        console.log(`   Headers:`, error.response.headers);
      }
    }

    console.log('');
  }

  // Test actual API call
  console.log('Testing actual API call from Razewire domain...');
  try {
    const response = await axios.get(`${apiUrl}/api/categories?lang=en`, {
      headers: {
        'Origin': 'https://www.razewire.online',
        'Content-Type': 'application/json'
      },
      timeout: 5000
    });

    console.log('✅ API call successful');
    console.log(`   Status: ${response.status}`);
    console.log(`   Data received: ${response.data ? 'Yes' : 'No'}`);

  } catch (error) {
    console.log('❌ API call failed:', error.message);
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Data:`, error.response.data);
    }
  }

  console.log('\n📝 Environment Variables to Check:');
  console.log('Frontend (.env.local):');
  console.log('  NEXT_PUBLIC_API_URL=https://news-vzdx.onrender.com');
  console.log('  NEXT_PUBLIC_SITE_URL=https://www.razewire.online');
  
  console.log('\nBackend (.env):');
  console.log('  CORS_ORIGINS=https://www.razewire.online,http://localhost:3000');
  console.log('  NODE_ENV=production');
}

// Run the test
testCORS();
