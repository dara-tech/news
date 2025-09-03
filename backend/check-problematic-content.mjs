import mongoose from 'mongoose';
import News from './models/News.mjs';
import dotenv from 'dotenv';

dotenv.config();

async function checkProblematicContent() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Check for articles with problematic patterns
    const problematicArticles = await News.find({
      $or: [
        { 'content.en': { $regex: /Former U\. S\. Background|'''|"""|<head|<html|<body|<script|<style|<meta/i } },
        { 'content.kh': { $regex: /Former U\. S\. Background|'''|"""|<head|<html|<body|<script|<style|<meta/i } }
      ]
    }).limit(5);
    
    console.log('Found', problematicArticles.length, 'articles with problematic content');
    
    problematicArticles.forEach((article, i) => {
      console.log(`\nArticle ${i+1}:`);
      console.log('Title:', article.title.en);
      console.log('EN content preview:', article.content.en?.substring(0, 300));
      console.log('KH content preview:', article.content.kh?.substring(0, 300));
    });
    
    // Also check for articles that might have formatting issues
    const allArticles = await News.find({}).limit(10);
    console.log('\n\nChecking all articles for formatting issues...');
    
    allArticles.forEach((article, i) => {
      const enContent = article.content.en || '';
      const khContent = article.content.kh || '';
      
      // Check for issues
      const hasHtmlTags = /<[^>]*>/g.test(enContent) || /<[^>]*>/g.test(khContent);
      const hasLongParagraphs = enContent.length > 2000 && !enContent.includes('<p>');
      const hasNoParagraphs = !enContent.includes('<p>') && enContent.length > 500;
      
      if (hasHtmlTags || hasLongParagraphs || hasNoParagraphs) {
        console.log(`\nArticle ${i+1} - ${article.title.en}:`);
        console.log('  - Has HTML tags:', hasHtmlTags);
        console.log('  - Has long paragraphs:', hasLongParagraphs);
        console.log('  - Has no paragraph structure:', hasNoParagraphs);
        console.log('  - Content length:', enContent.length);
        console.log('  - Preview:', enContent.substring(0, 200));
      }
    });
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkProblematicContent();
