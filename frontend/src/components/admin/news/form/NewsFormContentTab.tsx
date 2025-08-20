"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import type { NewsFormData } from "../NewsForm"
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { MdOutlineSmartToy } from "react-icons/md"
import { 
  Sparkles, 
  Languages, 
  BarChart3, 
  CheckCircle, 
  AlertTriangle,
  RefreshCw,
  Settings,
  Zap
} from "lucide-react"
import { toast } from "sonner"
import { useFormatContent } from '@/hooks/useFormatContent'
import { formatArticleContent } from '@/lib/contentFormatter'

const TiptapEditor = dynamic(() => import("./TiptapEditor"), { ssr: false });

interface NewsFormContentTabProps {
  formData: NewsFormData;
  validationErrors: Record<string, string>;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onFormDataChange: (field: string, value: any) => void;
  onGenerateContent: () => void;
  isGenerating: boolean;
  articleId?: string;
}

// Helper to create a synthetic event compatible with onInputChange
function createSyntheticInputEvent(
  name: string,
  value: string
): React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> {
  return {
    target: {
      name,
      value,
    },
  } as React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>;
}

const NewsFormContentTab: React.FC<NewsFormContentTabProps> = ({
  formData,
  validationErrors,
  onInputChange,
  onFormDataChange,
  onGenerateContent,
  isGenerating,
  articleId,
}) => {
  const { formatContent } = useFormatContent();
  const [autoProcessing, setAutoProcessing] = useState({
    enabled: true,
    autoFormat: true,
    autoTranslate: true,
    autoAnalyze: true
  });
  const [processingStatus, setProcessingStatus] = useState({
    isProcessing: false,
    currentStep: '',
    progress: 0
  });
  const [contentAnalysis, setContentAnalysis] = useState<any>(null);

  // Auto-process content when English content changes
  const autoProcessContent = useCallback(async (content: string) => {
    if (!autoProcessing.enabled || !content || content.length < 50) return;

    setProcessingStatus({
      isProcessing: true,
      currentStep: 'Analyzing content...',
      progress: 10
    });

    try {
      // Step 1: Auto-format content
      if (autoProcessing.autoFormat) {
        setProcessingStatus({
          isProcessing: true,
          currentStep: 'Formatting content...',
          progress: 30
        });

        const formattedResult = await formatContent({ en: content, kh: '' }, articleId);
        if (formattedResult) {
          onFormDataChange('content', formattedResult.content);
          setProcessingStatus({
            isProcessing: true,
            currentStep: 'Content formatted successfully',
            progress: 50
          });
        }
      }

      // Step 2: Auto-translate to Khmer
      if (autoProcessing.autoTranslate) {
        setProcessingStatus({
          isProcessing: true,
          currentStep: 'Translating to Khmer...',
          progress: 70
        });

        // Use Gemini for translation
        const translationResult = await translateToKhmer(content);
        if (translationResult) {
          onFormDataChange('content', {
            en: formData.content.en,
            kh: translationResult
          });
          setProcessingStatus({
            isProcessing: true,
            currentStep: 'Translation completed',
            progress: 85
          });
        }
      }

      // Step 3: Auto-analyze content
      if (autoProcessing.autoAnalyze) {
        setProcessingStatus({
          isProcessing: true,
          currentStep: 'Analyzing content quality...',
          progress: 90
        });

        const analysis = await analyzeContentQuality(content);
        setContentAnalysis(analysis);
        setProcessingStatus({
          isProcessing: true,
          currentStep: 'Analysis completed',
          progress: 100
        });
      }

      // Complete processing
      setTimeout(() => {
        setProcessingStatus({
          isProcessing: false,
          currentStep: '',
          progress: 0
        });
        toast.success('Content automatically processed!');
      }, 1000);

    } catch (error) {
      console.error('Auto-processing error:', error);
      setProcessingStatus({
        isProcessing: false,
        currentStep: '',
        progress: 0
      });
      toast.error('Auto-processing failed. Please try again.');
    }
  }, [autoProcessing, formatContent, onFormDataChange, articleId, formData.content.en]);

  // Debounced auto-processing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (formData.content?.en) {
        autoProcessContent(formData.content.en);
      }
    }, 2000); // Wait 2 seconds after user stops typing

    return () => clearTimeout(timeoutId);
  }, [formData.content?.en, autoProcessContent]);

  // Translate content to Khmer using Gemini
  const translateToKhmer = async (englishContent: string): Promise<string> => {
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: englishContent,
          targetLanguage: 'kh'
        })
      });

      if (response.ok) {
        const result = await response.json();
        return result.translation;
      }
      return '';
    } catch (error) {
      console.error('Translation error:', error);
      return '';
    }
  };

  // Analyze content quality
  const analyzeContentQuality = async (content: string) => {
    try {
      const response = await fetch('/api/news/analyze-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content })
      });

      if (response.ok) {
        const result = await response.json();
        return result.data;
      }
      return null;
    } catch (error) {
      console.error('Analysis error:', error);
      return null;
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
    if (score >= 80) return <CheckCircle className="h-4 w-4 text-blue-600" />;
    if (score >= 70) return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    return <AlertTriangle className="h-4 w-4 text-red-600" />;
  };

  return (
    <div className="space-y-6">
      {/* Auto-Processing Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Auto-Processing Settings
          </CardTitle>
          <CardDescription>
            Automatically format, translate, and analyze your content as you type
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Enable Auto-Processing</Label>
              <p className="text-sm text-muted-foreground">
                Automatically process content when you type
              </p>
            </div>
            <Switch
              checked={autoProcessing.enabled}
              onCheckedChange={(checked) => setAutoProcessing(prev => ({ ...prev, enabled: checked }))}
            />
          </div>

          {autoProcessing.enabled && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Auto-Format</Label>
                  <p className="text-sm text-muted-foreground">
                    Format content with HTML
                  </p>
                </div>
                <Switch
                  checked={autoProcessing.autoFormat}
                  onCheckedChange={(checked) => setAutoProcessing(prev => ({ ...prev, autoFormat: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Auto-Translate</Label>
                  <p className="text-sm text-muted-foreground">
                    Translate to Khmer
                  </p>
                </div>
                <Switch
                  checked={autoProcessing.autoTranslate}
                  onCheckedChange={(checked) => setAutoProcessing(prev => ({ ...prev, autoTranslate: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Auto-Analyze</Label>
                  <p className="text-sm text-muted-foreground">
                    Analyze content quality
                  </p>
                </div>
                <Switch
                  checked={autoProcessing.autoAnalyze}
                  onCheckedChange={(checked) => setAutoProcessing(prev => ({ ...prev, autoAnalyze: checked }))}
                />
              </div>
            </div>
          )}

          {/* Processing Status */}
          {processingStatus.isProcessing && (
            <div className="p-4 border rounded-lg bg-blue-50">
              <div className="flex items-center gap-2 mb-2">
                <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
                <span className="text-sm font-medium text-blue-800">
                  {processingStatus.currentStep}
                </span>
              </div>
              <Progress value={processingStatus.progress} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Content Analysis Results */}
      {contentAnalysis && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Content Quality Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{contentAnalysis.readability?.score || 0}%</div>
                <div className="text-sm text-gray-600">Readability</div>
                <Badge variant="outline" className="mt-1">
                  {contentAnalysis.readability?.level || 'Good'}
                </Badge>
              </div>

              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-green-600">{contentAnalysis.seo?.score || 0}%</div>
                <div className="text-sm text-gray-600">SEO Score</div>
                <div className="text-xs text-gray-500 mt-1">
                  {contentAnalysis.seo?.keywords?.length || 0} keywords
                </div>
              </div>

              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{contentAnalysis.engagement?.score || 0}%</div>
                <div className="text-sm text-gray-600">Engagement</div>
                <div className="text-xs text-gray-500 mt-1">
                  {contentAnalysis.engagement?.factors?.length || 0} factors
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Form */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle>Article Content</CardTitle>
              <CardDescription>
                Write the main body of your article. Auto-processing will handle formatting, translation, and analysis.
              </CardDescription>
            </div>
            <Button
              type="button"
              className="inline-flex items-center justify-center px-3 py-1.5 text-xs sm:text-sm font-medium rounded bg-blue-100 text-blue-800 hover:bg-blue-200 disabled:opacity-60 w-full sm:w-auto"
              onClick={onGenerateContent}
              disabled={isGenerating}
            >
              <MdOutlineSmartToy className="mr-2 text-sm sm:text-base" />
              {isGenerating ? "Generating..." : "Generate Content"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title.en">Title (English)</Label>
              <Input
                id="title.en"
                name="title.en"
                value={formData.title.en}
                onChange={onInputChange}
                className={validationErrors["title.en"] ? "border-red-500" : ""}
              />
              {validationErrors["title.en"] && (
                <p className="text-sm text-red-500">
                  {validationErrors["title.en"]}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="title.kh">Title (Khmer)</Label>
              <Input
                id="title.kh"
                name="title.kh"
                value={formData.title.kh}
                onChange={onInputChange}
                className={validationErrors["title.kh"] ? "border-red-500" : ""}
              />
              {validationErrors["title.kh"] && (
                <p className="text-sm text-red-500">
                  {validationErrors["title.kh"]}
                </p>
              )}
            </div>
          </div>
          <Separator />
          <div className="space-y-2">
            <Label htmlFor="description.en">Description (English)</Label>
            <Textarea
              id="description.en"
              name="description.en"
              value={formData.description.en}
              onChange={onInputChange}
              rows={3}
              className={validationErrors["description.en"] ? "border-red-500" : ""}
            />
            {validationErrors["description.en"] && (
              <p className="text-sm text-red-500">
                {validationErrors["description.en"]}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="description.kh">Description (Khmer)</Label>
            <Textarea
              id="description.kh"
              name="description.kh"
              value={formData.description.kh}
              onChange={onInputChange}
              rows={3}
              className={validationErrors["description.kh"] ? "border-red-500" : ""}
            />
            {validationErrors["description.kh"] && (
              <p className="text-sm text-red-500">
                {validationErrors["description.kh"]}
              </p>
            )}
          </div>
          <Separator />
          <div className="space-y-2">
            <TiptapEditor
              value={formData.content.en}
              onChange={val =>
                onInputChange(createSyntheticInputEvent("content.en", val))
              }
              error={validationErrors["content.en"]}
              label="Main Content (English) - Auto-processed as you type"
            />
          </div>
          <div className="space-y-2">
            <TiptapEditor
              value={formData.content.kh}
              onChange={val =>
                onInputChange(createSyntheticInputEvent("content.kh", val))
              }
              error={validationErrors["content.kh"]}
              label="Main Content (Khmer) - Auto-translated from English"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewsFormContentTab;
