'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  Search, 
  Globe, 
  BookOpen, 
  MapPin, 
  Star, 
  Clock, 
  TrendingUp,
  Loader2,
  ExternalLink,
  Heart,
  HeartOff,
  Filter,
  Target,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react';
import { 
  useSourceFinder, 
  useNewsSourceFinder, 
  useAcademicSourceFinder,
  useLocalSourceFinder,
  SourceFinderOptions,
  SourceSuggestion 
} from '@/hooks/useSourceFinder';

export default function SourceFinder() {
  const [context, setContext] = useState('');
  const [keywords, setKeywords] = useState('');
  const [region, setRegion] = useState('');
  const [topic, setTopic] = useState('');
  const [contentType, setContentType] = useState('');
  const [options, setOptions] = useState<Partial<SourceFinderOptions>>({
    category: 'all',
    credibility: 'high',
    maxResults: 20,
    sortBy: 'relevance'
  });

  const {
    isSearching,
    isAnalyzing,
    searchHistory,
    favoriteSources,
    findSources,
    findSourcesByTopic,
    findSourcesByKeywords,
    findSourcesForContent,
    analyzeSource,
    validateSource,
    addToFavorites,
    removeFromFavorites,
    clearHistory
  } = useSourceFinder();

  const { findNewsSources, findBreakingNewsSources } = useNewsSourceFinder();
  const { findResearchSources, findPeerReviewedSources } = useAcademicSourceFinder();
  const { findLocalNewsSources, findRegionalSources } = useLocalSourceFinder();

  const [results, setResults] = useState<any>(null);
  const [selectedSource, setSelectedSource] = useState<SourceSuggestion | null>(null);
  const [sourceAnalysis, setSourceAnalysis] = useState<any>(null);

  const handleFindSources = async () => {
    if (!context.trim()) return;

    const request = {
      context,
      keywords: keywords.split(',').map(k => k.trim()).filter(k => k),
      options: {
        ...options,
        region: region || undefined
      }
    };

    const response = await findSources(request);
    if (response) {
      setResults(response);
    }
  };

  const handleFindByTopic = async () => {
    if (!topic.trim()) return;
    const response = await findSourcesByTopic(topic, options);
    if (response) {
      setResults(response);
    }
  };

  const handleFindByKeywords = async () => {
    if (!keywords.trim()) return;
    const keywordList = keywords.split(',').map(k => k.trim()).filter(k => k);
    const response = await findSourcesByKeywords(keywordList, options);
    if (response) {
      setResults(response);
    }
  };

  const handleFindForContent = async () => {
    if (!context.trim() || !contentType.trim()) return;
    const response = await findSourcesForContent(context, contentType, options);
    if (response) {
      setResults(response);
    }
  };

  const handleAnalyzeSource = async (source: SourceSuggestion) => {
    setSelectedSource(source);
    const analysis = await analyzeSource(source.id);
    if (analysis) {
      setSourceAnalysis(analysis);
    }
  };

  const handleValidateSource = async (url: string) => {
    const validation = await validateSource(url);
    if (validation) {
      console.log('Source validation:', validation);
    }
  };

  const getCredibilityColor = (credibility: string) => {
    switch (credibility) {
      case 'high': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'news': return 'text-blue-600 bg-blue-50';
      case 'academic': return 'text-purple-600 bg-purple-50';
      case 'tech': return 'text-green-600 bg-green-50';
      case 'government': return 'text-orange-600 bg-orange-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const isFavorite = (sourceId: string) => {
    return favoriteSources.some(s => s.id === sourceId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5 text-blue-600" />
                AI Source Finder
              </CardTitle>
              <CardDescription>
                Discover relevant content sources using AI-powered context analysis
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={clearHistory}
                disabled={searchHistory.length === 0}
              >
                Clear History
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setResults(null)}
                disabled={!results}
              >
                Clear Results
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Search Panel */}
        <div className="lg:col-span-1 space-y-6">
          <Tabs defaultValue="context" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="context">Context</TabsTrigger>
              <TabsTrigger value="topic">Topic</TabsTrigger>
              <TabsTrigger value="keywords">Keywords</TabsTrigger>
            </TabsList>

            <TabsContent value="context" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Find by Context</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Context Description</Label>
                    <Textarea
                      value={context}
                      onChange={(e) => setContext(e.target.value)}
                      placeholder="Describe what kind of sources you're looking for..."
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label>Keywords (optional)</Label>
                    <Input
                      value={keywords}
                      onChange={(e) => setKeywords(e.target.value)}
                      placeholder="keyword1, keyword2, keyword3"
                    />
                  </div>

                  <div>
                    <Label>Region (optional)</Label>
                    <Input
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                      placeholder="e.g., New York, USA, Europe"
                    />
                  </div>

                  <Button 
                    onClick={handleFindSources} 
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
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="topic" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Find by Topic</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Topic</Label>
                    <Input
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="e.g., artificial intelligence, climate change"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Button 
                      onClick={handleFindByTopic}
                      disabled={isSearching || !topic.trim()}
                      variant="outline"
                    >
                      Find Sources
                    </Button>
                    <Button 
                      onClick={() => findNewsSources(topic, region)}
                      disabled={isSearching || !topic.trim()}
                      variant="outline"
                    >
                      News Only
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="keywords" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Find by Keywords</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Keywords</Label>
                    <Input
                      value={keywords}
                      onChange={(e) => setKeywords(e.target.value)}
                      placeholder="keyword1, keyword2, keyword3"
                    />
                  </div>

                  <Button 
                    onClick={handleFindByKeywords}
                    disabled={isSearching || !keywords.trim()}
                    className="w-full"
                  >
                    Find by Keywords
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                onClick={() => findBreakingNewsSources(region)}
                disabled={isSearching}
                variant="outline"
                className="w-full justify-start"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Breaking News Sources
              </Button>

              <Button 
                onClick={() => findResearchSources(topic || 'technology')}
                disabled={isSearching}
                variant="outline"
                className="w-full justify-start"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Research Sources
              </Button>

              <Button 
                onClick={() => findLocalNewsSources(region || 'local')}
                disabled={isSearching}
                variant="outline"
                className="w-full justify-start"
              >
                <MapPin className="h-4 w-4 mr-2" />
                Local News Sources
              </Button>
            </CardContent>
          </Card>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Category</Label>
                <Select 
                  value={options.category} 
                  onValueChange={(value) => setOptions({ ...options, category: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="news">News</SelectItem>
                    <SelectItem value="academic">Academic</SelectItem>
                    <SelectItem value="blog">Blog</SelectItem>
                    <SelectItem value="social">Social Media</SelectItem>
                    <SelectItem value="government">Government</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Credibility</Label>
                <Select 
                  value={options.credibility} 
                  onValueChange={(value) => setOptions({ ...options, credibility: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Sort By</Label>
                <Select 
                  value={options.sortBy} 
                  onValueChange={(value) => setOptions({ ...options, sortBy: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Relevance</SelectItem>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="credibility">Credibility</SelectItem>
                    <SelectItem value="popularity">Popularity</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Max Results</Label>
                <Select 
                  value={options.maxResults?.toString()} 
                  onValueChange={(value) => setOptions({ ...options, maxResults: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="30">30</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Results */}
          {results && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Found Sources ({results.suggestions.length})</CardTitle>
                    <CardDescription>
                      Search time: {results.metadata.searchTime}ms
                    </CardDescription>
                  </div>
                  <Badge variant="outline">
                    {results.metadata.totalFound} total found
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {results.suggestions.map((source: any) => (
                    <div key={source.id} className="border rounded-lg p-4 hover:bg-slate-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg truncate">{source.title}</h3>
                            <Badge className={getCredibilityColor(source.credibility)}>
                              {source.credibility}
                            </Badge>
                            <Badge className={getCategoryColor(source.category)}>
                              {source.category}
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-slate-600 mb-2">{source.description}</p>
                          
                          <div className="flex items-center gap-4 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <Globe className="h-3 w-3" />
                              {source.language}
                            </span>
                            {source.region && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {source.region}
                              </span>
                            )}
                            {source.frequency && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {source.frequency}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Target className="h-3 w-3" />
                              {Math.round(source.relevanceScore * 100)}% relevant
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-1 mt-2">
                            {source.tags.slice(0, 5).map((tag: any, index: any) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 ml-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(source.url, '_blank')}
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAnalyzeSource(source)}
                          >
                            <Info className="h-3 w-3" />
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => isFavorite(source.id) 
                              ? removeFromFavorites(source.id)
                              : addToFavorites(source)
                            }
                          >
                            {isFavorite(source.id) ? (
                              <HeartOff className="h-3 w-3 text-red-500" />
                            ) : (
                              <Heart className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Source Analysis */}
          {selectedSource && sourceAnalysis && (
            <Card>
              <CardHeader>
                <CardTitle>Source Analysis: {selectedSource.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Content Quality</Label>
                    <div className="text-2xl font-bold text-blue-600">
                      {sourceAnalysis.analysis.contentQuality}%
                    </div>
                  </div>
                  <div>
                    <Label>Update Frequency</Label>
                    <div className="text-sm">{sourceAnalysis.analysis.updateFrequency}</div>
                  </div>
                </div>

                <div>
                  <Label>Credibility Factors</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {sourceAnalysis.analysis.credibilityFactors.map((factor: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        {factor}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Strengths</Label>
                    <ul className="text-sm space-y-1 mt-2">
                      {sourceAnalysis.analysis.strengths.map((strength: string, index: number) => (
                        <li key={index} className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <Label>Weaknesses</Label>
                    <ul className="text-sm space-y-1 mt-2">
                      {sourceAnalysis.analysis.weaknesses.map((weakness: string, index: number) => (
                        <li key={index} className="flex items-center gap-2">
                          <AlertTriangle className="h-3 w-3 text-yellow-500" />
                          {weakness}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div>
                  <Label>Recommendations</Label>
                  <ul className="text-sm space-y-1 mt-2">
                    {sourceAnalysis.recommendations.map((rec: string, index: number) => (
                      <li key={index} className="flex items-center gap-2">
                        <Star className="h-3 w-3 text-blue-500" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}

          {/* No Results */}
          {!results && !isSearching && (
            <Card>
              <CardContent className="text-center py-12">
                <Search className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Search Results</h3>
                <p className="text-slate-600">
                  Use the search panel to find relevant content sources
                </p>
              </CardContent>
            </Card>
          )}

          {/* Loading */}
          {isSearching && (
            <Card>
              <CardContent className="text-center py-12">
                <Loader2 className="h-12 w-12 mx-auto text-blue-600 animate-spin mb-4" />
                <h3 className="text-lg font-semibold mb-2">Finding Sources...</h3>
                <p className="text-slate-600">
                  Analyzing context and searching for relevant sources
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
