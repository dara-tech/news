'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
  Lightbulb
} from 'lucide-react';
import { toast } from 'sonner';

interface NewsFormEnhancedTabProps {
  formData: any;
  onFormDataChange: (field: string, value: any) => void;
  onGenerateAIIllustration: () => void;
  onTranslateToKhmer: () => void;
  onAssessPublishing: () => void;
  isGeneratingAI: boolean;
  isTranslating: boolean;
  isAssessing: boolean;
}

export default function NewsFormEnhancedTab({
  formData,
  onFormDataChange,
  onGenerateAIIllustration,
  onTranslateToKhmer,
  onAssessPublishing,
  isGeneratingAI,
  isTranslating,
  isAssessing
}: NewsFormEnhancedTabProps) {
  
  const getQualityColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getQualityIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (score >= 60) return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    return <AlertTriangle className="h-4 w-4 text-red-600" />;
  };

  return (
    <div className="space-y-6">
      {/* AI Thumbnail Generation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Thumbnail Generation
          </CardTitle>
          <CardDescription>
            Generate professional thumbnails using AI-powered illustration descriptions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Enable AI Illustration</Label>
              <p className="text-sm text-muted-foreground">
                Generate detailed image descriptions for manual image creation
              </p>
            </div>
            <Switch
              checked={formData.enableAIIllustration || false}
              onCheckedChange={(checked) => onFormDataChange('enableAIIllustration', checked)}
            />
          </div>

          {formData.enableAIIllustration && (
            <div className="space-y-4">
              <Button
                type="button"
                onClick={onGenerateAIIllustration}
                disabled={isGeneratingAI || !formData.title?.en}
                className="w-full"
              >
                <Brain className="mr-2 h-4 w-4" />
                {isGeneratingAI ? 'Generating AI Illustration...' : 'Generate AI Illustration Description'}
              </Button>

              {formData.aiIllustration && (
                <div className="p-4 border rounded-lg bg-blue-50">
                  <h4 className="font-semibold mb-2">AI Illustration Description</h4>
                  <p className="text-sm text-gray-700 mb-3">{formData.aiIllustration.description}</p>
                  <div className="flex gap-2">
                    <Badge variant="outline">{formData.aiIllustration.style}</Badge>
                    <Badge variant="outline">{formData.aiIllustration.mood}</Badge>
                    <Badge variant="outline">{formData.aiIllustration.colorScheme}</Badge>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Khmer Translation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Languages className="h-5 w-5" />
            Khmer Translation
          </CardTitle>
          <CardDescription>
            Advanced Khmer translation with quality assessment and cultural adaptation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Enable Enhanced Translation</Label>
              <p className="text-sm text-muted-foreground">
                Use Gemini AI for high-quality Khmer translations
              </p>
            </div>
            <Switch
              checked={formData.enableEnhancedTranslation || false}
              onCheckedChange={(checked) => onFormDataChange('enableEnhancedTranslation', checked)}
            />
          </div>

          {formData.enableEnhancedTranslation && (
            <div className="space-y-4">
              <Button
                type="button"
                onClick={onTranslateToKhmer}
                disabled={isTranslating || !formData.content?.en}
                className="w-full"
              >
                <Languages className="mr-2 h-4 w-4" />
                {isTranslating ? 'Translating to Khmer...' : 'Translate to Khmer'}
              </Button>

              {formData.translationQuality && (
                <div className="p-4 border rounded-lg bg-purple-50">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">Translation Quality</h4>
                    {getQualityIcon(formData.translationQuality.score)}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Quality Score</span>
                      <span className={`font-semibold ${getQualityColor(formData.translationQuality.score)}`}>
                        {formData.translationQuality.score}%
                      </span>
                    </div>
                    <Progress value={formData.translationQuality.score} className="h-2" />
                    <div className="flex gap-2">
                      <Badge variant="outline">{formData.translationQuality.quality}</Badge>
                      {formData.translationQuality.culturalAdaptation && (
                        <Badge variant="outline" className="bg-green-100 text-green-800">Cultural Adaptation</Badge>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Publishing Decision */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Publishing Decision
          </CardTitle>
          <CardDescription>
            AI-powered content assessment for intelligent publishing decisions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Enable Publishing Assessment</Label>
              <p className="text-sm text-muted-foreground">
                Assess content quality and publishing eligibility
              </p>
            </div>
            <Switch
              checked={formData.enablePublishingAssessment || false}
              onCheckedChange={(checked) => onFormDataChange('enablePublishingAssessment', checked)}
            />
          </div>

          {formData.enablePublishingAssessment && (
            <div className="space-y-4">
              <Button
                type="button"
                onClick={onAssessPublishing}
                disabled={isAssessing || !formData.content?.en}
                className="w-full"
              >
                <Target className="mr-2 h-4 w-4" />
                {isAssessing ? 'Assessing Content...' : 'Assess Publishing Eligibility'}
              </Button>

              {formData.publishingAssessment && (
                <div className="p-4 border rounded-lg bg-orange-50">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">Publishing Assessment</h4>
                    {formData.publishingAssessment.shouldPublish ? (
                      <Badge className="bg-green-100 text-green-800">Auto-Publish</Badge>
                    ) : (
                      <Badge className="bg-yellow-100 text-yellow-800">Manual Review</Badge>
                    )}
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Confidence Score</span>
                      <span className={`font-semibold ${getQualityColor(formData.publishingAssessment.confidence * 100)}`}>
                        {Math.round(formData.publishingAssessment.confidence * 100)}%
                      </span>
                    </div>
                    <Progress value={formData.publishingAssessment.confidence * 100} className="h-2" />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm text-gray-600">Quality Score</span>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="font-semibold">{formData.publishingAssessment.qualityScore}%</span>
                        </div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Relevance Score</span>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-4 w-4 text-blue-500" />
                          <span className="font-semibold">{formData.publishingAssessment.relevanceScore}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-sm text-gray-600">
                      <strong>Reason:</strong> {formData.publishingAssessment.reason}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Content Analytics */}
      {(formData.translationQuality || formData.publishingAssessment) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Content Analytics
            </CardTitle>
            <CardDescription>
              Comprehensive analysis of your content quality and performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {formData.translationQuality && (
                <div className="text-center p-4 border rounded-lg">
                  <Languages className="h-8 w-8 mx-auto text-purple-600 mb-2" />
                  <div className="text-2xl font-bold text-purple-600">{formData.translationQuality.score}%</div>
                  <div className="text-sm text-gray-600">Translation Quality</div>
                </div>
              )}
              
              {formData.publishingAssessment && (
                <>
                  <div className="text-center p-4 border rounded-lg">
                    <Target className="h-8 w-8 mx-auto text-orange-600 mb-2" />
                    <div className="text-2xl font-bold text-orange-600">
                      {Math.round(formData.publishingAssessment.confidence * 100)}%
                    </div>
                    <div className="text-sm text-gray-600">Publishing Confidence</div>
                  </div>
                  
                  <div className="text-center p-4 border rounded-lg">
                    <TrendingUp className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                    <div className="text-2xl font-bold text-blue-600">
                      {formData.publishingAssessment.relevanceScore}%
                    </div>
                    <div className="text-sm text-gray-600">Content Relevance</div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
