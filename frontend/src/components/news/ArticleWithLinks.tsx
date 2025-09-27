'use client';

import React from 'react';
import LinkPreviewCard from '@/components/common/LinkPreviewCard';

interface ArticleWithLinksProps {
  content: string;
  links?: string[];
  className?: string;
}

export default function ArticleWithLinks({ 
  content, 
  links = [], 
  className = '' 
}: ArticleWithLinksProps) {
  // Simple regex to find URLs in content
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const urls = content.match(urlRegex) || [];
  const allLinks = [...new Set([...(Array.isArray(urls) ? urls : []), ...(Array.isArray(links) ? links : [])])];

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Article Content */}
      <div 
        className="prose dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ 
          __html: content.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">$1</a>')
        }}
      />
      
      {/* Link Previews */}
      {allLinks.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Related Links</h3>
          <div className="space-y-2">
            {allLinks.map((url, index) => (
              <LinkPreviewCard
                key={`${url}-${index}`}
                url={url}
                className="border border-gray-200 dark:border-gray-700"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
