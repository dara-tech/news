import dotenv from 'dotenv';
import mongoose from 'mongoose';
import News from './models/News.mjs';

dotenv.config();

async function fixMarkdownBlocks() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    console.log('Starting fix for articles with markdown code blocks...');
    
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
        let cleanedEn = article.content.en;
        
        // Remove markdown code blocks
        cleanedEn = cleanedEn.replace(/```html\s*/gi, '');
        cleanedEn = cleanedEn.replace(/```\s*$/gi, '');
        cleanedEn = cleanedEn.replace(/^```\s*/gi, '');
        
        // Remove "Background" text at start
        cleanedEn = cleanedEn.replace(/^Background\s*/gi, '');
        
        // Remove triple quotes
        cleanedEn = cleanedEn.replace(/'''\s*$/g, '');
        cleanedEn = cleanedEn.replace(/"""/g, '');
        
        // Clean up extra whitespace
        cleanedEn = cleanedEn.trim();
        
        article.content.en = cleanedEn;
        needsUpdate = true;
        console.log('  ✅ English content cleaned');
      }
      
      // Fix Khmer content
      if (article.content.km && article.content.km.includes('```html')) {
        console.log('  Fixing Khmer content...');
        let cleanedKm = article.content.km;
        
        // Remove markdown code blocks
        cleanedKm = cleanedKm.replace(/```html\s*/gi, '');
        cleanedKm = cleanedKm.replace(/```\s*$/gi, '');
        cleanedKm = cleanedKm.replace(/^```\s*/gi, '');
        
        // Remove "Background" text at start
        cleanedKm = cleanedKm.replace(/^Background\s*/gi, '');
        
        // Remove triple quotes
        cleanedKm = cleanedKm.replace(/'''\s*$/g, '');
        cleanedKm = cleanedKm.replace(/"""/g, '');
        
        // Clean up extra whitespace
        cleanedKm = cleanedKm.trim();
        
        article.content.km = cleanedKm;
        needsUpdate = true;
        console.log('  ✅ Khmer content cleaned');
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

fixMarkdownBlocks();
