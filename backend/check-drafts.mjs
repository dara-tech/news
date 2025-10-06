import mongoose from 'mongoose';
import News from './models/News.mjs';

async function checkRecentDrafts() {
  try {
    // Connect to database
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/newsapp');
    }
    
    console.log('=== RECENT DRAFTS ===');
    
    // Get recent articles (all statuses)
    const drafts = await News.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title content status createdAt');
    
    console.log('Total drafts:', drafts.length);
    
    drafts.forEach((draft, index) => {
      console.log('\n--- Article', index + 1, '---');
      console.log('Title (EN):', draft.title?.en || draft.title);
      console.log('Title (KH):', draft.title?.kh || 'N/A');
      console.log('Status:', draft.status);
      console.log('Created:', draft.createdAt);
      
      // Handle multilingual content
      const contentEn = typeof draft.content === 'object' ? draft.content?.en : draft.content;
      const contentKh = typeof draft.content === 'object' ? draft.content?.kh : '';
      
      console.log('Content EN preview:', (contentEn || '').substring(0, 200) + '...');
      if (contentKh) {
        console.log('Content KH preview:', contentKh.substring(0, 100) + '...');
      }
      
      // Check for dangerous HTML patterns in English content
      const hasHtml = /<[^>]*>/.test(contentEn || '');
      const hasCodeBlocks = /```/.test(contentEn || '');
      const hasTripleQuotes = /'''/.test(contentEn || '');
      
      console.log('Has HTML tags:', hasHtml);
      console.log('Has code blocks:', hasCodeBlocks);
      console.log('Has triple quotes:', hasTripleQuotes);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

checkRecentDrafts();
