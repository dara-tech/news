const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Category = require('../models/Category');
const News = require('../models/News'); // We need this to get the enum values

// Load env vars
dotenv.config({ path: './.env' });

// Connect to DB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const categories = News.schema.path('category').enumValues;

const seedCategories = async () => {
  try {
    await Category.deleteMany();
    console.log('Categories destroyed');

    const categoryDocs = categories.map(name => ({ name }));

    await Category.insertMany(categoryDocs);
    console.log('Categories created');

    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

if (process.argv[2] === '-i') {
  seedCategories();
}
