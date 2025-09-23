'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGenerateContent } from '@/hooks/useGenerateContent';
import { formatArticleContent } from '@/lib/contentFormatter';

export default function ContentGenerationTest() {
  const [prompt, setPrompt] = useState('Cambodia economic growth 2024');
  const { isGenerating, error, generateContent } = useGenerateContent();
  const [generatedContent, setGeneratedContent] = useState<any>(null);

  const handleGenerate = async () => {
    const result = await generateContent(prompt);
    if (result) {
      setGeneratedContent(result);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Content Generation Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="prompt">Test Prompt</Label>
            <Input
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter a news topic to test content generation..."
            />
          </div>
          <Button onClick={handleGenerate} disabled={isGenerating}>
            {isGenerating ? 'Generating...' : 'Generate Test Content'}
          </Button>
          {error && (
            <div className="text-red-500 text-sm">
              Error: {error}
            </div>
          )}
        </CardContent>
      </Card>

      {generatedContent && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Raw Generated Content (English)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="whitespace-pre-wrap text-sm bg-gray-50 p-4 rounded border max-h-96 overflow-y-auto">
                {generatedContent.content.en}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Formatted Content (English)</CardTitle>
            </CardHeader>
            <CardContent>
              <div 
                className="prose prose-sm max-w-none max-h-96 overflow-y-auto"
                dangerouslySetInnerHTML={{ 
                  __html: formatArticleContent(generatedContent.content.en).html 
                }}
              />
            </CardContent>
          </Card>
        </div>
      )}

      {generatedContent && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Titles & Descriptions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">English Title:</h3>
              <p className="text-lg font-medium">{generatedContent.title.en}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">English Description:</h3>
              <p className="text-gray-700">{generatedContent.description.en}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Khmer Title:</h3>
              <p className="text-lg font-medium">{generatedContent.title.kh}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Khmer Description:</h3>
              <p className="text-gray-700">{generatedContent.description.kh}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
