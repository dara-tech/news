'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  TrendingUp, 
  BookOpen, 
  Clock, 
  Target,
  Lightbulb,
  BarChart3,
  Users
} from 'lucide-react';

interface Insight {
  type: 'pattern' | 'preference' | 'suggestion';
  title: string;
  description: string;
  confidence: number;
}

interface ReadingPattern {
  favoriteCategories: string[];
  favoriteTopics: string[];
  readingFrequency: 'daily' | 'weekly' | 'occasional';
  preferredContentLength: 'short' | 'medium' | 'long';
}

interface Recommendation {
  type: 'category' | 'topic' | 'author';
  suggestion: string;
  reason: string;
}

interface RecommendationInsightsProps {
  insights: {
    insights: Insight[];
    readingPatterns: ReadingPattern;
    recommendations: Recommendation[];
    generatedAt: string;
  };
}

export function RecommendationInsights({ insights }: RecommendationInsightsProps) {
  // Add fallback data structure to prevent errors
  const safeInsights = {
    insights: insights?.insights || [],
    readingPatterns: insights?.readingPatterns || {
      favoriteCategories: [],
      favoriteTopics: [],
      readingFrequency: 'occasional' as const,
      preferredContentLength: 'medium' as const
    },
    recommendations: insights?.recommendations || [],
    generatedAt: insights?.generatedAt || new Date().toISOString()
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'pattern':
        return <BarChart3 className="h-5 w-5 text-blue-500" />;
      case 'preference':
        return <Target className="h-5 w-5 text-green-500" />;
      case 'suggestion':
        return <Lightbulb className="h-5 w-5 text-yellow-500" />;
      default:
        return <Brain className="h-5 w-5 text-gray-500" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-100 text-green-800';
    if (confidence >= 0.6) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getFrequencyIcon = (frequency: string) => {
    switch (frequency) {
      case 'daily':
        return <Clock className="h-4 w-4 text-green-500" />;
      case 'weekly':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'occasional':
        return <Clock className="h-4 w-4 text-gray-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getContentLengthIcon = (length: string) => {
    switch (length) {
      case 'short':
        return <BookOpen className="h-4 w-4 text-blue-500" />;
      case 'medium':
        return <BookOpen className="h-4 w-4 text-green-500" />;
      case 'long':
        return <BookOpen className="h-4 w-4 text-purple-500" />;
      default:
        return <BookOpen className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Reading Patterns */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5" />
            <span>Your Reading Patterns</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Favorite Categories */}
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-2">Favorite Categories</h4>
              <div className="flex flex-wrap gap-2">
                {safeInsights.readingPatterns.favoriteCategories.length > 0 ? (
                  safeInsights.readingPatterns.favoriteCategories.map((category, index) => (
                    <Badge key={index} variant="secondary">
                      {category}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">No patterns detected yet</span>
                )}
              </div>
            </div>

            {/* Favorite Topics */}
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-2">Favorite Topics</h4>
              <div className="flex flex-wrap gap-2">
                {safeInsights.readingPatterns.favoriteTopics.length > 0 ? (
                  safeInsights.readingPatterns.favoriteTopics.map((topic, index) => (
                    <Badge key={index} variant="outline">
                      {topic}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">No patterns detected yet</span>
                )}
              </div>
            </div>

            {/* Reading Frequency */}
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-2">Reading Frequency</h4>
              <div className="flex items-center space-x-2">
                {getFrequencyIcon(safeInsights.readingPatterns.readingFrequency)}
                <span className="text-sm capitalize">
                  {safeInsights.readingPatterns.readingFrequency}
                </span>
              </div>
            </div>

            {/* Content Length Preference */}
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-2">Content Length</h4>
              <div className="flex items-center space-x-2">
                {getContentLengthIcon(safeInsights.readingPatterns.preferredContentLength)}
                <span className="text-sm capitalize">
                  {safeInsights.readingPatterns.preferredContentLength}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Insights */}
      {safeInsights.insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Brain className="h-5 w-5" />
              <span>AI Insights</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {safeInsights.insights.map((insight, index) => (
                <div key={index} className="flex items-start space-x-3 p-4 border rounded-lg">
                  <div className="flex-shrink-0">
                    {getInsightIcon(insight.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm">{insight.title}</h4>
                      <Badge 
                        variant="secondary" 
                        className={`text-xs ${getConfidenceColor(insight.confidence)}`}
                      >
                        {Math.round(insight.confidence * 100)}% confidence
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{insight.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {safeInsights.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Lightbulb className="h-5 w-5" />
              <span>Personalized Suggestions</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {safeInsights.recommendations.map((rec, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <div className="flex-shrink-0">
                    <Lightbulb className="h-4 w-4 text-blue-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      {rec.suggestion}
                    </p>
                    <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                      {rec.reason}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generated Info */}
      <div className="text-xs text-muted-foreground text-center">
        Insights generated {new Date(safeInsights.generatedAt).toLocaleString()}
      </div>
    </div>
  );
}

