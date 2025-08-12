'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAI, useArticleGenerator, useContentOptimizer, useTranslator } from '@/hooks/useAI';

// Example 1: Basic AI Hook Usage
export function BasicAIExample() {
  const { generateArticle, isGenerating } = useAI();
  const [result, setResult] = useState('');

  const handleGenerate = async () => {
    const sourceContent = "Artificial intelligence is transforming the way we work and live...";
    const response = await generateArticle(sourceContent, {
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
        <CardTitle>Basic AI Example</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={handleGenerate} disabled={isGenerating}>
          Generate Article
        </Button>
        {result && <div className="mt-4 p-4 bg-slate-50 rounded">{result}</div>}
      </CardContent>
    </Card>
  );
}

// Example 2: Article Generator Hook
export function ArticleGeneratorExample() {
  const { generateArticle, generateHeadlines, generateKeywords } = useArticleGenerator();
  const [article, setArticle] = useState('');
  const [headlines, setHeadlines] = useState<string[]>([]);
  const [keywords, setKeywords] = useState<string[]>([]);

  const handleGenerateAll = async () => {
    const sourceContent = "Technology news about the latest developments...";
    
    // Generate article
    const articleResponse = await generateArticle(sourceContent);
    if (articleResponse) setArticle(articleResponse.content);
    
    // Generate headlines
    const headlinesList = await generateHeadlines(sourceContent, 3);
    setHeadlines(headlinesList);
    
    // Generate keywords
    const keywordsList = await generateKeywords(sourceContent, 5);
    setKeywords(keywordsList);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Article Generator Example</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={handleGenerateAll}>Generate All</Button>
        
        {article && (
          <div>
            <h4>Generated Article:</h4>
            <p className="text-sm">{article}</p>
          </div>
        )}
        
        {headlines.length > 0 && (
          <div>
            <h4>Headlines:</h4>
            <ul className="text-sm">
              {headlines.map((headline, i) => (
                <li key={i}>{headline}</li>
              ))}
            </ul>
          </div>
        )}
        
        {keywords.length > 0 && (
          <div>
            <h4>Keywords:</h4>
            <p className="text-sm">{keywords.join(', ')}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Example 3: Content Optimizer Hook
export function ContentOptimizerExample() {
  const { generateSummary, generateKeywords } = useContentOptimizer();
  const [summary, setSummary] = useState('');
  const [keywords, setKeywords] = useState<string[]>([]);

  const handleOptimize = async () => {
    const content = "This is a long article about various topics...";
    
    const summaryResponse = await generateSummary(content);
    if (summaryResponse) setSummary(summaryResponse.content);
    
    const keywordsList = await generateKeywords(content, 8);
    setKeywords(keywordsList);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Content Optimizer Example</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={handleOptimize}>Optimize Content</Button>
        
        {summary && (
          <div>
            <h4>Summary:</h4>
            <p className="text-sm">{summary}</p>
          </div>
        )}
        
        {keywords.length > 0 && (
          <div>
            <h4>Keywords:</h4>
            <p className="text-sm">{keywords.join(', ')}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Example 4: Translator Hook
export function TranslatorExample() {
  const { translateContent } = useTranslator();
  const [translated, setTranslated] = useState('');

  const handleTranslate = async () => {
    const content = "Hello, this is a test message.";
    const response = await translateContent(content, 'Spanish');
    
    if (response) {
      setTranslated(response.content);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Translator Example</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={handleTranslate}>Translate to Spanish</Button>
        
        {translated && (
          <div>
            <h4>Translated:</h4>
            <p className="text-sm">{translated}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Example 5: Advanced Usage with Custom Options
export function AdvancedAIExample() {
  const { generateContent } = useAI();
  const [result, setResult] = useState('');

  const handleCustomGeneration = async () => {
    const response = await generateContent({
      prompt: "Write a creative story about a robot learning to paint",
      options: {
        type: 'article',
        
        keywords: ['robot', 'painting', 'AI'],
        length: 'long',
        style: 'creative',
        temperature: 0.8,
        maxWords: 500
      },
      metadata: {
        category: 'creative',
        targetAudience: 'general'
      }
    });
    
    if (response) {
      setResult(response.content);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Advanced AI Example</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={handleCustomGeneration}>Generate Creative Story</Button>
        
        {result && (
          <div>
            <h4>Generated Story:</h4>
            <p className="text-sm">{result}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Main Example Component
export default function AIUsageExample() {
  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">AI Hook Usage Examples</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <BasicAIExample />
        <ArticleGeneratorExample />
        <ContentOptimizerExample />
        <TranslatorExample />
        <AdvancedAIExample />
      </div>
    </div>
  );
}
