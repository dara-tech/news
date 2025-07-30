import axios from 'axios';

const testUnauthEndpoint = async () => {
  try {
    const API_URL = 'http://localhost:5001';
    const newsId = '6888ce4fa505394887a39417';

    console.log('Testing unauthenticated request to:', `${API_URL}/api/likes/${newsId}/status`);

    const response = await axios.get(`${API_URL}/api/likes/${newsId}/status`, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('Response status:', response.status);
    console.log('Response data:', response.data);

  } catch (error) {
    console.log('Expected error - Response status:', error.response?.status);
    console.log('Response data:', error.response?.data);
    
    if (error.response?.status === 401) {
      console.log('✅ SUCCESS: Correctly returned 401 for unauthenticated request');
    } else {
      console.log('❌ FAILED: Expected 401 but got', error.response?.status);
    }
  }
};

testUnauthEndpoint(); 