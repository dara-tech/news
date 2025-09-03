import dotenv from 'dotenv';
import mongoose from 'mongoose';
import News from './models/News.mjs';
import { cleanContent } from './utils/contentCleaner.mjs';
import { formatContentAdvanced } from './utils/advancedContentFormatter.mjs';

dotenv.config();

async function fixAllContentFormatting() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    console.log('Starting comprehensive fix for ALL articles with formatting issues...');
    
    // Find ALL articles that may have formatting issues
    const articles = await News.find({
      $or: [
        { 'content.en': { $regex: 'Background', $options: 'i' } },
        { 'content.km': { $regex: 'ផ្ទៃខាងក្រោយ', $options: 'i' } },
        { 'content.en': { $regex: '```html', $options: 'i' } },
        { 'content.km': { $regex: '```html', $options: 'i' } }
      ]
    });
    
    console.log(`Found ${articles.length} articles with potential formatting issues`);
    
    let fixedCount = 0;
    
    for (const article of articles) {
      console.log(`\nFixing article: ${article.title.en || article.title}`);
      console.log(`  Method: ${article.ingestion?.method || 'unknown'}`);
      
      let needsUpdate = false;
      
      // Fix English content
      if (article.content.en) {
        const originalEn = article.content.en;
        const cleanedEn = cleanContent(originalEn);
        
        // Apply advanced formatting with AI disabled
        const formattingOptions = {
          enableAIEnhancement: false,
          enableReadabilityOptimization: true,
          enableSEOOptimization: true,
          enableVisualEnhancement: true,
          addSectionHeadings: true,
          enhanceQuotes: true,
          optimizeLists: true,
          enableContentAnalysis: false,
          addKeyPoints: false,
          enhanceStructure: true
        };
        
        const formattedResult = await formatContentAdvanced(cleanedEn, formattingOptions);
        const formattedEn = formattedResult.success ? formattedResult.content : cleanedEn;
        
        if (formattedEn !== originalEn) {
          article.content.en = formattedEn;
          needsUpdate = true;
          console.log('  ✅ English content cleaned and formatted');
        }
      }
      
      // Fix Khmer content
      if (article.content.km) {
        const originalKm = article.content.km;
        const cleanedKm = cleanContent(originalKm);
        
        // Apply advanced formatting with AI disabled
        const formattingOptions = {
          enableAIEnhancement: false,
          enableReadabilityOptimization: true,
          enableSEOOptimization: true,
          enableVisualEnhancement: true,
          addSectionHeadings: true,
          enhanceQuotes: true,
          optimizeLists: true,
          enableContentAnalysis: false,
          addKeyPoints: false,
          enhanceStructure: true
        };
        
        const formattedResult = await formatContentAdvanced(cleanedKm, formattingOptions);
        const formattedKm = formattedResult.success ? formattedResult.content : cleanedKm;
        
        if (formattedKm !== originalKm) {
          article.content.km = formattedKm;
          needsUpdate = true;
          console.log('  ✅ Khmer content cleaned and formatted');
        }
      }
      
      if (needsUpdate) {
        await article.save();
        fixedCount++;
        console.log(`  ✅ Fixed article: ${article.title.en || article.title} (ID: ${article._id})`);
      } else {
        console.log(`  ⏭️ No changes needed for: ${article.title.en || article.title}`);
      }
    }
    
    console.log(`\n📊 Comprehensive fix completed:`);
    console.log(`   - Articles fixed: ${fixedCount}`);
    console.log(`   - Total processed: ${articles.length}`);
    
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
  }
}

fixAllContentFormatting();
