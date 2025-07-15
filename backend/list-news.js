import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import News from './models/News.js';

dotenv.config();

const listNews = async () => {
  try {
    await connectDB();
    const articles = await News.find({}, 'title');

    if (articles.length === 0) {
      console.log('No news articles found in the database.');
    } else {
      console.log('--- Current News Articles ---');
      articles.forEach(article => {
        console.log(`ID: ${article._id}, Title: ${article.title.en}`);
      });
      console.log('---------------------------');
    }
    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    mongoose.connection.close();
    process.exit(1);
  }
};

listNews();
