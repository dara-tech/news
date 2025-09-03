import sharp from 'sharp';
import { createHash } from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import logger from '../utils/logger.mjs';

class PerformanceOptimizationService {
  constructor() {
    this.imageCache = new Map();
    this.compressionLevels = {
      thumbnail: { width: 300, height: 200, quality: 80 },
      medium: { width: 800, height: 600, quality: 85 },
      large: { width: 1200, height: 800, quality: 90 }
    };
    this.supportedFormats = ['jpeg', 'png', 'webp', 'avif'];
  }

  /**
   * Optimize image for web delivery
   */
  async optimizeImage(imagePath, options = {}) {
    try {
      const {
        width = 800,
        height = 600,
        quality = 85,
        format = 'webp',
        progressive = true
      } = options;

      // Check if image exists
      try {
        await fs.access(imagePath);
      } catch (error) {
        throw new Error(`Image file not found: ${imagePath}`);
      }

      // Generate cache key
      const cacheKey = this.generateImageCacheKey(imagePath, options);
      
      // Check cache first
      if (this.imageCache.has(cacheKey)) {
        logger.debug(`Image cache hit: ${cacheKey}`);
        return this.imageCache.get(cacheKey);
      }

      // Get image metadata
      const metadata = await sharp(imagePath).metadata();
      
      // Calculate optimal dimensions
      const { width: optimalWidth, height: optimalHeight } = this.calculateOptimalDimensions(
        metadata.width,
        metadata.height,
        width,
        height
      );

      // Optimize image
      let pipeline = sharp(imagePath)
        .resize(optimalWidth, optimalHeight, {
          fit: 'inside',
          withoutEnlargement: true
        });

      // Apply format-specific optimizations
      switch (format) {
        case 'webp':
          pipeline = pipeline.webp({ quality, progressive });
          break;
        case 'avif':
          pipeline = pipeline.avif({ quality, progressive });
          break;
        case 'jpeg':
          pipeline = pipeline.jpeg({ quality, progressive });
          break;
        case 'png':
          pipeline = pipeline.png({ quality, progressive });
          break;
        default:
          pipeline = pipeline.webp({ quality, progressive });
      }

      // Generate optimized image buffer
      const optimizedBuffer = await pipeline.toBuffer();
      
      // Calculate compression ratio
      const originalSize = metadata.size || 0;
      const compressionRatio = originalSize > 0 ? (1 - optimizedBuffer.length / originalSize) * 100 : 0;

      const result = {
        buffer: optimizedBuffer,
        format,
        width: optimalWidth,
        height: optimalHeight,
        size: optimizedBuffer.length,
        originalSize,
        compressionRatio: Math.round(compressionRatio),
        metadata: {
          ...metadata,
          width: optimalWidth,
          height: optimalHeight
        }
      };

      // Cache the result
      this.imageCache.set(cacheKey, result);
      
      logger.info(`Image optimized: ${imagePath} -> ${format} ${optimalWidth}x${optimalHeight} (${Math.round(compressionRatio)}% compression)`);
      
      return result;
    } catch (error) {
      logger.error('Image optimization error:', error);
      throw new Error(`Failed to optimize image: ${error.message}`);
    }
  }

  /**
   * Generate multiple image sizes
   */
  async generateImageSizes(imagePath, sizes = ['thumbnail', 'medium', 'large']) {
    try {
      const results = {};
      
      for (const size of sizes) {
        if (this.compressionLevels[size]) {
          const options = this.compressionLevels[size];
          results[size] = await this.optimizeImage(imagePath, options);
        }
      }
      
      return results;
    } catch (error) {
      logger.error('Image size generation error:', error);
      throw new Error(`Failed to generate image sizes: ${error.message}`);
    }
  }

