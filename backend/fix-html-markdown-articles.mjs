import dotenv from 'dotenv';
import mongoose from 'mongoose';
import News from './models/News.mjs';
import { cleanContent } from './utils/contentCleaner.mjs';
import { formatContentAdvanced } from './utils/advancedContentFormatter.mjs';

dotenv.config();

async function fixHtmlMarkdownArticles() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    console.log('Starting fix for articles with ```html markdown blocks...');
    
    // Find articles with ```html markdown blocks
    const articles = await News.find({
      $or: [
        { 'content.en': { $regex: '```html', $options: 'i' } },
        { 'content.km': { $regex: '```html', $options: 'i' } }
      ]
    });
    
    console.log(`Found ${articles.length} articles with markdown code blocks`);
    
    let fixedCount = 0;
    
    for (const article of articles) {
      console.log(`\nFixing article: ${article.title.en || article.title}`);
      
      let needsUpdate = false;
      
      // Fix English content
      if (article.content.en && article.content.en.includes('```html')) {
        console.log('  Fixing English content...');
        const cleanedEn = cleanContent(article.content.en);
        const formattedEn = formatContentAdvanced(cleanedEn);
        article.content.en = formattedEn;
        needsUpdate = true;
        console.log('  ✅ English content cleaned and formatted');
      }
      
      // Fix Khmer content
      if (article.content.km && article.content.km.includes('```html')) {
        console.log('  Fixing Khmer content...');
        const cleanedKm = cleanContent(article.content.km);
        const formattedKm = formatContentAdvanced(cleanedKm);
        article.content.km = formattedKm;
        needsUpdate = true;
        console.log('  ✅ Khmer content cleaned and formatted');
      }
      
      if (needsUpdate) {
        await article.save();
        fixedCount++;
        console.log(`  ✅ Fixed article: ${article.title.en || article.title} (ID: ${article._id})`);
      } else {
        console.log(`  ⏭️ No changes needed for: ${article.title.en || article.title}`);
      }
    }
    
    console.log(`\n📊 Fix completed:`);
    console.log(`   - Articles fixed: ${fixedCount}`);
    console.log(`   - Total processed: ${articles.length}`);
    
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
  }
}

fixHtmlMarkdownArticles();
