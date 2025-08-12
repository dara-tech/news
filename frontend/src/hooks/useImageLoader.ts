import { useState, useEffect, useCallback, useRef } from 'react';
import { getFullImageUrl } from '@/lib/imageService';

interface UseImageLoaderOptions {
  src: string | null | undefined;
  fallbackSrc?: string;
  onError?: () => void;
  onLoad?: () => void;
}

export const useImageLoader = ({ 
  src, 
  fallbackSrc, 
  onError, 
  onLoad 
}: UseImageLoaderOptions) => {
  const [imageSrc, setImageSrc] = useState<string | null>(src || null);
  const [isLoading, setIsLoading] = useState<boolean>(!!src);
  const [hasError, setHasError] = useState<boolean>(false);
  
  // Use refs to store the latest callback functions to avoid dependency issues
  const onErrorRef = useRef(onError);
  const onLoadRef = useRef(onLoad);
  
  // Update refs when callbacks change
  useEffect(() => {
    onErrorRef.current = onError;
    onLoadRef.current = onLoad;
  }, [onError, onLoad]);

  useEffect(() => {
    if (!src) {
      setImageSrc(null);
      setIsLoading(false);
      setHasError(false);
      return;
    }

    setIsLoading(true);
    setHasError(false);
    setImageSrc(src);

    const img = new Image();
    img.onload = () => {
      setIsLoading(false);
      setHasError(false);
      onLoadRef.current?.();
    };
    img.onerror = () => {
      setIsLoading(false);
      setHasError(true);
      
      if (fallbackSrc && fallbackSrc !== src) {
        setImageSrc(fallbackSrc);
        // Try fallback image
        const fallbackImg = new Image();
        fallbackImg.onload = () => {
          setHasError(false);
          onLoadRef.current?.();
        };
        fallbackImg.onerror = () => {
          setHasError(true);
          onErrorRef.current?.();
        };
        fallbackImg.src = fallbackSrc;
      } else {
        onErrorRef.current?.();
      }
    };
    img.src = src;
  }, [src, fallbackSrc]); // Removed onError and onLoad from dependencies

  const reload = useCallback(() => {
    if (src) {
      setIsLoading(true);
      setHasError(false);
      setImageSrc(src);
    }
  }, [src]);

  return {
    imageSrc,
    isLoading,
    hasError,
    reload
  };
};

// Utility function to get the best available image from an article
export const getArticleImage = (article: any): string | null => {
  // Priority: thumbnail > first image in images array > null
  if (article.thumbnail) {
    return article.thumbnail;
  }
  
  if (article.images && Array.isArray(article.images) && article.images.length > 0) {
    return article.images[0];
  }
  
  return null;
};

export const getArticleImageUrl = (article: any): string | null => {
  const imagePath = getArticleImage(article);
  return imagePath ? getFullImageUrl(imagePath) : null;
};

// Utility function to validate image URL
export const isValidImageUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
};
