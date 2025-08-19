'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Brain, 
  Languages, 
  Target, 
  Star,
  CheckCircle,
  AlertTriangle,
  Eye,
  TrendingUp,
  Palette,
  BarChart3,
  Zap,
  Lightbulb,
  FileText,
  Type,
  Sparkles,
  Globe,
  Clock,
  Users,
  BookOpen,
  Wand2,
  Settings,
  RefreshCw,
  Play,
  Pause,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { toast } from 'sonner';
import { useFormatContent } from '@/hooks/useFormatContent';
import { formatArticleContent, extractContentInfo } from '@/lib/contentFormatter';

interface NewsFormContentFormattingTabProps {
  formData: any;
  onFormDataChange: (field: string, value: any) => void;
  articleId?: string;
}

interface ContentAnalysis {
  readability: {
    score: number;
    level: string;
    suggestions: string[];
  };
  seo: {
    score: number;
    keywords: string[];
    suggestions: string[];
  };
  engagement: {
    score: number;
    factors: string[];
  };
  multilingual: {
    enQuality: number;
    khQuality: number;
    translationGaps: string[];
  };
}

interface FormattingOptions {
  enableAIEnhancement: boolean;
  enableReadabilityOptimization: boolean;
  enableSEOOptimization: boolean;
  enableMultilingualOptimization: boolean;
  enableVisualEnhancement: boolean;
  enableContentAnalysis: boolean;
  preserveOriginalStructure: boolean;
  addSectionHeadings: boolean;
  enhanceQuotes: boolean;
  optimizeLists: boolean;
}

