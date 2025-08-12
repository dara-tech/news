import React, { useCallback } from 'react';
import Image from 'next/image';
import { ImageIcon, Loader2 } from 'lucide-react';
import { useImageLoader, getArticleImageUrl } from '@/hooks/useImageLoader';

interface ArticleImageProps {
  article: any;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showPlaceholder?: boolean;
}

const ArticleImage: React.FC<ArticleImageProps> = ({ 
  article, 
  size = 'md', 
  className = '',
  showPlaceholder = true 
}) => {
  const imageUrl = getArticleImageUrl(article);
  
  const handleError = useCallback(() => {
    console.warn('Failed to load image:', imageUrl);
  }, [imageUrl]);
  
  const { isLoading, hasError } = useImageLoader({ 
    src: imageUrl,
    onError: handleError
  });

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12 sm:w-16 sm:h-16',
    lg: 'w-20 h-20 sm:w-24 sm:h-24'
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  if (!imageUrl && !showPlaceholder) {
    return null;
  }

  return (
    <div className={`flex items-center justify-center rounded-md overflow-hidden bg-gray-100 ${sizeClasses[size]} ${className}`}>
      {isLoading && imageUrl && (
        <div className="flex items-center justify-center w-full h-full">
          <Loader2 className={`${iconSizes[size]} animate-spin text-gray-400`} />
        </div>
      )}
      
      {imageUrl && !isLoading && !hasError && (
        <Image
          src={imageUrl}
          alt={article.title?.en || article.title?.kh || 'Article thumbnail'}
          width={96}
          height={96}
          className="object-cover w-full h-full"
          onError={(e) => {
            // Fallback to placeholder on error
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            target.nextElementSibling?.classList.remove('hidden');
          }}
        />
      )}
      
      {(!imageUrl || hasError) && showPlaceholder && (
        <div className="flex items-center justify-center w-full h-full text-gray-400">
          <ImageIcon className={iconSizes[size]} />
        </div>
      )}
      
      {/* Fallback placeholder for image errors */}
      {imageUrl && (
        <div className={`hidden items-center justify-center w-full h-full text-gray-400 ${hasError ? 'flex' : ''}`}>
          <ImageIcon className={iconSizes[size]} />
        </div>
      )}
    </div>
  );
};

export default ArticleImage;
