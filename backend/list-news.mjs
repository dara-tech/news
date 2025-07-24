import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from "./config/db.mjs';
import News from "./models/News.mjs';

dotenv.config();

const listNews = async () => {
  try {
    await connectDB();
    const articles = await News.find({}, 'title');

    if (articles.length === 0) {
    } else {
      articles.forEach(article => {
      });
    }
    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    mongoose.connection.close();
    process.exit(1);
  }
};

listNews();
