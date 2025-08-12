'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  useAI, 
  useGeminiPro, 
  useGeminiFlash, 
  useGeminiVision,
  GEMINI_MODELS 
} from '@/hooks/useAI';
import { Sparkles, Zap, Eye, Loader2 } from 'lucide-react';

// Example 1: Using different Gemini models
export function GeminiModelsExample() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [selectedModel, setSelectedModel] = useState('gemini-pro');
  const { generateContent, isGenerating } = useAI();

  const handleGenerate = async () => {
    if (!input.trim()) return;

    const response = await generateContent({
      prompt: input,
      options: {
        type: 'article',
        model: selectedModel as any,
        tone: 'professional'
      }
    });

    if (response) {
      setOutput(response.content);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-600" />
          Gemini Models Comparison
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Select Model</Label>
          <Select value={selectedModel} onValueChange={setSelectedModel}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {GEMINI_MODELS.map(model => (
                <SelectItem key={model.id} value={model.id}>
                  {model.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Input</Label>
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter your prompt here..."
            rows={3}
          />
        </div>

        <Button 
          onClick={handleGenerate} 
          disabled={isGenerating || !input.trim()}
          className="w-full"
        >
          {isGenerating ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Zap className="h-4 w-4 mr-2" />
          )}
          Generate with {GEMINI_MODELS.find(m => m.id === selectedModel)?.name}
        </Button>

        {output && (
          <div>
            <Label>Output</Label>
            <div className="p-4 bg-slate-50 rounded-lg">
              <pre className="whitespace-pre-wrap text-sm">{output}</pre>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Example 2: Using Gemini Pro specifically
export function GeminiProExample() {
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState('');
  const { generateContent, isGenerating } = useGeminiPro();

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    const response = await generateContent(prompt, {
      tone: 'professional',
      length: 'medium'
    });

    if (response) {
      setResult(response.content);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-blue-600" />
          Gemini Pro - High Quality Generation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Prompt</Label>
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Write a detailed article about..."
            rows={4}
          />
        </div>

        <Button 
          onClick={handleGenerate} 
          disabled={isGenerating || !prompt.trim()}
          className="w-full"
        >
          {isGenerating ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Sparkles className="h-4 w-4 mr-2" />
          )}
          Generate with Gemini Pro
        </Button>

        {result && (
          <div>
            <Label>Generated Content</Label>
            <div className="p-4 bg-blue-50 rounded-lg">
              <pre className="whitespace-pre-wrap text-sm">{result}</pre>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Example 3: Using Gemini Flash for fast responses
export function GeminiFlashExample() {
  const [content, setContent] = useState('');
  const [summary, setSummary] = useState('');
  const [keywords, setKeywords] = useState<string[]>([]);
  const { generateSummary, generateKeywords, isGenerating } = useGeminiFlash();

  const handleSummarize = async () => {
    if (!content.trim()) return;

    const summaryResponse = await generateSummary(content, {
      length: 'short'
    });

    if (summaryResponse) {
      setSummary(summaryResponse.content);
    }
  };

  const handleExtractKeywords = async () => {
    if (!content.trim()) return;

    const keywordsList = await generateKeywords(content, 8);
    setKeywords(keywordsList);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-green-600" />
          Gemini Flash - Fast Processing
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Content to Process</Label>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste content for summarization and keyword extraction..."
            rows={6}
          />
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={handleSummarize} 
            disabled={isGenerating || !content.trim()}
            variant="outline"
            className="flex-1"
          >
            Summarize
          </Button>
          <Button 
            onClick={handleExtractKeywords} 
            disabled={isGenerating || !content.trim()}
            variant="outline"
            className="flex-1"
          >
            Extract Keywords
          </Button>
        </div>

        {summary && (
          <div>
            <Label>Summary</Label>
            <div className="p-3 bg-green-50 rounded-lg">
              <p className="text-sm">{summary}</p>
            </div>
          </div>
        )}

        {keywords.length > 0 && (
          <div>
            <Label>Keywords</Label>
            <div className="flex flex-wrap gap-2">
              {keywords.map((keyword, index) => (
                <Badge key={index} variant="secondary">
                  {keyword}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Example 4: Using Gemini Vision (for future image analysis)
export function GeminiVisionExample() {
  const [imageUrl, setImageUrl] = useState('');
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState('');
  const { generateContent, isGenerating } = useGeminiVision();

  const handleAnalyzeImage = async () => {
    if (!imageUrl.trim() || !prompt.trim()) return;

    const response = await generateContent(prompt, imageUrl, {
      type: 'article'
    });

    if (response) {
      setResult(response.content);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5 text-purple-600" />
          Gemini Vision - Image Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Image URL</Label>
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="w-full p-2 border rounded-md"
          />
        </div>

        <div>
          <Label>Analysis Prompt</Label>
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe what you see in this image..."
            rows={3}
          />
        </div>

        <Button 
          onClick={handleAnalyzeImage} 
          disabled={isGenerating || !imageUrl.trim() || !prompt.trim()}
          className="w-full"
        >
          {isGenerating ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Eye className="h-4 w-4 mr-2" />
          )}
          Analyze Image
        </Button>

        {result && (
          <div>
            <Label>Analysis Result</Label>
            <div className="p-4 bg-purple-50 rounded-lg">
              <pre className="whitespace-pre-wrap text-sm">{result}</pre>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Main example component
export default function GeminiUsageExample() {
  return (
    <div className="space-y-6 p-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Google Gemini AI Examples</h1>
        <p className="text-slate-600">
          Explore different ways to use Google's Gemini AI models
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GeminiModelsExample />
        <GeminiProExample />
        <GeminiFlashExample />
        <GeminiVisionExample />
      </div>
    </div>
  );
}
