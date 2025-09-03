import mongoose from 'mongoose';
import News from './models/News.mjs';
import { cleanContent } from './utils/contentCleaner.mjs';
import { formatContentAdvanced } from './utils/advancedContentFormatter.mjs';
import logger from './utils/logger.mjs';
import dotenv from 'dotenv';

dotenv.config();

async function fixSpecificArticle() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Find the specific article
    const article = await News.findOne({ 
      'title.en': 'Ukraine Defiant as Trump\'s Peace Deadline Passes' 
    });
    
    if (!article) {
      console.log('Article not found');
      return;
    }
    
    console.log('Found article:', article.title.en);
    console.log('Current content preview:', article.content.en?.substring(0, 200));
    
    // Fix the content
    let updatedContent = { ...article.content };
    
    // Clean English content
    if (article.content.en) {
      console.log('Fixing English content...');
      updatedContent.en = await formatContentAdvanced(cleanContent(article.content.en), {
        enableAIEnhancement: false,
        enableReadabilityOptimization: true,
        enableSEOOptimization: true,
        enableVisualEnhancement: true,
        addSectionHeadings: true,
        enhanceQuotes: true,
        optimizeLists: true,
        preserveOriginalStructure: false
      });
      
      if (updatedContent.en.success) {
        updatedContent.en = updatedContent.en.content;
      }
    }
    
    // Clean Khmer content
    if (article.content.kh) {
      console.log('Fixing Khmer content...');
      updatedContent.kh = await formatContentAdvanced(cleanContent(article.content.kh), {
        enableAIEnhancement: false,
        enableReadabilityOptimization: true,
        enableSEOOptimization: true,
        enableVisualEnhancement: true,
        addSectionHeadings: true,
        enhanceQuotes: true,
        optimizeLists: true,
        preserveOriginalStructure: false
      });
      
      if (updatedContent.kh.success) {
        updatedContent.kh = updatedContent.kh.content;
      }
    }
    
    // Update the article
    await News.findByIdAndUpdate(article._id, {
      content: updatedContent,
      updatedAt: new Date()
    });
    
    console.log('✅ Article fixed successfully!');
    console.log('New content preview:', updatedContent.en?.substring(0, 200));
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

fixSpecificArticle();