export default function NewsFormContentFormattingTab({
  formData,
  onFormDataChange,
  articleId
}: NewsFormContentFormattingTabProps) {
  const { isFormatting, error, formatContent } = useFormatContent();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [contentAnalysis, setContentAnalysis] = useState<ContentAnalysis | null>(null);
  const [formattingOptions, setFormattingOptions] = useState<FormattingOptions>({
    enableAIEnhancement: true,
    enableReadabilityOptimization: true,
    enableSEOOptimization: true,
    enableMultilingualOptimization: true,
    enableVisualEnhancement: true,
    enableContentAnalysis: true,
    preserveOriginalStructure: false,
    addSectionHeadings: true,
    enhanceQuotes: true,
    optimizeLists: true
  });
  const [previewMode, setPreviewMode] = useState<'original' | 'formatted'>('original');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['analysis', 'options']));

  // Initialize formatting options from form data
  useEffect(() => {
    if (formData.formattingOptions) {
      setFormattingOptions(prev => ({ ...prev, ...formData.formattingOptions }));
    }
  }, [formData.formattingOptions]);

  const handleFormattingOptionChange = (key: keyof FormattingOptions, value: boolean) => {
    const newOptions = { ...formattingOptions, [key]: value };
    setFormattingOptions(newOptions);
    onFormDataChange('formattingOptions', newOptions);
  };

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const analyzeContent = async () => {
    if (!formData.content?.en) {
      toast.error('No content to analyze');
      return;
    }

    setIsAnalyzing(true);
    try {
      // Simulate content analysis (in real implementation, this would call an API)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const analysis: ContentAnalysis = {
        readability: {
          score: Math.floor(Math.random() * 30) + 70, // 70-100
          level: ['Excellent', 'Good', 'Fair'][Math.floor(Math.random() * 3)],
          suggestions: [
            'Consider breaking up long paragraphs',
            'Add more subheadings for better structure',
            'Use bullet points for key information'
          ]
        },
        seo: {
          score: Math.floor(Math.random() * 25) + 75, // 75-100
          keywords: ['news', 'update', 'breaking', 'latest'],
          suggestions: [
            'Include more relevant keywords naturally',
            'Add meta descriptions for better SEO',
            'Optimize heading structure'
          ]
        },
        engagement: {
          score: Math.floor(Math.random() * 20) + 80, // 80-100
          factors: ['Compelling headline', 'Clear structure', 'Relevant content']
        },
        multilingual: {
          enQuality: Math.floor(Math.random() * 15) + 85, // 85-100
          khQuality: Math.floor(Math.random() * 20) + 80, // 80-100
          translationGaps: ['Some technical terms need better translation']
        }
      };

      setContentAnalysis(analysis);
      onFormDataChange('contentAnalysis', analysis);
      toast.success('Content analysis completed');
    } catch (error) {
      console.error('Error analyzing content:', error);
      toast.error('Failed to analyze content');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const optimizeContent = async () => {
    if (!formData.content?.en) {
      toast.error('No content to optimize');
      return;
    }

    setIsOptimizing(true);
    try {
      // Use the formatContent hook for AI-powered optimization
      const result = await formatContent(formData.content, articleId);
      
      if (result) {
        onFormDataChange('content', result.content);
        toast.success('Content optimized successfully');
      }
    } catch (error) {
      console.error('Error optimizing content:', error);
      toast.error('Failed to optimize content');
    } finally {
      setIsOptimizing(false);
    }
  };

  const applyLocalFormatting = () => {
    if (!formData.content?.en) {
      toast.error('No content to format');
      return;
    }

    try {
      const formattedEn = formatArticleContent(formData.content.en).html;
      const formattedKh = formatArticleContent(formData.content.kh || '').html;
      
      onFormDataChange('content', {
        en: formattedEn,
        kh: formattedKh
      });
      
      toast.success('Local formatting applied');
    } catch (error) {
      console.error('Error applying local formatting:', error);
      toast.error('Failed to apply local formatting');
    }
  };

  const getQualityColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getQualityIcon = (score: number) => {
    if (score >= 90) return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (score >= 80) return <Star className="h-4 w-4 text-blue-600" />;
    if (score >= 70) return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    return <AlertTriangle className="h-4 w-4 text-red-600" />;
  };

  return (
    <div className="space-y-6">
      {/* Header with Quick Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Advanced Content Formatting
              </CardTitle>
              <CardDescription>
                Professional content enhancement with AI-powered optimization and analysis
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={analyzeContent}
                disabled={isAnalyzing || !formData.content?.en}
                variant="outline"
                size="sm"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Analyze
                  </>
                )}
              </Button>
              <Button
                onClick={optimizeContent}
                disabled={isOptimizing || !formData.content?.en}
                className="bg-blue-600 hover:bg-blue-700"
                size="sm"
              >
                {isOptimizing ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Optimizing...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-4 w-4" />
                    Optimize
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Formatting Options */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Formatting Options
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleSection('options')}
            >
              {expandedSections.has('options') ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>
        {expandedSections.has('options') && (
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>AI Enhancement</Label>
                    <p className="text-sm text-muted-foreground">
                      Use AI to improve content quality and structure
                    </p>
                  </div>
                  <Switch
                    checked={formattingOptions.enableAIEnhancement}
                    onCheckedChange={(checked) => handleFormattingOptionChange('enableAIEnhancement', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Readability Optimization</Label>
                    <p className="text-sm text-muted-foreground">
                      Improve text readability and flow
                    </p>
                  </div>
                  <Switch
                    checked={formattingOptions.enableReadabilityOptimization}
                    onCheckedChange={(checked) => handleFormattingOptionChange('enableReadabilityOptimization', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>SEO Optimization</Label>
                    <p className="text-sm text-muted-foreground">
                      Optimize content for search engines
                    </p>
                  </div>
                  <Switch
                    checked={formattingOptions.enableSEOOptimization}
                    onCheckedChange={(checked) => handleFormattingOptionChange('enableSEOOptimization', checked)}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Multilingual Optimization</Label>
                    <p className="text-sm text-muted-foreground">
                      Optimize both English and Khmer content
                    </p>
                  </div>
                  <Switch
                    checked={formattingOptions.enableMultilingualOptimization}
                    onCheckedChange={(checked) => handleFormattingOptionChange('enableMultilingualOptimization', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Visual Enhancement</Label>
                    <p className="text-sm text-muted-foreground">
                      Add visual elements and styling
                    </p>
                  </div>
                  <Switch
                    checked={formattingOptions.enableVisualEnhancement}
                    onCheckedChange={(checked) => handleFormattingOptionChange('enableVisualEnhancement', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Content Analysis</Label>
                    <p className="text-sm text-muted-foreground">
                      Analyze content quality and metrics
                    </p>
                  </div>
                  <Switch
                    checked={formattingOptions.enableContentAnalysis}
                    onCheckedChange={(checked) => handleFormattingOptionChange('enableContentAnalysis', checked)}
                  />
                </div>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Add Section Headings</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically add H2 headings
                  </p>
                </div>
                <Switch
                  checked={formattingOptions.addSectionHeadings}
                  onCheckedChange={(checked) => handleFormattingOptionChange('addSectionHeadings', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Enhance Quotes</Label>
                  <p className="text-sm text-muted-foreground">
                    Format quotes with blockquotes
                  </p>
                </div>
                <Switch
                  checked={formattingOptions.enhanceQuotes}
                  onCheckedChange={(checked) => handleFormattingOptionChange('enhanceQuotes', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Optimize Lists</Label>
                  <p className="text-sm text-muted-foreground">
                    Convert text to proper lists
                  </p>
                </div>
                <Switch
                  checked={formattingOptions.optimizeLists}
                  onCheckedChange={(checked) => handleFormattingOptionChange('optimizeLists', checked)}
                />
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Content Analysis */}
      {contentAnalysis && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Content Analysis
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleSection('analysis')}
              >
                {expandedSections.has('analysis') ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
            </div>
          </CardHeader>
          {expandedSections.has('analysis') && (
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <BookOpen className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                  <div className="text-2xl font-bold text-blue-600">{contentAnalysis.readability.score}%</div>
                  <div className="text-sm text-gray-600">Readability</div>
                  <Badge variant="outline" className="mt-1">{contentAnalysis.readability.level}</Badge>
                </div>

                <div className="text-center p-4 border rounded-lg">
                  <TrendingUp className="h-8 w-8 mx-auto text-green-600 mb-2" />
                  <div className="text-2xl font-bold text-green-600">{contentAnalysis.seo.score}%</div>
                  <div className="text-sm text-gray-600">SEO Score</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {contentAnalysis.seo.keywords.length} keywords
                  </div>
                </div>

                <div className="text-center p-4 border rounded-lg">
                  <Users className="h-8 w-8 mx-auto text-purple-600 mb-2" />
                  <div className="text-2xl font-bold text-purple-600">{contentAnalysis.engagement.score}%</div>
                  <div className="text-sm text-gray-600">Engagement</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {contentAnalysis.engagement.factors.length} factors
                  </div>
                </div>

                <div className="text-center p-4 border rounded-lg">
                  <Globe className="h-8 w-8 mx-auto text-orange-600 mb-2" />
                  <div className="text-2xl font-bold text-orange-600">
                    {Math.round((contentAnalysis.multilingual.enQuality + contentAnalysis.multilingual.khQuality) / 2)}%
                  </div>
                  <div className="text-sm text-gray-600">Multilingual</div>
                  <div className="text-xs text-gray-500 mt-1">
                    EN: {contentAnalysis.multilingual.enQuality}% | KH: {contentAnalysis.multilingual.khQuality}%
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Readability Suggestions
                  </h4>
                  <ul className="space-y-2">
                    {contentAnalysis.readability.suggestions.map((suggestion, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    SEO Suggestions
                  </h4>
                  <ul className="space-y-2">
                    {contentAnalysis.seo.suggestions.map((suggestion, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Quick Actions
          </CardTitle>
          <CardDescription>
            Apply formatting and optimizations to your content
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={applyLocalFormatting}
              disabled={!formData.content?.en}
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2"
            >
              <Type className="h-6 w-6" />
              <div className="text-center">
                <div className="font-semibold">Local Formatting</div>
                <div className="text-xs text-muted-foreground">Apply basic HTML formatting</div>
              </div>
            </Button>

            <Button
              onClick={optimizeContent}
              disabled={isOptimizing || !formData.content?.en}
              className="h-auto p-4 flex flex-col items-center gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <Wand2 className="h-6 w-6" />
              <div className="text-center">
                <div className="font-semibold">AI Optimization</div>
                <div className="text-xs text-muted-foreground">Enhance with AI</div>
              </div>
            </Button>

            <Button
              onClick={analyzeContent}
              disabled={isAnalyzing || !formData.content?.en}
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2"
            >
              <BarChart3 className="h-6 w-6" />
              <div className="text-center">
                <div className="font-semibold">Content Analysis</div>
                <div className="text-xs text-muted-foreground">Analyze quality & metrics</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Content Preview */}
      {formData.content?.en && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Content Preview
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant={previewMode === 'original' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPreviewMode('original')}
                >
                  Original
                </Button>
                <Button
                  variant={previewMode === 'formatted' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPreviewMode('formatted')}
                >
                  Formatted
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg p-4 max-h-96 overflow-y-auto">
              {previewMode === 'original' ? (
                <div className="whitespace-pre-wrap text-sm">
                  {formData.content.en}
                </div>
              ) : (
                <div 
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ 
                    __html: formatArticleContent(formData.content.en).html 
                  }}
                />
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Formatting Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
