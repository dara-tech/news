import dotenv from 'dotenv';
import mongoose from 'mongoose';
import News from './models/News.mjs';
import { cleanContent } from './utils/contentCleaner.mjs';
import { formatContentAdvanced } from './utils/advancedContentFormatter.mjs';

dotenv.config();

async function testSentinelContent() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Get the most recent article from Sentinel
    const recentArticle = await News.findOne({ 
      'ingestion.method': 'sentinel' 
    }).sort({ createdAt: -1 });
    
    if (!recentArticle) {
      console.log('No recent Sentinel articles found');
      await mongoose.disconnect();
      return;
    }
    
    console.log(`Testing article: ${recentArticle.title.en}`);
    console.log(`Created: ${recentArticle.createdAt}`);
    console.log('');
    
    // Check English content
    console.log('=== ENGLISH CONTENT ANALYSIS ===');
    const enContent = recentArticle.content.en || '';
    console.log(`Content length: ${enContent.length} characters`);
    console.log(`Has markdown blocks: ${enContent.includes('```html')}`);
    console.log(`Has Background: ${enContent.includes('Background')}`);
    console.log(`Has triple quotes: ${enContent.includes("'''")}`);
    console.log('');
    
    if (enContent.includes('```html') || enContent.includes('Background')) {
      console.log('❌ English content has formatting issues!');
      console.log('First 500 characters:');
      console.log(enContent.substring(0, 500));
      console.log('...');
      console.log('Last 200 characters:');
      console.log(enContent.substring(enContent.length - 200));
    } else {
      console.log('✅ English content looks clean');
    }
    
    console.log('');
    
    // Check Khmer content
    console.log('=== KHMER CONTENT ANALYSIS ===');
    const khContent = recentArticle.content.km || '';
    console.log(`Content length: ${khContent.length} characters`);
    console.log(`Has markdown blocks: ${khContent.includes('```html')}`);
    console.log(`Has ផ្ទៃខាងក្រោយ: ${khContent.includes('ផ្ទៃខាងក្រោយ')}`);
    console.log(`Has triple quotes: ${khContent.includes("'''")}`);
    console.log('');
    
    if (khContent.includes('```html') || khContent.includes('ផ្ទៃខាងក្រោយ')) {
      console.log('❌ Khmer content has formatting issues!');
      console.log('First 500 characters:');
      console.log(khContent.substring(0, 500));
      console.log('...');
      console.log('Last 200 characters:');
      console.log(khContent.substring(khContent.length - 200));
    } else {
      console.log('✅ Khmer content looks clean');
    }
    
    console.log('');
    
    // Test cleaning functions
    console.log('=== TESTING CLEANING FUNCTIONS ===');
    if (enContent.includes('```html') || enContent.includes('Background')) {
      console.log('Testing cleanContent function...');
      const cleaned = cleanContent(enContent);
      console.log(`After cleaning - Has markdown blocks: ${cleaned.includes('```html')}`);
      console.log(`After cleaning - Has Background: ${cleaned.includes('Background')}`);
      
      console.log('Testing formatContentAdvanced function...');
      const options = {
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
      const formatted = await formatContentAdvanced(cleaned, options);
      console.log(`After formatting - Has markdown blocks: ${formatted.content.includes('```html')}`);
      console.log(`After formatting - Has Background: ${formatted.content.includes('Background')}`);
    }
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

testSentinelContent();
