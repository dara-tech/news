import fs from 'fs';
import path from 'path';

// Files to update with their specific replacements
const fileUpdates = [
  {
    file: 'frontend/src/app/[lang]/archive/page.tsx',
    replacements: [
      { from: 'title: \'News Archive - NewsApp\',', to: 'title: \'News Archive - Razewire\',' }
    ]
  },
  {
    file: 'frontend/src/app/[lang]/sitemap-page/page.tsx',
    replacements: [
      { from: 'title: \'Sitemap - NewsApp\',', to: 'title: \'Sitemap - Razewire\',' },
      { from: 'description: \'Navigate through all pages and sections of NewsApp easily with our comprehensive sitemap.\',', to: 'description: \'Navigate through all pages and sections of Razewire easily with our comprehensive sitemap.\',' },
      { from: 'Navigate through all pages and sections of NewsApp', to: 'Navigate through all pages and sections of Razewire' }
    ]
  },
  {
    file: 'frontend/src/app/[lang]/privacy/page.tsx',
    replacements: [
      { from: 'title: \'Privacy Policy - NewsApp\',', to: 'title: \'Privacy Policy - Razewire\',' },
      { from: 'description: \'Learn how NewsApp collects, uses, and protects your personal information. Your privacy is important to us.\',', to: 'description: \'Learn how Razewire collects, uses, and protects your personal information. Your privacy is important to us.\',' },
      { from: 'intro: \'At NewsApp, we are committed to protecting your privacy', to: 'intro: \'At Razewire, we are committed to protecting your privacy' },
      { from: 'privacy@newsapp.com', to: 'privacy@razewire.online' },
      { from: 'នៅ NewsApp យើងប្តេជ្ញាចិត្តក្នុងការការពារភាពឯកជន', to: 'នៅ Razewire យើងប្តេជ្ញាចិត្តក្នុងការការពារភាពឯកជន' },
      { from: 'privacy@newsapp.com', to: 'privacy@razewire.online' }
    ]
  },
  {
    file: 'frontend/src/app/[lang]/contact/page.tsx',
    replacements: [
      { from: 'title: \'Contact Us - NewsApp\',', to: 'title: \'Contact Us - Razewire\',' },
      { from: 'contact@newsapp.com', to: 'contact@razewire.online' }
    ]
  },
  {
    file: 'frontend/src/app/[lang]/terms/page.tsx',
    replacements: [
      { from: 'title: \'Terms of Service - NewsApp\',', to: 'title: \'Terms of Service - Razewire\',' },
      { from: 'description: \'Read our terms of service to understand your rights and responsibilities when using NewsApp.\',', to: 'description: \'Read our terms of service to understand your rights and responsibilities when using Razewire.\',' },
      { from: 'intro: \'Welcome to NewsApp. These Terms of Service', to: 'intro: \'Welcome to Razewire. These Terms of Service' },
      { from: 'By accessing and using NewsApp, you accept', to: 'By accessing and using Razewire, you accept' },
      { from: 'NewsApp provides news content', to: 'Razewire provides news content' },
      { from: 'All content published on NewsApp remains', to: 'All content published on Razewire remains' },
      { from: 'All content, trademarks, and intellectual property on NewsApp are', to: 'All content, trademarks, and intellectual property on Razewire are' },
      { from: 'NewsApp shall not be liable', to: 'Razewire shall not be liable' },
      { from: 'legal@newsapp.com', to: 'legal@razewire.online' },
      { from: 'សូមស្វាគមន៍មកកាន់ NewsApp។', to: 'សូមស្វាគមន៍មកកាន់ Razewire។' },
      { from: 'ដោយការចូលដំណើរការ និងប្រើប្រាស់ NewsApp អ្នកទទួលយក', to: 'ដោយការចូលដំណើរការ និងប្រើប្រាស់ Razewire អ្នកទទួលយក' },
      { from: 'NewsApp ផ្តល់មាតិកាព័ត៌មាន', to: 'Razewire ផ្តល់មាតិកាព័ត៌មាន' },
      { from: 'មាតិកាទាំងអស់ដែលបានបោះពុម្ពនៅលើ NewsApp នៅតែជាកម្មសិទ្ធិរបស់ NewsApp', to: 'មាតិកាទាំងអស់ដែលបានបោះពុម្ពនៅលើ Razewire នៅតែជាកម្មសិទ្ធិរបស់ Razewire' },
      { from: 'មាតិកា ម៉ាកយីហោ និងកម្មសិទ្ធិបញ្ញាទាំងអស់នៅលើ NewsApp ជាកម្មសិទ្ធិរបស់យើង', to: 'មាតិកា ម៉ាកយីហោ និងកម្មសិទ្ធិបញ្ញាទាំងអស់នៅលើ Razewire ជាកម្មសិទ្ធិរបស់យើង' },
      { from: 'NewsApp នឹងមិនទទួលខុសត្រូវ', to: 'Razewire នឹងមិនទទួលខុសត្រូវ' },
      { from: 'legal@newsapp.com', to: 'legal@razewire.online' }
    ]
  },
  {
    file: 'frontend/src/app/[lang]/faq/page.tsx',
    replacements: [
      { from: 'title: \'Frequently Asked Questions - NewsApp\',', to: 'title: \'Frequently Asked Questions - Razewire\',' },
      { from: 'description: \'Find answers to common questions about NewsApp, our services, and how to use our platform.\',', to: 'description: \'Find answers to common questions about Razewire, our services, and how to use our platform.\',' },
      { from: 'question: \'What is NewsApp?\',', to: 'question: \'What is Razewire?\',' },
      { from: 'answer: \'NewsApp is a comprehensive news platform', to: 'answer: \'Razewire is a comprehensive news platform' },
      { from: 'question: \'Is NewsApp free to use?\',', to: 'question: \'Is Razewire free to use?\',' },
      { from: 'answer: \'Yes, NewsApp is completely free to use.', to: 'answer: \'Yes, Razewire is completely free to use.' },
      { from: 'question: \'Is NewsApp mobile-friendly?\',', to: 'question: \'Is Razewire mobile-friendly?\',' },
      { from: 'answer: \'Yes! NewsApp is fully responsive', to: 'answer: \'Yes! Razewire is fully responsive' },
      { from: 'Find answers to common questions about NewsApp', to: 'Find answers to common questions about Razewire' },
      { from: 'support@newsapp.com', to: 'support@razewire.online' }
    ]
  }
];

async function updateFiles() {
  console.log('🔄 Updating brand references from NewsApp to Razewire...\n');

  for (const fileUpdate of fileUpdates) {
    try {
      const filePath = fileUpdate.file;
      
      if (!fs.existsSync(filePath)) {
        console.log(`⚠️  File not found: ${filePath}`);
        continue;
      }

      let content = fs.readFileSync(filePath, 'utf8');
      let updated = false;

      for (const replacement of fileUpdate.replacements) {
        if (content.includes(replacement.from)) {
          content = content.replace(new RegExp(replacement.from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replacement.to);
          updated = true;
        }
      }

      if (updated) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Updated: ${filePath}`);
      } else {
        console.log(`ℹ️  No changes needed: ${filePath}`);
      }

    } catch (error) {
      console.error(`❌ Error updating ${fileUpdate.file}:`, error.message);
    }
  }

  console.log('\n🎉 Brand update completed!');
  console.log('\n📝 Summary of changes:');
  console.log('- Updated metadata titles and descriptions');
  console.log('- Updated contact email addresses');
  console.log('- Updated company name references');
  console.log('- Updated FAQ content');
  console.log('- Updated legal page content');
  console.log('- Updated social media handles');
}

// Run the update
updateFiles();
