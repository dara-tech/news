import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Error connecting to database:', error);
    process.exit(1);
  }
};

const testPublicEndpoint = async () => {
  const newsId = '6888ce4fa505394887a39417';
  
  try {
    const response = await fetch(`http://localhost:5000/api/likes/${newsId}/count`);
    const data = await response.json();
    
    console.log('Response status:', response.status);
    console.log('Response data:', data);
    
    if (response.ok) {
      console.log('✅ Public count endpoint working correctly!');
      console.log(`Like count: ${data.count}`);
    } else {
      console.log('❌ Public count endpoint failed');
    }
  } catch (error) {
    console.error('Error testing public endpoint:', error);
  }
  
  process.exit(0);
};

testPublicEndpoint(); 