import mongoose from 'mongoose';
import dotenv from 'dotenv';
import News from '../models/News.js';
import User from '../models/User.js';
import connectDB from '../config/db.js';

dotenv.config();

connectDB();

const importData = async () => {
  try {
    await News.deleteMany();

    const adminUser = await User.findOne({ role: 'admin' });

    if (!adminUser) {
      console.error('Error: No admin user found. Please create an admin user first.');
      process.exit(1);
    }

    const sampleNews = [
      {
        author: adminUser._id,
        title: { en: 'The Future of AI', kh: 'អនាគតនៃបញ្ញាសិប្បនិម្មិត' },
        slug: 'the-future-of-ai',
        content: { en: 'Content about the future of AI.', kh: 'ខ្លឹមសារអំពីអនាគតនៃបញ្ញាសិប្បនិម្មិត។' },
        description: { en: 'A look into the future of artificial intelligence.', kh: 'ទិដ្ឋភាពមួយទៅកាន់អនាគតនៃបញ្ញាសិប្បនិម្មិត។' },
        category: 'technology',
        tags: ['AI', 'Future', 'Tech'],
        thumbnail: 'https://via.placeholder.com/800x400.png?text=AI+Future',
        status: 'published',
        publishedAt: new Date(),
      },
      {
        author: adminUser._id,
        title: { en: 'Global Economic Outlook', kh: 'ទស្សនវិស័យសេដ្ឋកិច្ចពិភពលោក' },
        slug: 'global-economic-outlook',
        content: { en: 'An analysis of the current global economic trends.', kh: 'ការវិភាគអំពីនិន្នាការសេដ្ឋកិច្ចពិភពលោកបច្ចុប្បន្ន។' },
        description: { en: 'What to expect from the world economy in the coming months.', kh: 'អ្វីដែលត្រូវរំពឹងពីសេដ្ឋកិច្ចពិភពលោកក្នុងប៉ុន្មានខែខាងមុខនេះ។' },
        category: 'business',
        tags: ['Economy', 'Global', 'Finance'],
        thumbnail: 'https://via.placeholder.com/800x400.png?text=Economy',
        status: 'published',
        publishedAt: new Date(),
      },
      {
        author: adminUser._id,
        title: { en: 'Breakthrough in Health Science', kh: 'ការរកឃើញថ្មីក្នុងវិទ្យាសាស្ត្រសុខាភិបាល' },
        slug: 'breakthrough-in-health-science',
        content: { en: 'A new study reveals a major breakthrough in health science.', kh: 'ការសិក្សាថ្មីមួយបង្ហាញពីការរកឃើញដ៏ធំមួយនៅក្នុងវិទ្យាសាស្ត្រសុខាភិបាល។' },
        description: { en: 'This could change how we treat major diseases.', kh: 'នេះអាចផ្លាស់ប្តូររបៀបដែលយើងព្យាបាលជំងឺធំៗ។' },
        category: 'health',
        tags: ['Health', 'Science', 'Medicine'],
        thumbnail: 'https://via.placeholder.com/800x400.png?text=Health+Science',
        status: 'published',
        publishedAt: new Date(),
      },
    ];

    await News.insertMany(sampleNews);

    console.log('Data Imported Successfully!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await News.deleteMany();

    console.log('Data Destroyed Successfully!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
