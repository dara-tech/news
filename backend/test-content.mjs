import mongoose from 'mongoose';
import News from './models/News.mjs';
import dotenv from 'dotenv';

dotenv.config();

async function testContent() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/news-app');
    
    const articles = await News.find({}).limit(3);
    console.log('Sample content:');
    
    articles.forEach((article, i) => {
      console.log(`Article ${i+1}:`);
      console.log('EN:', article.content.en?.substring(0, 200));
      console.log('KH:', article.content.kh?.substring(0, 200));
      console.log('---');
    });
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

testContent();
