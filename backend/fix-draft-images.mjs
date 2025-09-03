import dotenv from 'dotenv';
import connectDB from './config/db.mjs';
import News from './models/News.mjs';
import imageGenerationService from './services/imageGenerationService.mjs';
import { cloudinary, initializeCloudinary } from './utils/cloudinary.mjs';
import logger from '../utils/logger.mjs';

// Load environment variables
dotenv.config();

// Set API key for image generation
process.env.GOOGLE_API_KEY = "AIzaSyBOU_v7I2BtxnvYmp_elRH0PnI-wkr6lUU";

// Initialize Cloudinary after loading environment variables
initializeCloudinary();

async function fixDraftImages() {
  logger.info('🔧 Starting draft image fix process...\n');
  
  try {
    // Connect to database
    await connectDB();
    logger.info('✅ Connected to database\n');
    
    // Find drafts without images
    const draftsWithoutImages = await News.find({
      $or: [
        { thumbnail: { $exists: false } },
        { thumbnail: null },
        { thumbnail: '' },
        { thumbnail: { $regex: /^https:\/\/via\.placeholder\.com/ } }, // Placeholder images
        { thumbnail: { $regex: /^A / } }, // Text descriptions
        { thumbnail: { $regex: /^An / } }, // Text descriptions
        { thumbnail: { $regex: /^The / } } // Text descriptions
      ],
      status: { $in: ['draft', 'published'] }
    }).sort({ createdAt: -1 }).limit(20); // Process latest 20 first
    
    logger.info(`📊 Found ${draftsWithoutImages.length} drafts without proper images\n`);
    
    if (draftsWithoutImages.length === 0) {
      logger.info('✅ No drafts need image fixes!');
      return;
    }
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const draft of draftsWithoutImages) {
      try {
        logger.info(`\n🔄 Processing: ${draft.title?.en || draft.title || 'Untitled'}`);
        logger.info(`   Status: ${draft.status}`);
        logger.info(`   Current thumbnail: ${draft.thumbnail || 'None'}`);
        
        // Skip if already has generated image metadata
        if (draft.generatedImageMetadata?.generated) {
          logger.info(`   ⏭️  Skipping - already has generated image metadata`);
          continue;
        }
        
        // Generate image using the new service
        const title = draft.title?.en || draft.title || 'News Article';
        const content = draft.content?.en || draft.content || draft.description?.en || draft.description || '';
        
        logger.info(`   🎨 Generating image for: "${title.substring(0, 50)}..."`);
        
        const imageResult = await imageGenerationService.generateImageForArticle(title, content);
        
        if (imageResult && imageResult.imageBuffer) {
          logger.info(`   ✅ Image generated successfully (${imageResult.imageBuffer.length} bytes)`);
          
                      try {
              // Upload to Cloudinary
              const base64Image = imageResult.imageBuffer.toString('base64');
              const dataURI = `data:image/png;base64,${base64Image}`;
              
              const uploadResult = await cloudinary.uploader.upload(dataURI, {
                folder: 'news/thumbnails',
                public_id: `draft-fix-${draft._id}-${Date.now()}`,
                resource_type: 'image',
                format: 'png'
              });
              
              logger.info(`   ☁️  Uploaded to Cloudinary: ${uploadResult.secure_url}`);
              
              // Update the draft
              const updateData = {
                thumbnail: uploadResult.secure_url,
                generatedImageMetadata: {
                  description: imageResult.description,
                  prompt: imageResult.prompt,
                  generated: true,
                  timestamp: imageResult.timestamp,
                  service: imageResult.service,
                  cloudinaryPublicId: uploadResult.public_id
                }
              };
              
              await News.findByIdAndUpdate(draft._id, updateData);
              
              logger.info(`   💾 Updated database record`);
              successCount++;
            } catch (uploadError) {
              logger.info(`   ❌ Cloudinary upload failed: ${uploadError.message || uploadError}`);
              // Still update with metadata even if upload fails
              const updateData = {
                generatedImageMetadata: {
                  description: imageResult.description,
                  prompt: imageResult.prompt,
                  generated: true,
                  timestamp: imageResult.timestamp,
                  service: imageResult.service,
                  uploadError: uploadError.message || uploadError.toString()
                }
              };
              
              await News.findByIdAndUpdate(draft._id, updateData);
              logger.info(`   💾 Updated with metadata (upload failed)`);
              errorCount++;
            }
          
        } else {
          logger.info(`   ❌ Failed to generate image`);
          errorCount++;
        }
        
        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (error) {
        logger.info(`   💥 Error processing draft: ${error.message}`);
        errorCount++;
      }
    }
    
    logger.info(`\n📈 Summary:`);
    logger.info(`   ✅ Successfully fixed: ${successCount} drafts`);
    logger.info(`   ❌ Errors: ${errorCount} drafts`);
    logger.info(`   📊 Total processed: ${draftsWithoutImages.length} drafts`);
    
  } catch (error) {
    logger.error('💥 Script failed:', error);
  } finally {
    process.exit(0);
  }
}

// Run the script
fixDraftImages();
