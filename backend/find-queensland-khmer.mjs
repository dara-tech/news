import dotenv from 'dotenv';
import mongoose from 'mongoose';
import News from './models/News.mjs';

dotenv.config();

async function findQueenslandKhmer() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Search for articles with the specific Khmer text
    const articles = await News.find({
      'content.km': { $regex: 'ស្ថិតិឧក្រិដ្ឋកម្មរបស់រដ្ឋ Queensland', $options: 'i' }
    }).select('title content.km createdAt');
    
    console.log(`Found ${articles.length} articles with Queensland Khmer content:`);
    articles.forEach(article => {
      console.log(`- ${article.title.en || article.title} (ID: ${article._id})`);
      console.log(`  Created: ${article.createdAt}`);
      if (article.content.km) {
        console.log('  Khmer content preview (first 200 chars):');
        console.log(article.content.km.substring(0, 200));
        console.log('  ...');
        console.log('  Has ```html:', article.content.km.includes('```html'));
        console.log('  Has ផ្ទៃខាងក្រោយ:', article.content.km.includes('ផ្ទៃខាងក្រោយ'));
      }
    });
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

findQueenslandKhmer();
