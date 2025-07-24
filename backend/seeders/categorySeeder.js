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

    const categoryDocs = categories.map(name => ({ name }));

    await Category.insertMany(categoryDocs);

    process.exit();
  } catch (err) {
    process.exit(1);
  }
};

if (process.argv[2] === '-i') {
  seedCategories();
}
