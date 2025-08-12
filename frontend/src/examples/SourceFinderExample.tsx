'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  useSourceFinder, 
  useNewsSourceFinder, 
  useAcademicSourceFinder,
  useLocalSourceFinder 
} from '@/hooks/useSourceFinder';
import { Search, Globe, BookOpen, MapPin, Loader2, Star } from 'lucide-react';

// Example 1: Basic source finding
export function BasicSourceFinderExample() {
  const [context, setContext] = useState('');
  const [results, setResults] = useState<any>(null);
  const { findSources, isSearching } = useSourceFinder();

  const handleSearch = async () => {
    if (!context.trim()) return;

    const response = await findSources({
      context,
      options: {
        category: 'all',
        credibility: 'high',
        maxResults: 10
      }
    });

    if (response) {
      setResults(response);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5 text-blue-600" />
          Basic Source Finder
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>What kind of sources are you looking for?</Label>
          <Textarea
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="e.g., I need sources for writing about artificial intelligence and its impact on society..."
            rows={3}
          />
        </div>

        <Button 
          onClick={handleSearch} 
          disabled={isSearching || !context.trim()}
          className="w-full"
        >
          {isSearching ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Search className="h-4 w-4 mr-2" />
          )}
          Find Sources
        </Button>

        {results && (
          <div className="space-y-3">
            <h4 className="font-semibold">Found {results.suggestions.length} sources:</h4>
            {results.suggestions.map((source: any) => (
              <div key={source.id} className="border rounded p-3">
                <div className="flex items-center gap-2 mb-2">
                  <h5 className="font-medium">{source.title}</h5>
                  <Badge variant="outline">{source.credibility}</Badge>
                  <Badge variant="secondary">{source.category}</Badge>
                </div>
                <p className="text-sm text-slate-600 mb-2">{source.description}</p>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span>Relevance: {Math.round(source.relevanceScore * 100)}%</span>
                  <span>•</span>
                  <span>{source.language}</span>
                  {source.region && (
                    <>
                      <span>•</span>
                      <span>{source.region}</span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Example 2: News source finding
export function NewsSourceFinderExample() {
  const [topic, setTopic] = useState('');
  const [region, setRegion] = useState('');
  const [results, setResults] = useState<any>(null);
  const { findNewsSources, findBreakingNewsSources, isSearching } = useNewsSourceFinder();

  const handleFindNews = async () => {
    if (!topic.trim()) return;
    const response = await findNewsSources(topic, region);
    if (response) setResults(response);
  };

  const handleFindBreaking = async () => {
    const response = await findBreakingNewsSources(region);
    if (response) setResults(response);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-green-600" />
          News Source Finder
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>News Topic</Label>
          <Input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., climate change, technology, politics"
          />
        </div>

        <div>
          <Label>Region (optional)</Label>
          <Input
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            placeholder="e.g., USA, Europe, Asia"
          />
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={handleFindNews}
            disabled={isSearching || !topic.trim()}
            className="flex-1"
          >
            Find News Sources
          </Button>
          <Button 
            onClick={handleFindBreaking}
            disabled={isSearching}
            variant="outline"
          >
            Breaking News
          </Button>
        </div>

        {results && (
          <div className="space-y-3">
            <h4 className="font-semibold">News Sources:</h4>
            {results.suggestions.map((source: any) => (
              <div key={source.id} className="border rounded p-3">
                <h5 className="font-medium">{source.title}</h5>
                <p className="text-sm text-slate-600">{source.description}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline">{source.frequency}</Badge>
                  <Badge variant="secondary">{source.region}</Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Example 3: Academic source finding
export function AcademicSourceFinderExample() {
  const [researchTopic, setResearchTopic] = useState('');
  const [results, setResults] = useState<any>(null);
  const { findResearchSources, findPeerReviewedSources, isSearching } = useAcademicSourceFinder();

  const handleFindResearch = async () => {
    if (!researchTopic.trim()) return;
    const response = await findResearchSources(researchTopic);
    if (response) setResults(response);
  };

  const handleFindPeerReviewed = async () => {
    if (!researchTopic.trim()) return;
    const response = await findPeerReviewedSources(researchTopic);
    if (response) setResults(response);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-purple-600" />
          Academic Source Finder
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Research Topic</Label>
          <Input
            value={researchTopic}
            onChange={(e) => setResearchTopic(e.target.value)}
            placeholder="e.g., machine learning, quantum physics, climate science"
          />
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={handleFindResearch}
            disabled={isSearching || !researchTopic.trim()}
            className="flex-1"
          >
            Find Research Sources
          </Button>
          <Button 
            onClick={handleFindPeerReviewed}
            disabled={isSearching || !researchTopic.trim()}
            variant="outline"
          >
            Peer-Reviewed Only
          </Button>
        </div>

        {results && (
          <div className="space-y-3">
            <h4 className="font-semibold">Academic Sources:</h4>
            {results.suggestions.map((source: any) => (
              <div key={source.id} className="border rounded p-3">
                <h5 className="font-medium">{source.title}</h5>
                <p className="text-sm text-slate-600">{source.description}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline">Academic</Badge>
                  <Badge variant="secondary">{source.frequency}</Badge>
                  <Star className="h-3 w-3 text-yellow-500" />
                  <span className="text-xs text-slate-500">High credibility</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Example 4: Local source finding
export function LocalSourceFinderExample() {
  const [region, setRegion] = useState('');
  const [topics, setTopics] = useState('');
  const [results, setResults] = useState<any>(null);
  const { findLocalNewsSources, findRegionalSources, isSearching } = useLocalSourceFinder();

  const handleFindLocal = async () => {
    if (!region.trim()) return;
    const response = await findLocalNewsSources(region);
    if (response) setResults(response);
  };

  const handleFindRegional = async () => {
    if (!region.trim() || !topics.trim()) return;
    const topicList = topics.split(',').map(t => t.trim());
    const response = await findRegionalSources(region, topicList);
    if (response) setResults(response);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-orange-600" />
          Local Source Finder
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Region</Label>
          <Input
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            placeholder="e.g., New York, California, London"
          />
        </div>

        <div>
          <Label>Topics (optional)</Label>
          <Input
            value={topics}
            onChange={(e) => setTopics(e.target.value)}
            placeholder="e.g., local news, community events, regional development"
          />
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={handleFindLocal}
            disabled={isSearching || !region.trim()}
            className="flex-1"
          >
            Find Local News
          </Button>
          <Button 
            onClick={handleFindRegional}
            disabled={isSearching || !region.trim() || !topics.trim()}
            variant="outline"
          >
            Regional Sources
          </Button>
        </div>

        {results && (
          <div className="space-y-3">
            <h4 className="font-semibold">Local Sources:</h4>
            {results.suggestions.map((source: any) => (
              <div key={source.id} className="border rounded p-3">
                <h5 className="font-medium">{source.title}</h5>
                <p className="text-sm text-slate-600">{source.description}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline">{source.region}</Badge>
                  <Badge variant="secondary">{source.frequency}</Badge>
                  <MapPin className="h-3 w-3 text-orange-500" />
                  <span className="text-xs text-slate-500">Local coverage</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Main example component
export default function SourceFinderExample() {
  return (
    <div className="space-y-6 p-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">AI Source Finder Examples</h1>
        <p className="text-slate-600">
          Discover how to find relevant content sources using AI-powered context analysis
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BasicSourceFinderExample />
        <NewsSourceFinderExample />
        <AcademicSourceFinderExample />
        <LocalSourceFinderExample />
      </div>
    </div>
  );
}
