import dotenv from 'dotenv';
import connectDB from './config/db.mjs';
import News from './models/News.mjs';
import logger from '../utils/logger.mjs';

// Load environment variables
dotenv.config({ path: './backend/.env' });

async function generateImagesPreview() {
  logger.info('🎨 Previewing image generation for articles...\n');
  
  try {
    // Connect to database
    await connectDB();
    logger.info('✅ Connected to database\n');
    
    // Find articles that need images (have thumbnails but no images array or empty images array)
    const articlesNeedingImages = await News.find({
      status: { $in: ['draft', 'published'] },
      $or: [
        { images: { $exists: false } },
        { images: null },
        { images: [] }
      ]
    }).sort({ createdAt: -1 }).limit(10); // Limit to 10 for preview
    
    logger.info(`📊 Found ${articlesNeedingImages.length} articles needing images (showing first 10)\n`);
    
    if (articlesNeedingImages.length === 0) {
      logger.info('🎉 All articles already have images!');
      return;
    }
    
    logger.info('📝 Preview of image generation prompts:\n');
    
    for (let i = 0; i < articlesNeedingImages.length; i++) {
      const article = articlesNeedingImages[i];
      
      logger.info(`${i + 1}. Article: ${article.title?.en || 'No title'}`);
      logger.info(`   Slug: ${article.slug}`);
      logger.info(`   Status: ${article.status}`);
      logger.info(`   Current thumbnail: ${article.thumbnail || 'None'}`);
      
      // Create a sample prompt
      const content = article.content?.en || article.description?.en || '';
      const prompt = `
Create a professional news article thumbnail image.

Article Title: ${article.title?.en || ''}
Article Content: ${content.substring(0, 200)}...

Requirements:
- Professional news-style image
- High quality and visually appealing
- Relevant to the article topic
- Suitable for a news website thumbnail
- Modern and clean design
- No text overlays (just the image)
- Aspect ratio suitable for web (16:9 or 4:3)
- Engaging and click-worthy
- Professional color scheme
- Clear visual storytelling

Generate an image that would make readers want to click and read this news article.
Focus on visual elements, colors, composition, and mood that represent the article's content.
      `.trim();
      
      logger.info(`   Generated prompt: ${prompt.substring(0, 150)}...`);
      logger.info('');
    }
    
    // Count by status
    const draftCount = articlesNeedingImages.filter(a => a.status === 'draft').length;
    const publishedCount = articlesNeedingImages.filter(a => a.status === 'published').length;
    
    logger.info(`\n📊 Preview Summary:`);
    logger.info(`  - Draft articles: ${draftCount}`);
    logger.info(`  - Published articles: ${publishedCount}`);
    logger.info(`  - Total previewed: ${articlesNeedingImages.length}`);
    
    // Get total count
    const totalNeedingImages = await News.countDocuments({
      status: { $in: ['draft', 'published'] },
      $or: [
        { images: { $exists: false } },
        { images: null },
        { images: [] }
      ]
    });
    
    logger.info(`  - Total articles needing images: ${totalNeedingImages}`);
    
    logger.info('\n💡 To actually generate images, you need to:');
    logger.info('   1. Set up GOOGLE_API_KEY or GEMINI_API_KEY in backend/.env');
    logger.info('   2. Run the full generate-images-for-articles.mjs script');
    logger.info('   3. The script will use Google Gemini to generate actual images');
    
  } catch (error) {
    logger.error('💥 Script failed:', error);
  } finally {
    process.exit(0);
  }
}

generateImagesPreview();
