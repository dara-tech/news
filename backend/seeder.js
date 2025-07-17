import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import Category from './models/Category.js';
import categories from './data/categories.js';

dotenv.config();

connectDB();

const importData = async () => {
  try {
    await Category.deleteMany();

    await Category.create(categories);

    console.log('Data Imported!');
    process.exit();
  } catch (error) { 
    console.error(`${error}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await Category.deleteMany();

    console.log('Data Destroyed!');
    process.exit();
  } catch (error) {
    console.error(`${error}`);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
