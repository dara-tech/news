import mongoose from 'mongoose';
import News from './models/News.mjs';
import dotenv from 'dotenv';

dotenv.config();

async function debugQuery() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Test the exact query
    const articles = await News.find({
      $or: [
        { 'content.en': { $regex: /Former U\. S\. Background|Background|'''|"""|<head|<html|<body|<script|<style|<meta/i } },
        { 'content.kh': { $regex: /Former U\. S\. Background|Background|'''|"""|<head|<html|<body|<script|<style|<meta/i } }
      ]
    });
    
    console.log('Found', articles.length, 'articles with regex patterns');
    
    // Test simpler queries
    const backgroundArticles = await News.find({
      'content.en': { $regex: /Background/i }
    });
    console.log('Found', backgroundArticles.length, 'articles with Background');
    
    const noParagraphs = await News.find({
      $and: [
        { 'content.en': { $exists: true } },
        { 'content.en': { $not: { $regex: /<p>/i } } },
        { 'content.en': { $regex: /.{500,}/ } }
      ]
    });
    console.log('Found', noParagraphs.length, 'articles with no paragraph structure');
    
    // Show sample of articles with no paragraphs
    if (noParagraphs.length > 0) {
      console.log('\nSample article with no paragraphs:');
      console.log('Title:', noParagraphs[0].title.en);
      console.log('Content length:', noParagraphs[0].content.en.length);
      console.log('First 200 chars:', noParagraphs[0].content.en.substring(0, 200));
    }
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

debugQuery();
