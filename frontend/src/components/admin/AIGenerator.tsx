'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  Sparkles, 
  FileText, 
  Headphones, 
  Tag, 
  Languages, 
  Loader2,
  Copy,
  Check
} from 'lucide-react';
import { useAI, AIGenerationOptions } from '@/hooks/useAI';

export default function AIGenerator() {
  const [sourceContent, setSourceContent] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [options, setOptions] = useState<Partial<AIGenerationOptions>>({
    type: 'article',
    tone: 'professional',
    length: 'medium',
    style: 'news',
    model: 'gemini-pro'
  });
  const [copied, setCopied] = useState(false);

  const {
    isGenerating,
    isLoading,
    usageStats,
    generateArticle,
    generateSummary,
    generateHeadlines,
    generateKeywords,
    translateContent,
    getUsageStats
  } = useAI();

  const handleGenerate = async (type: string) => {
    if (!sourceContent.trim()) {
      return;
    }

    let result = null;

    switch (type) {
      case 'article':
        result = await generateArticle(sourceContent, options);
        break;
      case 'summary':
        result = await generateSummary(sourceContent, options);
        break;
      case 'headlines':
        const headlines = await generateHeadlines(sourceContent, 3, options);
        setGeneratedContent(headlines.join('\n\n'));
        return;
      case 'keywords':
        const keywords = await generateKeywords(sourceContent, 10, options);
        setGeneratedContent(keywords.join(', '));
        return;
      case 'translation':
        result = await translateContent(sourceContent, 'Spanish', options);
        break;
    }

    if (result) {
      setGeneratedContent(result.content);
    }
  };

  const copyToClipboard = async () => {
    if (generatedContent) {
      await navigator.clipboard.writeText(generatedContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            <CardTitle>Gemini AI Content Generator</CardTitle>
          </div>
            <Button
              variant="outline"
              size="sm"
              onClick={getUsageStats}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Usage Stats'
              )}
            </Button>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Source Content</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Content Type</Label>
                <Select 
                  value={options.type} 
                  onValueChange={(value) => setOptions({ ...options, type: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="article">Article</SelectItem>
                    <SelectItem value="summary">Summary</SelectItem>
                    <SelectItem value="headline">Headlines</SelectItem>
                    <SelectItem value="keywords">Keywords</SelectItem>
                    <SelectItem value="translation">Translation</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Gemini Model</Label>
                <Select 
                  value={options.model} 
                  onValueChange={(value) => setOptions({ ...options, model: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
                    <SelectItem value="gemini-1.5-pro">Gemini 1.5 Pro</SelectItem>
                    <SelectItem value="gemini-1.5-flash">Gemini 1.5 Flash</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Tone</Label>
                <Select 
                  value={options.tone} 
                  onValueChange={(value) => setOptions({ ...options, tone: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="formal">Formal</SelectItem>
                    <SelectItem value="friendly">Friendly</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Length</Label>
                <Select 
                  value={options.length} 
                  onValueChange={(value) => setOptions({ ...options, length: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short">Short</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="long">Long</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Source Content</Label>
              <Textarea
                value={sourceContent}
                onChange={(e) => setSourceContent(e.target.value)}
                placeholder="Paste your source content here..."
                rows={8}
                className="resize-none"
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => handleGenerate('article')}
                disabled={isGenerating || !sourceContent.trim()}
                className="flex-1"
              >
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <FileText className="h-4 w-4 mr-2" />
                )}
                Generate Article
              </Button>
              
              <Button
                onClick={() => handleGenerate('summary')}
                disabled={isGenerating || !sourceContent.trim()}
                variant="outline"
              >
                <Headphones className="h-4 w-4" />
              </Button>
              
              <Button
                onClick={() => handleGenerate('headlines')}
                disabled={isGenerating || !sourceContent.trim()}
                variant="outline"
              >
                <Tag className="h-4 w-4" />
              </Button>
              
              <Button
                onClick={() => handleGenerate('keywords')}
                disabled={isGenerating || !sourceContent.trim()}
                variant="outline"
              >
                <Languages className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Output Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Generated Content</CardTitle>
              {generatedContent && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={copyToClipboard}
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {generatedContent ? (
              <div className="space-y-4">
                <div className="bg-slate-50 rounded-lg p-4">
                  <pre className="whitespace-pre-wrap text-sm">{generatedContent}</pre>
                </div>
                
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Badge variant="outline">
                    {generatedContent.split(' ').length} words
                  </Badge>
                  <Badge variant="outline">
                    {Math.ceil(generatedContent.split(' ').length / 200)} min read
                  </Badge>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Generated content will appear here</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Usage Stats */}
      {usageStats && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Usage Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {usageStats.totalRequests}
                </div>
                <div className="text-sm text-slate-500">Total Requests</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {usageStats.totalTokens.toLocaleString()}
                </div>
                <div className="text-sm text-slate-500">Total Tokens</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  ${usageStats.cost.toFixed(2)}
                </div>
                <div className="text-sm text-slate-500">Total Cost</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {usageStats.remainingRequests}
                </div>
                <div className="text-sm text-slate-500">Remaining</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
