import dotenv from 'dotenv';
import mongoose from 'mongoose';
import News from './models/News.mjs';

dotenv.config();

async function checkKhmerContent() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Search for articles with Khmer content containing markdown blocks
    const articles = await News.find({
      'content.km': { $regex: '```html', $options: 'i' }
    }).select('title content.km createdAt');
    
    console.log(`Found ${articles.length} articles with Khmer content containing markdown blocks:`);
    articles.forEach(article => {
      console.log(`- ${article.title.en || article.title} (ID: ${article._id})`);
      console.log(`  Created: ${article.createdAt}`);
      if (article.content.km && article.content.km.includes('```html')) {
        console.log('  Has ```html in Khmer content');
      }
    });
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkKhmerContent();
