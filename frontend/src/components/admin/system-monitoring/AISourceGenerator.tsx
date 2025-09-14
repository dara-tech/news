'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Sparkles, 
  Search, 
  Plus, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  Globe,
  Newspaper,
  Rss,
  Settings,
  CheckSquare,
  Square
} from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { 
  generateNewsSources, 
  generateDemoSources, 
  isSourceAIAvailable,
  getSourceRateLimitStatus,
  getSourceServiceHealth,
  type GeneratedSource,
  type SourceGenerationOptions,
  type SourceGenerationResponse
} from '@/lib/sourceAIService';

interface AISource {
  id: string;
  title: string;
  url: string;
  description: string;
  type: 'rss' | 'api' | 'scraper' | 'manual';
  category: 'local' | 'international' | 'tech' | 'development' | 'academic';
  credibility: 'high' | 'medium' | 'low';
  language: string;
  region: string;
  tags: string[];
  relevanceScore: number;
  metadata?: any;
}

interface AISourceGeneratorProps {
  onSourceGenerated: (source: AISource | AISource[]) => void;
  onClose: () => void;
}

export default function AISourceGenerator({ onSourceGenerated, onClose }: AISourceGeneratorProps) {
  const [context, setContext] = useState('');
  const [keywords, setKeywords] = useState('');
  const [topics, setTopics] = useState('');
  const [requirements, setRequirements] = useState('');
  const [category, setCategory] = useState('');
  const [credibility, setCredibility] = useState('');
  const [maxResults, setMaxResults] = useState(10);
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState<AISource[]>([]);
  const [selectedSources, setSelectedSources] = useState<AISource[]>([]);

  const generateSources = async () => {
    if (!context.trim()) {
      toast.error('Please provide a context for source generation');
      return;
    }

    setIsGenerating(true);
    try {
      let response: SourceGenerationResponse;
      
      if (isSourceAIAvailable()) {
        // Use real AI service
        const options: SourceGenerationOptions = {
          category: category || 'general',
          language: 'en',
          region: 'global',
          quality: credibility === 'high' ? 'high' : credibility === 'medium' ? 'medium' : 'low',
          count: maxResults,
          includeRSS: true,
          includeWebsites: true,
          includeSocial: false
        };
        
        response = await generateNewsSources(context.trim(), options);
      } else {
        // Use demo mode
        response = await generateDemoSources(context.trim());
      }

      // Convert GeneratedSource to AISource format
      const convertedSources: AISource[] = response.sources.map(source => ({
        id: source.id,
        title: source.name,
        url: source.url,
        description: source.description,
        type: source.type === 'rss' ? 'rss' : source.type === 'website' ? 'scraper' : 'api',
        category: source.category as any,
        credibility: source.reliability,
        language: source.language,
        region: source.region,
        tags: source.tags,
        relevanceScore: source.metadata.credibility || 0.8,
        metadata: source.metadata
      }));

      setSuggestions(convertedSources);
      toast.success(`Generated ${convertedSources.length} sources for "${context}"`);
    } catch (error: any) {
      console.error('Source generation error:', error);
      toast.error(error?.message || 'Failed to generate sources');
    } finally {
      setIsGenerating(false);
    }
  };

  const addSelectedSources = () => {
    if (selectedSources.length === 0) {
      toast.error('Please select at least one source');
      return;
    }

    console.log('🔄 [AISourceGenerator] Adding selected sources:', {
      count: selectedSources.length,
      sources: selectedSources.map(s => ({ id: s.id, title: s.title }))
    });

    // Add all selected sources at once
    onSourceGenerated(selectedSources);

    toast.success(`Added ${selectedSources.length} sources`);
    setSelectedSources([]);
    setSuggestions([]);
    onClose();
  };

  const toggleSourceSelection = (source: AISource) => {
    setSelectedSources(prev => 
      prev.find(s => s.id === source.id)
        ? prev.filter(s => s.id !== source.id)
        : [...prev, source]
    );
  };

  const selectAllSources = () => {
    setSelectedSources([...suggestions]);
    toast.success(`Selected all ${suggestions.length} sources`);
  };

  const deselectAllSources = () => {
    setSelectedSources([]);
    toast.success('Deselected all sources');
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === 'a' && suggestions.length > 0) {
        event.preventDefault();
        selectAllSources();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [suggestions.length]);

  const getSourceIcon = (type: string) => {
    switch (type) {
      case 'rss': return <Rss className="h-4 w-4" />;
      case 'api': return <Globe className="h-4 w-4" />;
      case 'scraper': return <Newspaper className="h-4 w-4" />;
      default: return <Settings className="h-4 w-4" />;
    }
  };


  const rateLimitStatus = getSourceRateLimitStatus();
  const serviceHealth = getSourceServiceHealth();

  return (
    <Card className="border-border/30 shadow-none backdrop-blur-sm">
      <CardHeader className="pb-4 border-b">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base font-medium">
              <Sparkles className="h-4 w-4" />
              AI Source Generator
            </CardTitle>
            <CardDescription className="text-sm mt-1">
              Generate relevant content sources using AI
            </CardDescription>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            ×
          </Button>
        </div>
        
        {/* Minimalist AI Status Indicator */}
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between px-3 py-2 rounded-lg border">
            <div className="flex items-center gap-2">
              {serviceHealth.isHealthy ? (
                <div className="h-2 w-2 bg-foreground/60 rounded-full" />
              ) : (
                <div className="h-2 w-2 bg-foreground/30 rounded-full" />
              )}
              <span className="text-sm font-medium">
                {serviceHealth.message}
              </span>
            </div>
            <div className="text-sm opacity-60">
              {rateLimitStatus.requestsThisHour}/{rateLimitStatus.maxRequestsPerHour}
            </div>
          </div>
          
          {serviceHealth.consecutiveFailures > 0 && (
            <div className="px-3 py-2 border rounded-lg">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-foreground/30 rounded-full" />
                <span className="text-sm opacity-75">
                  {serviceHealth.consecutiveFailures} recent failures. 
                  {serviceHealth.usingDemoMode ? ' Using demo mode.' : ' Retrying with backoff.'}
                </span>
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6 pt-6">
        {/* Input Form */}
        <div className="space-y-5">
          <div>
            <Label className="text-sm font-medium mb-2 block">Context *</Label>
            <Textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Describe what type of content you're looking for (e.g., 'Technology news about AI and machine learning')"
              className="h-24 text-sm resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">Keywords</Label>
              <Input
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="AI, machine learning, technology"
                className="h-10 text-sm"
              />
            </div>
            <div>
              <Label className="text-sm font-medium mb-2 block">Topics</Label>
              <Input
                value={topics}
                onChange={(e) => setTopics(e.target.value)}
                placeholder="artificial intelligence, robotics, innovation"
                className="h-10 text-sm"
              />
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium mb-2 block">Requirements</Label>
            <Input
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              placeholder="real-time updates, high credibility, free access"
              className="h-10 text-sm"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="h-10 text-sm">
                  <SelectValue placeholder="Any category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="local">Local News</SelectItem>
                  <SelectItem value="international">International</SelectItem>
                  <SelectItem value="tech">Technology</SelectItem>
                  <SelectItem value="development">Development</SelectItem>
                  <SelectItem value="academic">Academic</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium mb-2 block">Credibility</Label>
              <Select value={credibility} onValueChange={setCredibility}>
                <SelectTrigger className="h-10 text-sm">
                  <SelectValue placeholder="Any credibility" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium mb-2 block">Max Results</Label>
              <Input
                type="number"
                value={maxResults}
                onChange={(e) => setMaxResults(Number(e.target.value))}
                min="1"
                max="50"
                className="h-10 text-sm"
              />
            </div>
          </div>

          <Button
            onClick={generateSources}
            disabled={isGenerating || !context.trim()}
            className="w-full h-12 border-0 font-medium"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating Sources...
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Generate Sources
              </>
            )}
          </Button>
        </div>

        {/* Generated Sources */}
        {suggestions.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h4 className="text-base font-medium">Generated Sources ({suggestions.length})</h4>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {selectedSources.length === suggestions.length && suggestions.length > 0 ? (
                    <CheckSquare className="h-4 w-4" />
                  ) : (
                    <Square className="h-4 w-4 opacity-40" />
                  )}
                  <span className={`text-sm ${selectedSources.length === suggestions.length && suggestions.length > 0 ? 'font-medium' : 'opacity-75'}`}>
                    {selectedSources.length} selected
                    {selectedSources.length === suggestions.length && suggestions.length > 0 && ' (All)'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={selectAllSources}
                    disabled={suggestions.length === 0 || selectedSources.length === suggestions.length}
                    className="text-sm"
                    title="Select all sources (Ctrl+A)"
                  >
                    Select All
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={deselectAllSources}
                    disabled={selectedSources.length === 0}
                    className="text-sm"
                  >
                    Deselect All
                  </Button>
                </div>
                <Button
                  size="sm"
                  onClick={addSelectedSources}
                  disabled={selectedSources.length === 0}
                  className="border-0"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Selected
                </Button>
              </div>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {suggestions.map((source) => (
                <Card
                  key={source.id}
                  className={`cursor-pointer transition-all duration-200 ${
                    selectedSources.find(s => s.id === source.id)
                      ? 'ring-2 ring-green-500  m-2'
                      : ''
                  }`}
                  onClick={() => toggleSourceSelection(source)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex items-center gap-3">
                        {getSourceIcon(source.type)}
                        <div className="flex items-center gap-1">
                          {selectedSources.find(s => s.id === source.id) ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <div className="h-4 w-4 border rounded" />
                          )}
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h5 className="font-medium text-sm truncate">{source.title}</h5>
                          <Badge variant="outline" className="text-xs">
                            {source.credibility}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {source.category}
                          </Badge>
                        </div>
                        
                        <p className="text-sm opacity-75 mb-3 line-clamp-2">
                          {source.description}
                        </p>
                        
                        <div className="flex items-center gap-3 text-sm opacity-60">
                          <span className="truncate">{source.url}</span>
                          <span>•</span>
                          <span>{Math.round(source.relevanceScore * 100)}% match</span>
                        </div>
                        
                        {source.tags && source.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {source.tags.slice(0, 3).map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {source.tags.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{source.tags.length - 3} more
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
