'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ExternalLink, 
  Globe,
  Image as ImageIcon,
  FileText,
  Calendar,
  Loader2
} from 'lucide-react';

interface LinkPreviewCardProps {
  url: string;
  className?: string;
  onLoad?: (data: any) => void;
  onError?: (error: string) => void;
}

interface LinkPreviewData {
  title: string;
  description: string;
  image: string;
  siteName: string;
  favicon: string;
  publishedTime?: string;
  author?: string;
}

export default function LinkPreviewCard({ 
  url, 
  className = '', 
  onLoad, 
  onError 
}: LinkPreviewCardProps) {
  const [previewData, setPreviewData] = useState<LinkPreviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!url) return;

    const fetchPreview = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/link-preview', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch preview');
        }

        const data = await response.json();
        
        if (data.error) {
          throw new Error(data.error);
        }

        setPreviewData(data);
        if (onLoad) onLoad(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load preview';
        setError(errorMessage);
        if (onError) onError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchPreview();
  }, [url, onLoad, onError]);

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <Card className={`${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span className="text-sm text-gray-500">Loading preview...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={`${className}`}>
        <CardContent className="p-4">
          <div className="text-center py-4">
            <Globe className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm text-gray-500">Failed to load preview</p>
            <p className="text-xs text-gray-400 mt-1">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!previewData) {
    return null;
  }

  return (
    <Card className={`overflow-hidden hover:shadow-md transition-shadow ${className}`}>
      <CardContent className="p-0">
        <div className="flex">
          {/* Image */}
          <div className="w-32 h-24 bg-gray-100 dark:bg-gray-800 flex-shrink-0">
            {previewData.image ? (
              <img
                src={previewData.image}
                alt={previewData.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
            ) : null}
            <div className={`w-full h-full flex items-center justify-center text-gray-500 ${previewData.image ? 'hidden' : ''}`}>
              <ImageIcon className="h-6 w-6 opacity-50" />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-3 space-y-1">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm line-clamp-2 leading-tight">
                  {previewData.title}
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">
                  {previewData.description}
                </p>
              </div>
              <button
                onClick={() => window.open(url, '_blank')}
                className="ml-2 p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                title="Open in new tab"
                aria-label="Open link in new tab"
              >
                <ExternalLink className="h-3 w-3 text-gray-500" />
              </button>
            </div>

            {/* Meta Info */}
            <div className="flex items-center gap-2 text-xs text-gray-500">
              {previewData.favicon && (
                <img
                  src={previewData.favicon}
                  alt=""
                  className="w-3 h-3 rounded"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              )}
              <span className="font-medium truncate">{previewData.siteName}</span>
              {previewData.publishedTime && (
                <>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(previewData.publishedTime)}</span>
                  </div>
                </>
              )}
            </div>

            {/* URL */}
            <div className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400">
              <Globe className="h-3 w-3" />
              <span className="truncate">{url}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
