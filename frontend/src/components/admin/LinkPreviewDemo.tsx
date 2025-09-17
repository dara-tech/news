'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Trash2, 
  ExternalLink, 
  Copy,
  Check,
  Globe
} from 'lucide-react';
import LinkPreviewCard from '@/components/common/LinkPreviewCard';

interface LinkItem {
  id: string;
  url: string;
  title?: string;
  description?: string;
}

export default function LinkPreviewDemo() {
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [newUrl, setNewUrl] = useState('');
  const [copied, setCopied] = useState<string | null>(null);

  const addLink = () => {
    if (!newUrl.trim()) return;

    const newLink: LinkItem = {
      id: Date.now().toString(),
      url: newUrl.trim(),
    };

    setLinks([...links, newLink]);
    setNewUrl('');
  };

  const removeLink = (id: string) => {
    setLinks(links.filter(link => link.id !== id));
  };

  const copyToClipboard = async (url: string) => {
    await navigator.clipboard.writeText(url);
    setCopied(url);
    setTimeout(() => setCopied(null), 2000);
  };

  const copyAllLinks = async () => {
    const urls = links.map(link => link.url).join('\n');
    await navigator.clipboard.writeText(urls);
    setCopied('all');
    setTimeout(() => setCopied(null), 2000);
  };

  const handleLinkLoad = (id: string, data: any) => {
    setLinks(links.map(link => 
      link.id === id 
        ? { ...link, title: data.title, description: data.description }
        : link
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Link Preview Demo</h2>
          <p className="text-gray-600 dark:text-gray-300">
            Add URLs to see how they'll appear as rich previews in your content
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={copyAllLinks} 
            variant="outline" 
            size="sm"
            disabled={links.length === 0}
          >
            {copied === 'all' ? (
              <Check className="h-4 w-4 mr-2" />
            ) : (
              <Copy className="h-4 w-4 mr-2" />
            )}
            Copy All URLs
          </Button>
        </div>
      </div>

      {/* Add Link Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add Link Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="new-url">URL</Label>
              <Input
                id="new-url"
                type="url"
                placeholder="https://example.com"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addLink()}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={addLink} disabled={!newUrl.trim()}>
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Links List */}
      {links.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              Link Previews ({links.length})
            </h3>
            <Badge variant="outline">
              {links.length} link{links.length !== 1 ? 's' : ''}
            </Badge>
          </div>

          <div className="grid gap-4">
            {links.map((link) => (
              <div key={link.id} className="relative group">
                <LinkPreviewCard
                  url={link.url}
                  onLoad={(data) => handleLinkLoad(link.id, data)}
                  className="hover:shadow-lg transition-shadow"
                />
                
                {/* Actions */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => copyToClipboard(link.url)}
                      className="h-8 w-8 p-0"
                    >
                      {copied === link.url ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => window.open(link.url, '_blank')}
                      className="h-8 w-8 p-0"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => removeLink(link.id)}
                      className="h-8 w-8 p-0"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {links.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Globe className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2">No Links Added</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Add URLs above to see how they'll appear as rich previews
            </p>
            <div className="text-sm text-gray-500">
              <p>Try adding links like:</p>
              <ul className="mt-2 space-y-1">
                <li>• https://vercel.com</li>
                <li>• https://github.com</li>
                <li>• https://nextjs.org</li>
                <li>• Any news article or blog post</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Usage Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How to Use in Your Code</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">1. Import the Component</h4>
            <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm overflow-x-auto">
{`import LinkPreviewCard from '@/components/common/LinkPreviewCard';`}
            </pre>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">2. Use in Your JSX</h4>
            <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm overflow-x-auto">
{`<LinkPreviewCard 
  url="https://example.com" 
  onLoad={(data) => console.log('Preview loaded:', data)}
  onError={(error) => console.error('Preview error:', error)}
/>`}
            </pre>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">3. Features</h4>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Automatic metadata extraction (title, description, image)</li>
              <li>• OpenGraph and Twitter Card support</li>
              <li>• Responsive design</li>
              <li>• Loading and error states</li>
              <li>• Click to open in new tab</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
