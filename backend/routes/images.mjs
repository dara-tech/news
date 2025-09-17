import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import logger from '../utils/logger.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Serve placeholder images
router.get('/placeholder/:width?/:height?', async (req, res) => {
  try {
    const { width = 300, height = 200 } = req.params;
    const text = req.query.text || 'No Image';
    
    // Generate a simple placeholder image using a service
    const placeholderUrl = `https://via.placeholder.com/${width}x${height}/f3f4f6/9ca3af?text=${encodeURIComponent(text)}`;
    
    // Redirect to the placeholder service
    res.redirect(placeholderUrl);
  } catch (error) {
    logger.error('Placeholder image generation failed:', error);
    res.status(500).json({ error: 'Failed to generate placeholder image' });
  }
});

// Serve static images with fallback
router.get('/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    
    // Check if file exists in frontend public directory
    const frontendPublicPath = path.join(__dirname, '../../frontend/public', filename);
    const backendUploadsPath = path.join(__dirname, '../uploads', filename);
    
    let filePath = null;
    
    try {
      await fs.access(frontendPublicPath);
      filePath = frontendPublicPath;
    } catch {
      try {
        await fs.access(backendUploadsPath);
        filePath = backendUploadsPath;
      } catch {
        // File doesn't exist, return placeholder
        const placeholderUrl = `https://via.placeholder.com/300x200/f3f4f6/9ca3af?text=${encodeURIComponent('Image Not Found')}`;
        return res.redirect(placeholderUrl);
      }
    }
    
    // Set appropriate headers
    const ext = path.extname(filename).toLowerCase();
    const mimeTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.svg': 'image/svg+xml'
    };
    
    const mimeType = mimeTypes[ext] || 'application/octet-stream';
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year cache
    
    // Send the file
    res.sendFile(filePath);
  } catch (error) {
    logger.error('Image serving failed:', error);
    res.status(500).json({ error: 'Failed to serve image' });
  }
});

// Handle image optimization requests
router.get('/optimize/:width/:height/:filename', async (req, res) => {
  try {
    const { width, height, filename } = req.params;
    const quality = req.query.quality || 85;
    const format = req.query.format || 'webp';
    
    // For now, redirect to a placeholder with the requested dimensions
    // In production, you'd want to implement actual image optimization
    const placeholderUrl = `https://via.placeholder.com/${width}x${height}/f3f4f6/9ca3af?text=${encodeURIComponent('Optimized Image')}`;
    res.redirect(placeholderUrl);
  } catch (error) {
    logger.error('Image optimization failed:', error);
    res.status(500).json({ error: 'Failed to optimize image' });
  }
});

export default router;
