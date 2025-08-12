// Image service for handling image fetching and processing

export interface ImageInfo {
  url: string;
  alt?: string;
  width?: number;
  height?: number;
  format?: string;
  size?: number;
}

export interface ImageFetchOptions {
  timeout?: number;
  retries?: number;
  fallbackUrl?: string;
}

/**
 * Fetch image information from a URL
 */
export const fetchImageInfo = async (
  url: string, 
  options: ImageFetchOptions = {}
): Promise<ImageInfo | null> => {
  const { timeout = 5000, retries = 2 } = options;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      const response = await fetch(url, {
        method: 'HEAD',
        signal: controller.signal,
        mode: 'cors'
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const contentType = response.headers.get('content-type');
      const contentLength = response.headers.get('content-length');
      
      return {
        url,
        format: contentType?.split('/')[1] || 'unknown',
        size: contentLength ? parseInt(contentLength) : undefined
      };
    } catch (error) {
      console.warn(`Image fetch attempt ${attempt + 1} failed for ${url}:`, error);
      
      if (attempt === retries) {
        return null;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
    }
  }
  
  return null;
};

/**
 * Validate if a URL is a valid image URL
 */
export const isValidImageUrl = (url: string): boolean => {
  if (!url) return false;
  
  try {
    const urlObj = new URL(url);
    const validProtocols = ['http:', 'https:'];
    const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'];
    
    if (!validProtocols.includes(urlObj.protocol)) {
      return false;
    }
    
    const pathname = urlObj.pathname.toLowerCase();
    return validExtensions.some(ext => pathname.endsWith(ext));
  } catch {
    return false;
  }
};

/**
 * Get image dimensions from a URL
 */
export const getImageDimensions = (url: string): Promise<{ width: number; height: number } | null> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    
    img.onerror = () => {
      resolve(null);
    };
    
    img.src = url;
  });
};

/**
 * Preload an image
 */
export const preloadImage = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => resolve(img);
    img.onerror = reject;
    
    img.src = url;
  });
};

/**
 * Get the best quality image from a list of URLs
 */
export const getBestQualityImage = async (urls: string[]): Promise<string | null> => {
  if (!urls.length) return null;
  
  const imageInfos = await Promise.all(
    urls.map(url => fetchImageInfo(url))
  );
  
  // Filter out failed fetches and sort by size (larger = better quality)
  const validInfos = imageInfos
    .filter((info): info is ImageInfo => info !== null)
    .sort((a, b) => (b.size || 0) - (a.size || 0));
  
  return validInfos.length > 0 ? validInfos[0].url : null;
};

/**
 * Generate a placeholder image URL
 */
export const generatePlaceholderUrl = (
  width: number = 300, 
  height: number = 200, 
  text: string = 'No Image'
): string => {
  const encodedText = encodeURIComponent(text);
  return `https://via.placeholder.com/${width}x${height}/f3f4f6/9ca3af?text=${encodedText}`;
};

/**
 * Convert local file path to full URL
 */
export const getFullImageUrl = (path: string, baseUrl?: string): string => {
  if (!path) return '';
  
  // If it's already a full URL, return as is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // If it's a relative path, prepend base URL
  if (path.startsWith('/')) {
    return `${baseUrl || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${path}`;
  }
  
  // If it's a relative path without leading slash
  return `${baseUrl || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/${path}`;
};