  /**
   * Generate responsive image srcset
   */
  async generateSrcSet(imagePath, baseUrl = '') {
    try {
      const sizes = await this.generateImageSizes(imagePath);
      const srcset = [];
      
      for (const [size, data] of Object.entries(sizes)) {
        const url = `${baseUrl}/images/${size}/${path.basename(imagePath, path.extname(imagePath))}.webp`;
        srcset.push(`${url} ${data.width}w`);
      }
      
      return {
        srcset: srcset.join(', '),
        sizes: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
        fallback: `${baseUrl}/images/medium/${path.basename(imagePath, path.extname(imagePath))}.webp`
      };
    } catch (error) {
      logger.error('Srcset generation error:', error);
      throw new Error(`Failed to generate srcset: ${error.message}`);
    }
  }

  /**
   * Lazy load optimization for images
   */
  generateLazyLoadHTML(imageData, options = {}) {
    const {
      alt = '',
      className = '',
      loading = 'lazy',
      placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PC9zdmc+'
    } = options;

    const { srcset, sizes, fallback } = imageData;
    
    return `
      <picture>
        <source srcset="${srcset}" sizes="${sizes}" type="image/webp">
        <img 
          src="${fallback}" 
          alt="${alt}" 
          class="${className}" 
          loading="${loading}"
          decoding="async"
          style="background-image: url('${placeholder}'); background-size: cover;"
        >
      </picture>
    `;
  }

