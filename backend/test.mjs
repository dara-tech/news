import axios from 'axios';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from "./config/db.mjs";
import News from "./models/News.mjs";

dotenv.config();

const API_URL = 'http://localhost:5001/api';

const testUpdate = async () => {
  try {
    // 1. Login as Super Admin
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'superadmin@example.com',
      password: 'password123',
    });

    const cookie = loginResponse.headers['set-cookie'][0];

    // 2. Create a new article
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

    // 3. Update the newly created article
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


    process.exit(0);
  } catch (error) {
    if (error.response) {
    } else {
    }
    process.exit(1);
  }
};

testUpdate();
