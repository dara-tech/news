import mongoose from 'mongoose';
import dotenv from 'dotenv';
import News from '../models/News.mjs';
import User from '../models/User.mjs';
import Category from '../models/Category.mjs';
import connectDB from '../config/db.mjs';

dotenv.config();

connectDB();

const importData = async () => {
  try {
    await News.deleteMany();

    const adminUser = await User.findOne({ role: 'admin' });
    const categories = await Category.find({});

    if (!adminUser) {
      process.exit(1);
    }

    // Find category IDs by name
    const technologyCategory = categories.find(c => c.name.en === 'Technology');
    const businessCategory = categories.find(c => c.name.en === 'Business');
    const healthCategory = categories.find(c => c.name.en === 'Health');
    const politicsCategory = categories.find(c => c.name.en === 'Politics');
    const entertainmentCategory = categories.find(c => c.name.en === 'Entertainment');
    const sportsCategory = categories.find(c => c.name.en === 'Sports');
    const educationCategory = categories.find(c => c.name.en === 'Education');

    if (!technologyCategory || !businessCategory || !healthCategory || !politicsCategory || !entertainmentCategory || !sportsCategory || !educationCategory) {
      process.exit(1);
    }

    const sampleNews = [
      {
        author: adminUser._id,
        title: { en: 'All About Cookies', kh: 'អំពីខូគីទាំងអស់' },
        slug: 'all-about-cookies',
        content: { 
          en: 'Cookies are small text files that are stored on your computer when you visit a website. They help websites remember your preferences and provide a better user experience. This article explores the different types of cookies, their uses, and how they impact your browsing experience.',
          kh: 'ខូគីគឺជាឯកសារអត្ថបទតូចៗដែលត្រូវបានរក្សាទុកនៅលើកុំព្យូទ័ររបស់អ្នកនៅពេលអ្នកចូលទៅកាន់គេហទំព័រ។ ពួកវាជួយឱ្យគេហទំព័រចាំចំណូលចិត្តរបស់អ្នក និងផ្តល់នូវបទពិសោធន៍អ្នកប្រើប្រាស់ល្អជាង។ អត្ថបទនេះស្វែងយល់អំពីប្រភេទខូគីផ្សេងៗ ការប្រើប្រាស់របស់ពួកវា និងរបៀបដែលពួកវាមានឥទ្ធិពលលើបទពិសោធន៍រុករករបស់អ្នក។'
        },
        description: { 
          en: 'Understanding cookies and their role in modern web browsing.',
          kh: 'ការយល់ដឹងអំពីខូគី និងតួនាទីរបស់ពួកវាក្នុងការរុករកវែបទំនើប។'
        },
        category: technologyCategory._id,
        tags: ['Cookies', 'Web', 'Technology', 'Privacy'],
        thumbnail: 'https://via.placeholder.com/800x400.png?text=Cookies',
        status: 'published',
        publishedAt: new Date(),
        views: 5743,
        isFeatured: true,
        isBreaking: false,
      },
      {
        author: adminUser._id,
        title: { en: 'DPM Hun Many Oversees Vital Blood Donation Drive', kh: 'ឧបនាយករដ្ឋមន្ត្រី ហ៊ុន ម៉ានី តាមដានការបរិច្ចាគឈាមសំខាន់ៗ' },
        slug: 'dpm-hun-many-oversees-vital-blood-donation-drive',
        content: { 
          en: 'Deputy Prime Minister Hun Many recently oversaw a crucial blood donation campaign aimed at addressing the country\'s blood bank shortages. The initiative, which brought together healthcare professionals and volunteers, successfully collected hundreds of units of blood to support emergency medical services across Cambodia.',
          kh: 'ឧបនាយករដ្ឋមន្ត្រី ហ៊ុន ម៉ានី បានតាមដានយុទ្ធនាការបរិច្ចាគឈាមសំខាន់ៗដែលមានគោលបំណងដោះស្រាយការខ្វះខាតធនាគារឈាមរបស់ប្រទេស។ គម្រោងនេះ ដែលបានប្រមូលផ្តុំអ្នកជំនាញថែទាំ និងអ្នកស្ម័គ្រចិត្ត បានប្រមូលផ្តុំឈាមរាប់រយឯកតាដោយជោគជ័យដើម្បីគាំទ្រសេវាថែទាំអាសន្ននៅទូទាំងប្រទេសកម្ពុជា។'
        },
        description: { 
          en: 'A major blood donation campaign addresses critical shortages in Cambodia\'s healthcare system.',
          kh: 'យុទ្ធនាការបរិច្ចាគឈាមធំៗដោះស្រាយការខ្វះខាតសំខាន់ៗក្នុងប្រព័ន្ធថែទាំសុខភាពរបស់កម្ពុជា។'
        },
        category: politicsCategory._id,
        tags: ['Politics', 'Healthcare', 'Blood Donation', 'Cambodia'],
        thumbnail: 'https://via.placeholder.com/800x400.png?text=Blood+Donation',
        status: 'published',
        publishedAt: new Date(),
        views: 3374,
        isFeatured: true,
        isBreaking: true,
      },
      {
        author: adminUser._id,
        title: { en: 'Hun Manet', kh: 'ហ៊ុន ម៉ាណេត' },
        slug: 'hun-manet',
        content: { 
          en: 'Prime Minister Hun Manet continues to lead Cambodia with a focus on economic development and international relations. His recent initiatives include strengthening trade partnerships, improving infrastructure, and promoting sustainable development across the country.',
          kh: 'នាយករដ្ឋមន្ត្រី ហ៊ុន ម៉ាណេត បន្តដឹកនាំកម្ពុជាជាមួយនឹងការផ្តោតលើការអភិវឌ្ឍសេដ្ឋកិច្ច និងទំនាក់ទំនងអន្តរជាតិ។ គម្រោងថ្មីៗរបស់គាត់រួមមានការពង្រឹង شراكةពាណិជ្ជកម្ម ការកែលម្អហេដ្ឋារចនាសម្ព័ន្ធ និងការលើកទឹកចិត្តការអភិវឌ្ឍដែលអាចរក្សាបាននៅទូទាំងប្រទេស។'
        },
        description: { 
          en: 'Updates on Prime Minister Hun Manet\'s leadership and policy initiatives.',
          kh: 'ព័ត៌មានថ្មីៗអំពីការដឹកនាំ និងគម្រោងគោលការណ៍របស់នាយករដ្ឋមន្ត្រី ហ៊ុន ម៉ាណេត។'
        },
        category: politicsCategory._id,
        tags: ['Politics', 'Leadership', 'Cambodia', 'Government'],
        thumbnail: 'https://via.placeholder.com/800x400.png?text=Hun+Manet',
        status: 'published',
        publishedAt: new Date(),
        views: 2728,
        isFeatured: false,
        isBreaking: false,
      },
      {
        author: adminUser._id,
        title: { en: 'GTA 6: Anticipation Builds for Rockstar\'s Next Blockbuster', kh: 'GTA 6: ការរំពឹងថ្លៃកើតឡើងសម្រាប់ខ្សែភាពយន្តធំៗបន្ទាប់របស់ Rockstar' },
        slug: 'gta-6-anticipation-builds-for-rockstar-s-next-blockbuster',
        content: { 
          en: 'Gamers worldwide are eagerly awaiting the release of Grand Theft Auto 6, Rockstar Games\' highly anticipated sequel. With rumors of a return to Vice City and enhanced graphics powered by next-generation consoles, the gaming community is buzzing with excitement about what could be the biggest game release of the decade.',
          kh: 'អ្នកលេងហ្គេមទូទាំងពិភពលោកកំពុងរង់ចាំការចេញផ្សាយ Grand Theft Auto 6 ដែលជាផ្នែកបន្តដែលរំពឹងថ្លៃរបស់ Rockstar Games។ ជាមួយនឹងច្រែកដំណឹងអំពីការត្រឡប់ទៅ Vice City និងការកែលម្អក្រាហ្វិកដែលដំណើរការដោយគ្រឿងដែលជំនាន់បន្ទាប់ សហគមន៍ហ្គេមកំពុងរំភើបអំពីអ្វីដែលអាចជាការចេញផ្សាយហ្គេមធំៗបំផុតនៃទសវត្សរ៍នេះ។'
        },
        description: { 
          en: 'The gaming world prepares for what could be the biggest release of the decade.',
          kh: 'ពិភពហ្គេមត្រៀមខ្លួនសម្រាប់អ្វីដែលអាចជាការចេញផ្សាយធំៗបំផុតនៃទសវត្សរ៍នេះ។'
        },
        category: entertainmentCategory._id,
        tags: ['Gaming', 'GTA 6', 'Entertainment', 'Technology'],
        thumbnail: 'https://via.placeholder.com/800x400.png?text=GTA+6',
        status: 'published',
        publishedAt: new Date(),
        views: 2670,
        isFeatured: false,
        isBreaking: false,
      },
      {
        author: adminUser._id,
        title: { en: 'F-16 Fighting Falcon: A Legacy of Air Superiority', kh: 'F-16 Fighting Falcon: មរតកនៃអធិបតេយ្យភាពអាកាស' },
        slug: 'f-16-fighting-falcon-a-legacy-of-air-superiority',
        content: { 
          en: 'The F-16 Fighting Falcon has been a cornerstone of air defense for over four decades. This article explores the aircraft\'s evolution, its role in modern warfare, and the technological advancements that have kept it relevant in an ever-changing military landscape.',
          kh: 'F-16 Fighting Falcon បានក្លាយជាថ្មគ្រឹះនៃការការពារអាកាសអស់រយៈពេលជាង ៤០ ឆ្នាំ។ អត្ថបទនេះស្វែងយល់អំពីការវិវត្តន៍យន្តហោះ តួនាទីរបស់វាក្នុងសង្គ្រាមទំនើប និងការកែលម្អបច្ចេកវិទ្យាដែលបានរក្សាវាឱ្យពាក់ព័ន្ធនៅក្នុងផ្ទៃយោធាដែលផ្លាស់ប្តូរជានិច្ច។'
        },
        description: { 
          en: 'Exploring the history and impact of one of the world\'s most successful fighter aircraft.',
          kh: 'ស្វែងយល់អំពីប្រវត្តិសាស្ត្រ និងឥទ្ធិពលរបស់យន្តហោះចម្បាំងជោគជ័យបំផុតមួយក្នុងពិភពលោក។'
        },
        category: educationCategory._id,
        tags: ['Military', 'Aviation', 'Technology', 'History'],
        thumbnail: 'https://via.placeholder.com/800x400.png?text=F-16',
        status: 'published',
        publishedAt: new Date(),
        views: 2280,
        isFeatured: false,
        isBreaking: false,
      },
      {
        author: adminUser._id,
        title: { en: 'Technology Trends 2024', kh: 'និន្នាការបច្ចេកវិទ្យា ២០២៤' },
        slug: 'technology-trends-2024',
        content: { 
          en: 'From artificial intelligence to renewable energy, 2024 is shaping up to be a transformative year in technology. This comprehensive overview examines the key trends that are reshaping industries and our daily lives.',
          kh: 'ពីបញ្ញាសិប្បនិម្មិតដល់ថាមពលដែលអាចផ្តល់ឡើងវិញ ២០២៤ កំពុងក្លាយជាឆ្នាំផ្លាស់ប្តូរនៅក្នុងបច្ចេកវិទ្យា។ ទិដ្ឋភាពទូទៅនេះពិនិត្យមើលនិន្នាការសំខាន់ៗដែលកំពុងផ្លាស់ប្តូរឧស្សាហកម្ម និងជីវិតប្រចាំថ្ងៃរបស់យើង។'
        },
        description: { 
          en: 'A look at the most important technology trends shaping our future.',
          kh: 'ការមើលនិន្នាការបច្ចេកវិទ្យាសំខាន់ៗដែលកំពុងផ្លូវអនាគតរបស់យើង។'
        },
        category: technologyCategory._id,
        tags: ['Technology', 'AI', 'Innovation', 'Future'],
        thumbnail: 'https://via.placeholder.com/800x400.png?text=Tech+Trends',
        status: 'published',
        publishedAt: new Date(),
        views: 1850,
        isFeatured: true,
        isBreaking: false,
      },
      {
        author: adminUser._id,
        title: { en: 'Cambodia\'s Economic Growth', kh: 'ការលូតលាស់សេដ្ឋកិច្ចរបស់កម្ពុជា' },
        slug: 'cambodia-economic-growth',
        content: { 
          en: 'Cambodia\'s economy continues to show strong growth indicators, with significant improvements in infrastructure, tourism, and manufacturing sectors. This article analyzes the factors driving this growth and what it means for the country\'s future development.',
          kh: 'សេដ្ឋកិច្ចរបស់កម្ពុជាបន្តបង្ហាញសូចនាករលូតលាស់ខ្លាំង ជាមួយនឹងការកែលម្អសំខាន់ៗក្នុងវិស័យហេដ្ឋារចនាសម្ព័ន្ធ ការកំសាន្ត និងផលិតកម្ម។ អត្ថបទនេះវិភាគកត្តិកដែលជំរុញការលូតលាស់នេះ និងអ្វីដែលវាមានន័យសម្រាប់ការអភិវឌ្ឍអនាគតរបស់ប្រទេស។'
        },
        description: { 
          en: 'Analyzing the factors behind Cambodia\'s economic success.',
          kh: 'វិភាគកត្តិកពីក្រោយជោគជ័យសេដ្ឋកិច្ចរបស់កម្ពុជា។'
        },
        category: businessCategory._id,
        tags: ['Economy', 'Cambodia', 'Business', 'Growth'],
        thumbnail: 'https://via.placeholder.com/800x400.png?text=Economy',
        status: 'published',
        publishedAt: new Date(),
        views: 1650,
        isFeatured: false,
        isBreaking: false,
      },
      {
        author: adminUser._id,
        title: { en: 'Health and Wellness Trends', kh: 'និន្នាការសុខភាព និងសុខុមាលភាព' },
        slug: 'health-and-wellness-trends',
        content: { 
          en: 'Modern approaches to health and wellness are evolving rapidly, with new research and technologies changing how we think about fitness, nutrition, and mental health. This article explores the latest trends and their impact on our daily lives.',
          kh: 'វិធីសាស្ត្រទំនើបចំពោះសុខភាព និងសុខុមាលភាពកំពុងវិវត្តយ៉ាងឆាប់ ជាមួយនឹងការស្រាវជ្រាវ និងបច្ចេកវិទ្យាថ្មីៗផ្លាស់ប្តូររបៀបដែលយើងគិតអំពីការហាត់ប្រាណ អាហារូបត្ថម្ភ និងសុខភាពផ្លូវចិត្ត។ អត្ថបទនេះស្វែងយល់និន្នាការថ្មីៗ និងឥទ្ធិពលរបស់ពួកវាលើជីវិតប្រចាំថ្ងៃរបស់យើង។'
        },
        description: { 
          en: 'Exploring modern approaches to health and wellness.',
          kh: 'ស្វែងយល់វិធីសាស្ត្រទំនើបចំពោះសុខភាព និងសុខុមាលភាព។'
        },
        category: healthCategory._id,
        tags: ['Health', 'Wellness', 'Fitness', 'Nutrition'],
        thumbnail: 'https://via.placeholder.com/800x400.png?text=Health+Wellness',
        status: 'published',
        publishedAt: new Date(),
        views: 1420,
        isFeatured: false,
        isBreaking: false,
      },
    ];

    await News.insertMany(sampleNews);
    process.exit();
  } catch (error) {
    console.error('Error seeding news:', error);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await News.deleteMany();
    process.exit();
  } catch (error) {
    console.error('Error deleting news:', error);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