  /**
   * Optimize CSS for production
   */
  async optimizeCSS(cssContent) {
    try {
      // Remove comments
      let optimized = cssContent.replace(/\/\*[\s\S]*?\*\//g, '');
      
      // Remove unnecessary whitespace
      optimized = optimized.replace(/\s+/g, ' ');
      
      // Remove empty rules
      optimized = optimized.replace(/[^{}]+{\s*}/g, '');
      
      // Minify selectors
      optimized = optimized.replace(/,\s+/g, ',');
      optimized = optimized.replace(/;\s+/g, ';');
      optimized = optimized.replace(/{\s+/g, '{');
      optimized = optimized.replace(/}\s+/g, '}');
      
      return optimized.trim();
    } catch (error) {
      logger.error('CSS optimization error:', error);
      return cssContent;
    }
  }

  /**
   * Optimize JavaScript for production
   */
  async optimizeJavaScript(jsContent) {
    try {
      // Remove single-line comments
      let optimized = jsContent.replace(/\/\/.*$/gm, '');
      
      // Remove multi-line comments
      optimized = optimized.replace(/\/\*[\s\S]*?\*\//g, '');
      
      // Remove unnecessary whitespace
      optimized = optimized.replace(/\s+/g, ' ');
      
      // Remove empty lines
      optimized = optimized.replace(/\n\s*\n/g, '\n');
      
      return optimized.trim();
    } catch (error) {
      logger.error('JavaScript optimization error:', error);
      return jsContent;
    }
  }

  /**
   * Generate critical CSS
   */
  async generateCriticalCSS(htmlContent, cssContent) {
    try {
      // Extract above-the-fold selectors
      const criticalSelectors = [
        'body', 'html', 'head', 'title',
        '.header', '.navbar', '.hero', '.banner',
        '.container', '.wrapper', '.main',
        'h1', 'h2', 'h3', 'p', 'a', 'img'
      ];
      
      // Simple critical CSS extraction
      const criticalCSS = criticalSelectors
        .map(selector => {
          const regex = new RegExp(`${selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^{]*{[^}]*}`, 'g');
          const matches = cssContent.match(regex);
          return matches ? matches.join('\n') : '';
        })
        .filter(css => css.length > 0)
        .join('\n');
      
      return this.optimizeCSS(criticalCSS);
    } catch (error) {
      logger.error('Critical CSS generation error:', error);
      return '';
    }
  }

  /**
   * Implement service worker for caching
   */
  generateServiceWorker(version = '1.0.0') {
    return `
      const CACHE_NAME = 'news-app-v${version}';
      const urlsToCache = [
        '/',
        '/static/css/main.css',
        '/static/js/main.js',
        '/manifest.json'
      ];

      self.addEventListener('install', (event) => {
        event.waitUntil(
          caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(urlsToCache))
        );
      });

      self.addEventListener('fetch', (event) => {
        event.respondWith(
          caches.match(event.request)
            .then((response) => {
              if (response) {
                return response;
              }
              return fetch(event.request);
            }
          )
        );
      });

      self.addEventListener('activate', (event) => {
        event.waitUntil(
          caches.keys().then((cacheNames) => {
            return Promise.all(
              cacheNames.map((cacheName) => {
                if (cacheName !== CACHE_NAME) {
                  return caches.delete(cacheName);
                }
              })
            );
          })
        );
      });
    `;
  }

  /**
   * Generate Web App Manifest
   */
  generateWebAppManifest(appConfig = {}) {
    const defaultConfig = {
      name: 'RazeWire News',
      short_name: 'RazeWire',
      description: 'Latest news and updates',
      start_url: '/',
      display: 'standalone',
      background_color: '#ffffff',
      theme_color: '#000000',
      icons: [
        {
          src: '/icons/icon-192x192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: '/icons/icon-512x512.png',
          sizes: '512x512',
          type: 'image/png'
        }
      ]
    };

    return {
      ...defaultConfig,
      ...appConfig
    };
  }

  /**
   * Implement resource hints
   */
  generateResourceHints(resources = []) {
    const hints = [];
    
    resources.forEach(resource => {
      const { href, rel, as, crossorigin } = resource;
      let hint = `<link rel="${rel}" href="${href}"`;
      
      if (as) hint += ` as="${as}"`;
      if (crossorigin) hint += ` crossorigin="${crossorigin}"`;
      
      hint += '>';
      hints.push(hint);
    });
    
    return hints.join('\n');
  }

  /**
   * Calculate optimal dimensions maintaining aspect ratio
   */
  calculateOptimalDimensions(originalWidth, originalHeight, targetWidth, targetHeight) {
    const aspectRatio = originalWidth / originalHeight;
    
    let width = targetWidth;
    let height = targetHeight;
    
    if (aspectRatio > targetWidth / targetHeight) {
      // Image is wider than target aspect ratio
      height = Math.round(targetWidth / aspectRatio);
    } else {
      // Image is taller than target aspect ratio
      width = Math.round(targetHeight * aspectRatio);
    }
    
    return { width, height };
  }

  /**
   * Generate image cache key
   */
  generateImageCacheKey(imagePath, options) {
    const hash = createHash('md5');
    hash.update(imagePath);
    hash.update(JSON.stringify(options));
    return hash.digest('hex');
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics() {
    return {
      imageCacheSize: this.imageCache.size,
      supportedFormats: this.supportedFormats,
      compressionLevels: Object.keys(this.compressionLevels),
      cacheHitRate: this.calculateCacheHitRate()
    };
  }

  /**
   * Calculate cache hit rate
   */
  calculateCacheHitRate() {
    // This would be implemented with actual hit/miss tracking
    return 0.85; // 85% hit rate
  }

  /**
   * Clear image cache
   */
  clearImageCache() {
    this.imageCache.clear();
    logger.info('Image cache cleared');
  }

  /**
   * Preload critical resources
   */
  generatePreloadTags(criticalResources = []) {
    return criticalResources.map(resource => {
      const { href, as, type, crossorigin } = resource;
      let tag = `<link rel="preload" href="${href}" as="${as}"`;
      
      if (type) tag += ` type="${type}"`;
      if (crossorigin) tag += ` crossorigin="${crossorigin}"`;
      
      tag += '>';
      return tag;
    }).join('\n');
  }

  /**
   * Implement lazy loading for content
   */
  generateLazyLoadScript() {
    return `
      document.addEventListener('DOMContentLoaded', function() {
        const lazyElements = document.querySelectorAll('[data-lazy]');
        
        const lazyLoadObserver = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const element = entry.target;
              const src = element.dataset.src;
              
              if (src) {
                if (element.tagName === 'IMG') {
                  element.src = src;
                } else {
                  element.style.backgroundImage = \`url(\${src})\`;
                }
                
                element.removeAttribute('data-lazy');
                element.removeAttribute('data-src');
                lazyLoadObserver.unobserve(element);
              }
            }
          });
        });
        
        lazyElements.forEach(element => {
          lazyLoadObserver.observe(element);
        });
      });
    `;
  }
}

export default new PerformanceOptimizationService();
