'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, ExternalLink, Share2 } from 'lucide-react';
import OpenGraphPreview from './OpenGraphPreview';

interface Article {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  author?: {
    name?: string;
    username?: string;
  };
  createdAt: string;
  category?: {
    name: string;
  };
  tags?: string[];
  slug: string;
}

export default function OpenGraphDemo() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [customTitle, setCustomTitle] = useState('');
  const [customDescription, setCustomDescription] = useState('');
  const [customImage, setCustomImage] = useState('');

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/news?limit=10');
      if (response.ok) {
        const data = await response.json();
        setArticles(data.articles || []);
        if (data.articles && data.articles.length > 0) {
          setSelectedArticle(data.articles[0]);
          setCustomTitle(data.articles[0].title);
          setCustomDescription(data.articles[0].description);
          setCustomImage(data.articles[0].thumbnail || '');
        }
      }
    } catch (error) {
      console.error('Failed to load articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleArticleChange = (articleId: string) => {
    const article = articles.find(a => a.id === articleId);
    if (article) {
      setSelectedArticle(article);
      setCustomTitle(article.title);
      setCustomDescription(article.description);
      setCustomImage(article.thumbnail || '');
    }
  };

  const getPreviewData = () => {
    if (!selectedArticle) return null;

    return {
      title: customTitle || selectedArticle.title,
      description: customDescription || selectedArticle.description,
      image: customImage || selectedArticle.thumbnail || 'https://www.razewire.online/og-image.svg',
      siteName: 'Razewire',
      url: `https://www.razewire.online/en/news/${selectedArticle.slug}`,
    };
  };

  const testOpenGraph = async () => {
    if (!selectedArticle) return;

    try {
      // Test with Facebook Debugger
      const facebookUrl = `https://developers.facebook.com/tools/debug/?q=${encodeURIComponent(getPreviewData()?.url || '')}`;
      window.open(facebookUrl, '_blank');

      // Test with Twitter Card Validator
      const twitterUrl = `https://cards-dev.twitter.com/validator?url=${encodeURIComponent(getPreviewData()?.url || '')}`;
      window.open(twitterUrl, '_blank');
    } catch (error) {
      console.error('Failed to open test tools:', error);
    }
  };

  const shareArticle = async () => {
    if (!selectedArticle) return;

    const shareData = {
      title: customTitle || selectedArticle.title,
      text: customDescription || selectedArticle.description,
      url: getPreviewData()?.url || '',
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(shareData.url);
      alert('Article URL copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading articles...</span>
      </div>
    );
  }

  const previewData = getPreviewData();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">OpenGraph Demo</h2>
          <p className="text-gray-600 dark:text-gray-300">
            Test how your articles will look when shared on social media
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadArticles} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={testOpenGraph} variant="outline" size="sm">
            <ExternalLink className="h-4 w-4 mr-2" />
            Test Tools
          </Button>
          <Button onClick={shareArticle} size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Article Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Article</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="article-select">Choose an article</Label>
              <Select
                value={selectedArticle?.id || ''}
                onValueChange={handleArticleChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an article" />
                </SelectTrigger>
                <SelectContent>
                  {articles.map((article) => (
                    <SelectItem key={article.id} value={article.id}>
                      <div className="flex items-center gap-2">
                        <span className="truncate max-w-[300px]">
                          {article.title}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {article.category?.name || 'News'}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedArticle && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="custom-title">Custom Title (optional)</Label>
                  <Input
                    id="custom-title"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    placeholder="Override article title"
                  />
                </div>

                <div>
                  <Label htmlFor="custom-description">Custom Description (optional)</Label>
                  <Textarea
                    id="custom-description"
                    value={customDescription}
                    onChange={(e) => setCustomDescription(e.target.value)}
                    rows={3}
                    placeholder="Override article description"
                  />
                </div>

                <div>
                  <Label htmlFor="custom-image">Custom Image URL (optional)</Label>
                  <Input
                    id="custom-image"
                    value={customImage}
                    onChange={(e) => setCustomImage(e.target.value)}
                    placeholder="Override article image"
                  />
                </div>

                <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                  <p><strong>Article Info:</strong></p>
                  <p>• Author: {selectedArticle.author?.name || selectedArticle.author?.username || 'Unknown'}</p>
                  <p>• Published: {new Date(selectedArticle.createdAt).toLocaleDateString()}</p>
                  <p>• Category: {selectedArticle.category?.name || 'News'}</p>
                  <p>• Tags: {selectedArticle.tags?.join(', ') || 'None'}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Social Media Preview</CardTitle>
          </CardHeader>
          <CardContent>
            {previewData ? (
              <div className="space-y-4">
                <OpenGraphPreview
                  title={previewData.title}
                  description={previewData.description}
                  image={previewData.image}
                  siteName={previewData.siteName}
                  url={previewData.url}
                  type="facebook"
                />
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                Select an article to see the preview
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Multiple Platform Previews */}
      {previewData && (
        <Card>
          <CardHeader>
            <CardTitle>Platform Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <OpenGraphPreview
                title={previewData.title}
                description={previewData.description}
                image={previewData.image}
                siteName={previewData.siteName}
                url={previewData.url}
                type="facebook"
              />
              <OpenGraphPreview
                title={previewData.title}
                description={previewData.description}
                image={previewData.image}
                siteName={previewData.siteName}
                url={previewData.url}
                type="twitter"
              />
              <OpenGraphPreview
                title={previewData.title}
                description={previewData.description}
                image={previewData.image}
                siteName={previewData.siteName}
                url={previewData.url}
                type="linkedin"
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
