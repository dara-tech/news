// Test authentication state in browser
console.log('=== Auth Debug ===');

// Check localStorage
const userInfo = localStorage.getItem('userInfo');
console.log('User info in localStorage:', userInfo);

if (userInfo) {
  try {
    const user = JSON.parse(userInfo);
    console.log('Parsed user:', user);
    console.log('Has token:', !!user.token);
    console.log('Token preview:', user.token ? user.token.substring(0, 20) + '...' : 'No token');
  } catch (e) {
    console.error('Error parsing user info:', e);
  }
} else {
  console.log('No user info in localStorage');
}

// Check cookies
console.log('All cookies:', document.cookie);

// Test API call
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
console.log('API URL:', API_URL);

// Test like status endpoint
async function testLikeStatus() {
  try {
    const response = await fetch(`${API_URL}/api/likes/6888ce4fa505394887a39417/status`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      }
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const data = await response.json();
      console.log('Response data:', data);
    } else {
      const errorText = await response.text();
      console.log('Error response:', errorText);
    }
  } catch (error) {
    console.error('Fetch error:', error);
  }
}

// Run the test
testLikeStatus(); 