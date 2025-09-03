import dotenv from 'dotenv';
import mongoose from 'mongoose';
import News from './models/News.mjs';

dotenv.config();

async function findQueenslandArticle() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Search for articles with the specific content pattern
    const articles = await News.find({
      $or: [
        { 'content.en': { $regex: '```html', $options: 'i' } },
        { 'content.km': { $regex: '```html', $options: 'i' } },
        { 'content.en': { $regex: 'Queensland Crime Statistics', $options: 'i' } }
      ]
    }).select('title content.en content.km createdAt');
    
    console.log(`Found ${articles.length} articles with problematic content:`);
    articles.forEach(article => {
      console.log(`- ${article.title} (ID: ${article._id})`);
      console.log(`  Created: ${article.createdAt}`);
      if (article.content.en && article.content.en.includes('```html')) {
        console.log('  Has ```html in English content');
      }
      if (article.content.km && article.content.km.includes('```html')) {
        console.log('  Has ```html in Khmer content');
      }
    });
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

findQueenslandArticle();
