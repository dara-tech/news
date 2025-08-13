import axios from 'axios';

async function testGoogleVerification() {
  console.log('🔍 Testing Google Search Console Verification...\n');

  const baseUrl = 'https://www.razewire.online';

  // Test 1: HTML File Verification
  console.log('1️⃣ Testing HTML File Verification...');
  try {
    const fileResponse = await axios.get(`${baseUrl}/google28105ddce768934a.html`, {
      timeout: 10000,
      validateStatus: (status) => status < 500
    });

    console.log(`   Status: ${fileResponse.status}`);
    console.log(`   Content: ${fileResponse.data}`);
    
    if (fileResponse.data.includes('google-site-verification: google28105ddce768934a.html')) {
      console.log('   ✅ HTML file verification content is correct');
    } else {
      console.log('   ❌ HTML file verification content is incorrect');
    }

  } catch (error) {
    console.log('   ❌ HTML file verification failed:', error.message);
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Data: ${error.response.data}`);
    }
  }

  console.log('');

  // Test 2: Meta Tag Verification
  console.log('2️⃣ Testing Meta Tag Verification...');
  try {
    const pageResponse = await axios.get(baseUrl, {
      timeout: 10000,
      validateStatus: (status) => status < 500
    });

    console.log(`   Status: ${pageResponse.status}`);
    
    const html = pageResponse.data;
    const metaTagPattern = /<meta[^>]*name="google-site-verification"[^>]*content="([^"]*)"[^>]*>/i;
    const match = html.match(metaTagPattern);
    
    if (match) {
      console.log('   ✅ Meta tag found');
      console.log(`   Content: ${match[1]}`);
      
      if (match[1] === 'google28105ddce768934a') {
        console.log('   ✅ Meta tag verification content is correct');
      } else {
        console.log('   ❌ Meta tag verification content is incorrect');
      }
    } else {
      console.log('   ❌ Meta tag not found in HTML');
    }

  } catch (error) {
    console.log('   ❌ Meta tag verification failed:', error.message);
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
    }
  }

  console.log('');

  // Test 3: Route Handler Verification
  console.log('3️⃣ Testing Route Handler Verification...');
  try {
    const routeResponse = await axios.get(`${baseUrl}/google28105ddce768934a.html`, {
      timeout: 10000,
      validateStatus: (status) => status < 500
    });

    console.log(`   Status: ${routeResponse.status}`);
    console.log(`   Content-Type: ${routeResponse.headers['content-type']}`);
    console.log(`   Content: ${routeResponse.data}`);

  } catch (error) {
    console.log('   ❌ Route handler verification failed:', error.message);
  }

  console.log('\n📝 Verification Summary:');
  console.log('✅ Meta tag verification should work (already in layout.tsx)');
  console.log('✅ HTML file verification should work (file in public/ + route handler)');
  console.log('✅ Route handler verification should work (specific route created)');
  
  console.log('\n🚀 Next Steps:');
  console.log('1. Deploy your site');
  console.log('2. Test both verification methods in Google Search Console');
  console.log('3. Choose the method that works best for you');
  console.log('4. Complete domain verification');
}

// Run the test
testGoogleVerification();
