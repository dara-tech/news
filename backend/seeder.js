import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.mjs';
import Category from './models/Category.mjs';
import categories from './data/categories.mjs';

dotenv.config();

connectDB();

const importData = async () => {
  try {
    await Category.deleteMany();

    await Category.create(categories);

    process.exit();
  } catch (error) { 
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await Category.deleteMany();

    process.exit();
  } catch (error) {
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
