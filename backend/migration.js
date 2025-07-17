import mongoose from 'mongoose';
import dotenv from 'dotenv';
import News from './models/News.js';
import Category from './models/Category.js';
import connectDB from './config/db.js';

dotenv.config();

const migrateData = async () => {
  try {
    await connectDB();
    console.log('MongoDB Connected...');

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
        console.log(`Assigned default category to article: ${article._id}`);
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
            console.log(`Cleaned tags for article: ${article._id}`);
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
            console.log(`Successfully updated article: ${article._id}`);
        } catch (e) {
            console.error(`Failed to save article ${article._id}:`, e.message);
            failedCount++;
        }
      }
    }

    console.log('\n--- Migration Complete ---');
    console.log(`Successfully updated ${updatedCount} articles.`);
    console.log(`Failed to migrate ${failedCount} articles (see warnings above).`);

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB Disconnected.');
  }
};

migrateData();

