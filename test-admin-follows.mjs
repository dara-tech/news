import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5001/api';

// Test admin follow management endpoints
async function testAdminFollows() {
  console.log('🧪 Testing Admin Follow Management...\n');

  try {
    // Test 1: Get all follows (requires admin auth)
    console.log('1️⃣ Testing GET /api/admin/follows');
    const followsResponse = await fetch(`${BASE_URL}/admin/follows`);
    console.log('Status:', followsResponse.status);
    if (followsResponse.ok) {
      const followsData = await followsResponse.json();
      console.log('✅ Follows data:', followsData.data?.length || 0, 'follows found');
    } else {
      console.log('❌ Failed to get follows:', followsResponse.statusText);
    }

    // Test 2: Get follow statistics
    console.log('\n2️⃣ Testing GET /api/admin/follows/stats/overview');
    const statsResponse = await fetch(`${BASE_URL}/admin/follows/stats/overview`);
    console.log('Status:', statsResponse.status);
    if (statsResponse.ok) {
      const statsData = await statsResponse.json();
      console.log('✅ Stats data:', statsData.data);
    } else {
      console.log('❌ Failed to get stats:', statsResponse.statusText);
    }

    // Test 3: Test follow relationship operations (if we have a follow ID)
    console.log('\n3️⃣ Testing follow relationship operations...');
    const testFollowId = 'test-follow-id'; // This would be a real follow ID
    
    // Test delete follow
    const deleteResponse = await fetch(`${BASE_URL}/admin/follows/${testFollowId}`, {
      method: 'DELETE'
    });
    console.log('Delete follow status:', deleteResponse.status);

    // Test update follow status
    const updateResponse = await fetch(`${BASE_URL}/admin/follows/${testFollowId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status: 'suspended' })
    });
    console.log('Update follow status:', updateResponse.status);

    console.log('\n✅ Admin follow management tests completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the tests
testAdminFollows(); 