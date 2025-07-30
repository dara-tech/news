// Test authentication state in browser
console.log('=== Auth State Test ===');

// Check localStorage
const userInfo = localStorage.getItem('userInfo');
console.log('User info in localStorage:', userInfo);

if (userInfo) {
  try {
    const user = JSON.parse(userInfo);
    console.log('Parsed user:', user);
    console.log('Has token:', !!user.token);
    console.log('Token preview:', user.token ? user.token.substring(0, 20) + '...' : 'No token');
    console.log('User ID:', user._id);
    console.log('Username:', user.username);
    console.log('Email:', user.email);
  } catch (e) {
    console.error('Error parsing user info:', e);
  }
} else {
  console.log('No user info in localStorage - user not logged in');
}

// Check cookies
console.log('All cookies:', document.cookie);

// Test if user is logged in by making a simple API call
async function testAuth() {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
    console.log('Testing auth with API URL:', API_URL);
    
    const response = await fetch(`${API_URL}/api/auth/profile`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      }
    });
    
    console.log('Auth test response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Auth test response data:', data);
    } else {
      const errorText = await response.text();
      console.log('Auth test error:', errorText);
    }
  } catch (error) {
    console.error('Auth test error:', error);
  }
}

// Run the test
testAuth(); 