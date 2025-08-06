"use client"

import type React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { NewsFormData } from "../NewsForm"
import { MdOutlineSmartToy, MdTrendingUp, MdAnalytics, MdLightbulb } from "react-icons/md"
import { useSEOAnalysis } from "@/hooks/useSEOAnalysis"
import { useState } from "react"

interface NewsFormSEOTabProps {
  formData: NewsFormData;
  validationErrors: Record<string, string>;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onGenerateSEO: () => Promise<void>;
  isGenerating: boolean;
}

const NewsFormSEOTab: React.FC<NewsFormSEOTabProps> = ({ 
  formData, 
  validationErrors, 
  onInputChange, 
  onGenerateSEO, 
  isGenerating 
}) => {
  const { analyzeSEO, getTrendingKeywords, generateAdvancedSEO, isAnalyzing, error } = useSEOAnalysis();
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [trendingKeywords, setTrendingKeywords] = useState<string[]>([]);
  const [showAnalysis, setShowAnalysis] = useState(false);

  const handleAnalyzeSEO = async () => {
    if (!formData.title.en) return;

    const seoContent = {
      title: formData.title.en,
      metaTitle: formData.seo.metaTitle,
      metaDescription: formData.seo.metaDescription,
      keywords: formData.seo.keywords,
      category: typeof formData.category === 'string' 
        ? formData.category 
        : formData.category?.name?.en || 'General'
    };

    const result = await analyzeSEO(seoContent);
    if (result) {
      setAnalysisResult(result);
      setShowAnalysis(true);
    }
  };

  const handleGetTrendingKeywords = async () => {
    const category = typeof formData.category === 'string' 
      ? formData.category 
      : formData.category?.name?.en || 'General';
    const keywords = await getTrendingKeywords(category);
    setTrendingKeywords(keywords);
  };

  const handleAdvancedSEO = async () => {
    if (!formData.title.en) return;

    const category = typeof formData.category === 'string' 
      ? formData.category 
      : formData.category?.name?.en || 'General';
    const result = await generateAdvancedSEO(formData.title.en, category);
    
    if (result) {
      // Update form data with advanced SEO
      const event = {
        target: {
          name: 'seo.metaTitle.en',
          value: result.metaTitle.en
        }
      } as React.ChangeEvent<HTMLInputElement>;
      onInputChange(event);

      const event2 = {
        target: {
          name: 'seo.metaTitle.kh',
          value: result.metaTitle.kh
        }
      } as React.ChangeEvent<HTMLInputElement>;
      onInputChange(event2);

      const event3 = {
        target: {
          name: 'seo.metaDescription.en',
          value: result.metaDescription.en
        }
      } as React.ChangeEvent<HTMLTextAreaElement>;
      onInputChange(event3);

      const event4 = {
        target: {
          name: 'seo.metaDescription.kh',
          value: result.metaDescription.kh
        }
      } as React.ChangeEvent<HTMLTextAreaElement>;
      onInputChange(event4);

      const event5 = {
        target: {
          name: 'seo.keywords',
          value: result.keywords
        }
      } as React.ChangeEvent<HTMLInputElement>;
      onInputChange(event5);
    }
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'bg-green-100 text-green-800';
      case 'B': return 'bg-blue-100 text-blue-800';
      case 'C': return 'bg-yellow-100 text-yellow-800';
      case 'D': return 'bg-orange-100 text-orange-800';
      case 'F': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3">
          <div>
            <CardTitle>SEO Configuration</CardTitle>
            <CardDescription>Optimize your article for search engines with advanced analysis.</CardDescription>
          </div>
          
          {/* Mobile layout: Stack buttons in 2x2 grid */}
          <div className="flex flex-col gap-2 sm:hidden">
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAnalyzeSEO}
                disabled={isAnalyzing || !formData.title.en}
                className="text-xs"
              >
                <MdAnalytics className="mr-1 h-3 w-3" />
                {isAnalyzing ? 'Analyzing...' : 'Analyze SEO'}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleGetTrendingKeywords}
                disabled={isAnalyzing}
                className="text-xs"
              >
                <MdTrendingUp className="mr-1 h-3 w-3" />
                Trending
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAdvancedSEO}
                disabled={isAnalyzing || !formData.title.en}
                className="text-xs"
              >
                <MdLightbulb className="mr-1 h-3 w-3" />
                Advanced
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onGenerateSEO}
                disabled={isGenerating || !formData.title.en}
                className="text-xs"
              >
                <MdOutlineSmartToy className="mr-1 h-3 w-3" />
                {isGenerating ? 'Generating...' : 'AI Generate'}
              </Button>
            </div>
          </div>

          {/* Desktop layout: Horizontal row */}
          <div className="hidden sm:flex sm:gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleAnalyzeSEO}
              disabled={isAnalyzing || !formData.title.en}
            >
              <MdAnalytics className="mr-2 h-4 w-4" />
              {isAnalyzing ? 'Analyzing...' : 'Analyze SEO'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleGetTrendingKeywords}
              disabled={isAnalyzing}
            >
              <MdTrendingUp className="mr-2 h-4 w-4" />
              Trending Keywords
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleAdvancedSEO}
              disabled={isAnalyzing || !formData.title.en}
            >
              <MdLightbulb className="mr-2 h-4 w-4" />
              Advanced SEO
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onGenerateSEO}
              disabled={isGenerating || !formData.title.en}
            >
              <MdOutlineSmartToy className="mr-2 h-4 w-4" />
              {isGenerating ? 'Generating...' : 'Generate with AI'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {analysisResult && showAnalysis && (
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle className="text-lg">SEO Analysis Results</CardTitle>
                <Badge className={getGradeColor(analysisResult.grade)}>
                  Grade: {analysisResult.grade} ({analysisResult.score}/100)
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <h4 className="font-semibold mb-2">Title Analysis</h4>
                  <p className="text-sm text-gray-600">Score: {analysisResult.feedback?.title?.score}/100</p>
                  {analysisResult.feedback?.title?.issues?.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm font-medium text-red-600">Issues:</p>
                      <ul className="text-sm text-red-600 list-disc list-inside">
                        {analysisResult.feedback.title.issues.map((issue: string, index: number) => (
                          <li key={index}>{issue}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {analysisResult.feedback?.title?.suggestions?.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm font-medium text-green-600">Suggestions:</p>
                      <ul className="text-sm text-green-600 list-disc list-inside">
                        {analysisResult.feedback.title.suggestions.map((suggestion: string, index: number) => (
                          <li key={index}>{suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Description Analysis</h4>
                  <p className="text-sm text-gray-600">Score: {analysisResult.feedback?.description?.score}/100</p>
                  {analysisResult.feedback?.description?.issues?.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm font-medium text-red-600">Issues:</p>
                      <ul className="text-sm text-red-600 list-disc list-inside">
                        {analysisResult.feedback.description.issues.map((issue: string, index: number) => (
                          <li key={index}>{issue}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
              {analysisResult.feedback?.overall?.recommendations?.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Recommendations</h4>
                  <ul className="text-sm text-blue-700 list-disc list-inside">
                    {analysisResult.feedback.overall.recommendations.map((rec: string, index: number) => (
                      <li key={index}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {trendingKeywords.length > 0 && (
          <Card className="bg-green-50 border-green-200">
            <CardHeader>
              <CardTitle className="text-green-900">Trending Keywords</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {trendingKeywords.map((keyword, index) => (
                  <Badge key={index} variant="secondary" className="cursor-pointer hover:bg-green-200">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="meta-title-en">Meta Title (English)</Label>
            <Input
              id="meta-title-en"
              name="seo.metaTitle.en"
              value={formData.seo.metaTitle.en || ''}
              onChange={onInputChange}
              maxLength={70}
              placeholder="Enter English meta title (max 70 chars)"
            />
            <p className="text-sm text-muted-foreground">
              {(formData.seo.metaTitle.en?.length || 0)}/70
            </p>
            {validationErrors["seo.metaTitle.en"] && (
              <p className="text-sm text-red-500">{validationErrors["seo.metaTitle.en"]}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="meta-title-kh">Meta Title (Khmer)</Label>
            <Input
              id="meta-title-kh"
              name="seo.metaTitle.kh"
              value={formData.seo.metaTitle.kh || ''}
              onChange={onInputChange}
              maxLength={70}
              placeholder="Enter Khmer meta title (max 70 chars)"
            />
            <p className="text-sm text-muted-foreground">
              {(formData.seo.metaTitle.kh?.length || 0)}/70
            </p>
            {validationErrors["seo.metaTitle.kh"] && (
              <p className="text-sm text-red-500">{validationErrors["seo.metaTitle.kh"]}</p>
            )}
          </div>
        </div>
        <Separator />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="meta-description-en">Meta Description (English)</Label>
            <Textarea
              id="meta-description-en"
              name="seo.metaDescription.en"
              value={formData.seo.metaDescription.en || ''}
              onChange={onInputChange}
              maxLength={160}
              placeholder="Enter English meta description (max 160 chars)"
              className="min-h-[100px]"
            />
            <p className="text-sm text-muted-foreground">
              {(formData.seo.metaDescription.en?.length || 0)}/160
            </p>
            {validationErrors["seo.metaDescription.en"] && (
              <p className="text-sm text-red-500">{validationErrors["seo.metaDescription.en"]}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="meta-description-kh">Meta Description (Khmer)</Label>
            <Textarea
              id="meta-description-kh"
              name="seo.metaDescription.kh"
              value={formData.seo.metaDescription.kh || ''}
              onChange={onInputChange}
              maxLength={160}
              placeholder="Enter Khmer meta description (max 160 chars)"
              className="min-h-[100px]"
            />
            <p className="text-sm text-muted-foreground">
              {(formData.seo.metaDescription.kh?.length || 0)}/160
            </p>
            {validationErrors["seo.metaDescription.kh"] && (
              <p className="text-sm text-red-500">{validationErrors["seo.metaDescription.kh"]}</p>
            )}
          </div>
        </div>
        <Separator />
        <div className="grid gap-2">
          <Label htmlFor="keywords">Keywords</Label>
          <Input
            id="keywords"
            name="seo.keywords"
            value={formData.seo.keywords || ''}
            onChange={onInputChange}
            placeholder="Enter comma-separated keywords"
          />
          <p className="text-sm text-muted-foreground">
            Separate keywords with a comma (e.g., technology, AI, news).
          </p>
          {validationErrors["seo.keywords"] && (
            <p className="text-sm text-red-500">{validationErrors["seo.keywords"]}</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default NewsFormSEOTab
