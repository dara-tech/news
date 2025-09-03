import axios from 'axios';
import logger from '../utils/logger.mjs';

const testUnauthEndpoint = async () => {
  try {
    const API_URL = 'http://localhost:5001';
    const newsId = '6888ce4fa505394887a39417';

    logger.info('Testing unauthenticated request to:', `${API_URL}/api/likes/${newsId}/status`);

    const response = await axios.get(`${API_URL}/api/likes/${newsId}/status`, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    logger.info('Response status:', response.status);
    logger.info('Response data:', response.data);

  } catch (error) {
    logger.info('Expected error - Response status:', error.response?.status);
    logger.info('Response data:', error.response?.data);
    
    if (error.response?.status === 401) {
      logger.info('✅ SUCCESS: Correctly returned 401 for unauthenticated request');
    } else {
      logger.info('❌ FAILED: Expected 401 but got', error.response?.status);
    }
  }
};

testUnauthEndpoint(); 