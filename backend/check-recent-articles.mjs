import dotenv from 'dotenv';
import mongoose from 'mongoose';
import News from './models/News.mjs';

dotenv.config();

async function checkRecentArticles() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Get the 5 most recent articles
    const recentArticles = await News.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title content.en content.km createdAt');
    
    console.log('5 most recent articles:');
    recentArticles.forEach((article, index) => {
      console.log(`${index + 1}. ${article.title.en || article.title}`);
      console.log(`   Created: ${article.createdAt}`);
      console.log(`   Has markdown blocks in EN: ${article.content.en ? article.content.en.includes('```html') : false}`);
      console.log(`   Has markdown blocks in KM: ${article.content.km ? article.content.km.includes('```html') : false}`);
      console.log('');
    });
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkRecentArticles();
