/**
 * Image Generation Service
 * Handles automatic image generation for articles using Google Gemini
 */

import { GoogleGenAI, Modality } from '@google/genai';
import logger from '../utils/logger.mjs';

class ImageGenerationService {
  constructor() {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY or GOOGLE_API_KEY is not set in environment variables.");
    }
    this.ai = new GoogleGenAI({ apiKey });
  }

  /**
   * Generate actual image using Gemini 2.0 Flash Image Generation
   */
  async generateActualImage(prompt) {
    try {
      logger.info('Generating image with prompt:', prompt?.slice(0, 100) + '...');
      
      const response = await this.ai.models.generateContent({
        model: "gemini-2.0-flash-preview-image-generation",
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
        config: {
          responseModalities: [Modality.TEXT, Modality.IMAGE],
        },
      });

      const parts = response?.candidates?.[0]?.content?.parts;
      if (!parts) {
        throw new Error("Invalid response format from the API");
      }

      let imageData = null;
      let text = "";

      for (const part of parts) {
        if (part.text) {
          text = part.text;
        } else if (part.inlineData?.data) {
          imageData = part.inlineData.data;
        }
      }

      if (!imageData) {
        throw new Error("No image data returned from the API");
      }

      // Convert base64 to Buffer for backend storage
      const buffer = Buffer.from(imageData, 'base64');
      
      return {
        imageBuffer: buffer,
        text: text,
        generated: true,
        timestamp: new Date().toISOString(),
        service: 'gemini-2.0-flash-image-generation'
      };
    } catch (error) {
      logger.error('Error generating actual image:', error);
      return null;
    }
  }

  /**
   * Generate image description and actual image for article
   */
  async generateImageForArticle(title, content) {
    try {
      // Create a comprehensive prompt for image generation
      const prompt = `
        Create a professional news article thumbnail image.
        
        Article Title: ${title}
        Article Content: ${content?.substring(0, 300)}...
        
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
      `;

      // Generate the actual image
      const imageResult = await this.generateActualImage(prompt);
      
      if (!imageResult) {
        logger.info('Failed to generate image for article:', title?.slice(0, 50));
        return null;
      }

      return {
        imageBuffer: imageResult.imageBuffer,
        description: imageResult.text || 'AI-generated news thumbnail',
        prompt: prompt,
        generated: true,
        timestamp: new Date().toISOString(),
        service: imageResult.service
      };
    } catch (error) {
      logger.error('Error in generateImageForArticle:', error);
      return null;
    }
  }

  /**
   * Extract key visual elements from content for image generation
   */
  extractVisualElements(content) {
    try {
      // Extract key terms, locations, objects, etc. from content
      const words = content.toLowerCase().split(/\s+/);
      const visualKeywords = words.filter(word => 
        word.length > 3 && 
        !['the', 'and', 'for', 'with', 'this', 'that', 'have', 'been', 'will', 'said', 'news'].includes(word)
      );
      
      return visualKeywords.slice(0, 10); // Return top 10 visual keywords
    } catch (error) {
      logger.error('Error extracting visual elements:', error);
      return [];
    }
  }
}

export default new ImageGenerationService();


