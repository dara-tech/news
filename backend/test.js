import axios from 'axios';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import News from './models/News.js';

dotenv.config();

const API_URL = 'http://localhost:5001/api';

const testUpdate = async () => {
  try {
    // 1. Login as Super Admin
    console.log('--- Logging in as superadmin@example.com ---');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'superadmin@example.com',
      password: 'password123',
    });

    const cookie = loginResponse.headers['set-cookie'][0];
    console.log('--- Login successful, received cookie ---');

    // 2. Create a new article
    console.log('\n--- Creating a new article ---');
    const createPayload = {
      title: { en: 'Test Article', kh: 'Test Article KH' },
      content: { en: 'Test Content', kh: 'Test Content KH' },
      description: { en: 'Test Description', kh: 'Test Description KH' },
      category: 'technology',
      thumbnailUrl: 'http://example.com/thumbnail.jpg' // Placeholder
    };

    const createResponse = await axios.post(`${API_URL}/news`, createPayload, {
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookie,
      },
    });
    const newArticleId = createResponse.data._id;
    console.log(`--- Article created successfully! ID: ${newArticleId} ---`);

    // 3. Update the newly created article
    console.log(`\n--- Sending update request for article ID: ${newArticleId} ---`);
    const updatePayload = {
      title: { en: `Updated by test.js at ${new Date().toLocaleTimeString()}` },
      status: 'published',
    };

    const updateResponse = await axios.put(`${API_URL}/news/${newArticleId}`, updatePayload, {
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookie,
      },
    });

    console.log('\n--- Update successful! ---');
    console.log('Response Status:', updateResponse.status);
    console.log('Updated Article Title:', updateResponse.data.title.en);
    console.log('--------------------------');

    process.exit(0);
  } catch (error) {
    console.error('\n--- Test Failed! ---');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
    console.log('--------------------');
    process.exit(1);
  }
};

testUpdate();
