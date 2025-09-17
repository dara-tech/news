'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ExternalLink, 
  Link as LinkIcon, 
  RefreshCw, 
  Copy, 
  Check,
  Globe,
  Image as ImageIcon,
  FileText,
  Calendar
} from 'lucide-react';

interface LinkPreviewData {
  url: string;
  title: string;
  description: string;
  image: string;
  siteName: string;
  favicon: string;
  publishedTime?: string;
  author?: string;
  error?: string;
}

interface LinkPreviewProps {
  onLinkSelect?: (linkData: LinkPreviewData) => void;
  initialUrl?: string;
  className?: string;
}

export default function LinkPreview({ onLinkSelect, initialUrl = '', className = '' }: LinkPreviewProps) {
  const [url, setUrl] = useState(initialUrl);
  const [previewData, setPreviewData] = useState<LinkPreviewData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (initialUrl) {
      fetchPreview(initialUrl);
    }
  }, [initialUrl]);

  const fetchPreview = async (inputUrl: string) => {
    if (!inputUrl.trim()) return;

    // Add protocol if missing
    let fullUrl = inputUrl;
    if (!inputUrl.startsWith('http://') && !inputUrl.startsWith('https://')) {
      fullUrl = `https://${inputUrl}`;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/link-preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: fullUrl }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch link preview');
      }

      const data = await response.json();
      
      if (data.error) {
        setError(data.error);
        setPreviewData(null);
      } else {
        setPreviewData({
          url: fullUrl,
          title: data.title || 'Untitled',
          description: data.description || 'No description available',
          image: data.image || '',
          siteName: data.siteName || new URL(fullUrl).hostname,
          favicon: data.favicon || '',
          publishedTime: data.publishedTime,
          author: data.author,
        });
        setError(null);
        
        if (onLinkSelect) {
          onLinkSelect({
            url: fullUrl,
            title: data.title || 'Untitled',
            description: data.description || 'No description available',
            image: data.image || '',
            siteName: data.siteName || new URL(fullUrl).hostname,
            favicon: data.favicon || '',
            publishedTime: data.publishedTime,
            author: data.author,
          });
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch preview');
      setPreviewData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPreview(url);
  };

  const copyToClipboard = async () => {
    if (previewData) {
      await navigator.clipboard.writeText(previewData.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* URL Input */}
      <form onSubmit={handleSubmit} className="space-y-2">
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              type="url"
              placeholder="Paste a link to preview..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="pr-10"
            />
          </div>
          <Button 
            type="submit" 
            disabled={loading || !url.trim()}
            size="sm"
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <LinkIcon className="h-4 w-4" />
            )}
          </Button>
        </div>
      </form>

      {/* Error State */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Preview Card */}
      {previewData && !error && (
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="flex">
              {/* Image */}
              <div className="w-48 h-32 bg-gray-100 dark:bg-gray-800 flex-shrink-0">
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
                  <ImageIcon className="h-8 w-8 opacity-50" />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm line-clamp-2 leading-tight">
                      {previewData.title}
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">
                      {previewData.description}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyToClipboard}
                    className="ml-2 flex-shrink-0"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {/* Meta Info */}
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  {previewData.favicon && (
                    <img
                      src={previewData.favicon}
                      alt=""
                      className="w-4 h-4 rounded"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  )}
                  <span className="font-medium">{previewData.siteName}</span>
                  {previewData.publishedTime && (
                    <>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(previewData.publishedTime)}</span>
                      </div>
                    </>
                  )}
                  {previewData.author && (
                    <>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        <span>{previewData.author}</span>
                      </div>
                    </>
                  )}
                </div>

                {/* URL */}
                <div className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400">
                  <Globe className="h-3 w-3" />
                  <span className="truncate">{previewData.url}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(previewData.url, '_blank')}
                    className="h-6 w-6 p-0"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      {!previewData && !loading && !error && (
        <div className="text-center text-gray-500 py-8">
          <LinkIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Paste a URL above to see a preview</p>
          <p className="text-xs mt-1">Supports most websites and social media platforms</p>
        </div>
      )}
    </div>
  );
}
