import mongoose from 'mongoose';
import dotenv from 'dotenv';
import News from "./models/News.mjs';
import Category from "./models/Category.mjs';
import connectDB from "./config/db.mjs';

dotenv.config();

const migrateData = async () => {
  try {
    await connectDB();

    const categories = await Category.find({});
    const categoryMap = categories.reduce((acc, category) => {
      acc[category.slug] = category._id;
      // Also map by name just in case
      acc[category.name.en.toLowerCase()] = category._id;
      return acc;
    }, {});

    const newsArticles = await News.find({});
    let updatedCount = 0;
    let failedCount = 0;

    const defaultCategoryId = categories.length > 0 ? categories[0]._id : null;

    for (const article of newsArticles) {
      let isModified = false;

      // Assign default category if missing
      if (!article.category && defaultCategoryId) {
        article.category = defaultCategoryId;
        isModified = true;
      }

      // Clean up corrupted tags
      if (article.tags && article.tags.length > 0) {
        const cleanedTags = article.tags.map(tag => {
            // Use regex to extract alphabetic words from the corrupted string
            const matches = tag.match(/[a-zA-Z]+/g);
            return matches ? matches.join(' ') : null;
        }).filter(tag => tag !== null);

        if (JSON.stringify(article.tags) !== JSON.stringify(cleanedTags)) {
            article.tags = cleanedTags;
            isModified = true;
        }
      }

      // Normalize multilingual fields (if any still exist in old format)
      const fieldsToNormalize = ['title', 'content', 'description'];
      for (const field of fieldsToNormalize) {
        if (typeof article[field] === 'string') {
          const originalValue = article[field];
          article[field] = {
            en: originalValue,
            kh: originalValue, // Defaulting Khmer to English value
          };
          isModified = true;
        }
      }

      if (isModified) {
        try {
            await article.save();
            updatedCount++;
        } catch (e) {
            failedCount++;
        }
      }
    }


  } catch (error) {
  } finally {
    await mongoose.disconnect();
  }
};

migrateData();

