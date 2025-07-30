'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Brain, Sparkles, TrendingUp, Calendar, Globe, Target, CheckCircle } from 'lucide-react';
import { ProfileImageStyle } from '@/hooks/useGenerateProfileImage';
import { useSmartStyleSuggestions } from '@/hooks/useSmartStyleSuggestions';

interface SmartSuggestionsProps {
  user: { 
    username: string;
    profession?: string;
    interests?: string[];
    age?: number;
    company?: string;
    industry?: string;
    experience?: 'junior' | 'mid' | 'senior' | 'executive';
  };
  onStyleSelect: (style: ProfileImageStyle) => void;
  selectedStyle?: ProfileImageStyle | null;
}

export const SmartSuggestions = ({ user, onStyleSelect, selectedStyle }: SmartSuggestionsProps) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeTab, setActiveTab] = useState<'smart' | 'seasonal' | 'platform'>('smart');
  
  const {
    suggestions,
    isAnalyzing,
    getSuggestions,
    getSeasonalTheme,
    getPlatformOptimizedStyles
  } = useSmartStyleSuggestions();

  // Memoize user context to prevent unnecessary re-renders
  const userContext = useMemo(() => ({
    profession: user.profession,
    interests: user.interests,
    age: user.age,
    company: user.company,
    industry: user.industry,
    experience: user.experience
  }), [user.profession, user.interests, user.age, user.company, user.industry, user.experience]);

  // Memoize seasonal and platform styles
  const seasonalStyle = useMemo(() => getSeasonalTheme(), [getSeasonalTheme]);
  const platformStyles = useMemo(() => getPlatformOptimizedStyles('linkedin'), [getPlatformOptimizedStyles]);

  const handleGetSuggestions = useCallback(async () => {
    await getSuggestions(userContext);
    setShowSuggestions(true);
  }, [getSuggestions, userContext]);

  const handleTabChange = useCallback((tab: 'smart' | 'seasonal' | 'platform') => {
    setActiveTab(tab);
  }, []);

  const handleStyleSelect = useCallback((style: ProfileImageStyle) => {
    onStyleSelect(style);
  }, [onStyleSelect]);

  const getConfidenceColor = useCallback((confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 dark:text-green-400';
    if (confidence >= 0.6) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-gray-600 dark:text-gray-400';
  }, []);

  const getPriorityIcon = useCallback((priority: string) => {
    switch (priority) {
      case 'high':
        return <Target className="w-4 h-4 text-red-500" />;
      case 'medium':
        return <TrendingUp className="w-4 h-4 text-yellow-500" />;
      default:
        return <CheckCircle className="w-4 h-4 text-gray-500" />;
    }
  }, []);

  // Memoize suggestion items to prevent unnecessary re-renders
  const suggestionItems = useMemo(() => 
    suggestions.slice(0, 3).map((suggestion, index) => (
      <div
        key={index}
        className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 transition-colors cursor-pointer"
        onClick={() => handleStyleSelect(suggestion.style)}
      >
        <div className="flex items-center gap-3">
          {getPriorityIcon(suggestion.priority)}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                {suggestion.style}
              </span>
              <span className={`text-xs ${getConfidenceColor(suggestion.confidence)}`}>
                {Math.round(suggestion.confidence * 100)}% match
              </span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {suggestion.reason}
            </p>
          </div>
        </div>
        
        {selectedStyle === suggestion.style && (
          <CheckCircle className="w-4 h-4 text-green-500" />
        )}
      </div>
    )), [suggestions, selectedStyle, handleStyleSelect, getPriorityIcon, getConfidenceColor]);

  // Memoize platform style items
  const platformItems = useMemo(() => 
    platformStyles.map((style, index) => (
      <div
        key={index}
        className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors cursor-pointer"
        onClick={() => handleStyleSelect(style)}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400">LI</span>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
              {style} Style
            </span>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Optimized for LinkedIn
            </p>
          </div>
        </div>
        
        {selectedStyle === style && (
          <CheckCircle className="w-4 h-4 text-green-500" />
        )}
      </div>
    )), [platformStyles, selectedStyle, handleStyleSelect]);

  return (
    <div className="space-y-4">
      {/* Smart Suggestions Button */}
      <button
        onClick={handleGetSuggestions}
        disabled={isAnalyzing}
        className="w-full inline-flex items-center justify-center px-4 py-3 border border-purple-200 dark:border-purple-700 rounded-xl text-sm font-medium text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors disabled:opacity-50"
      >
        {isAnalyzing ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600 mr-2" />
            Analyzing your profile...
          </>
        ) : (
          <>
            <Brain className="mr-2 h-4 w-4" />
            Get Smart Suggestions
          </>
        )}
      </button>

      {showSuggestions && (
        <div className="space-y-4">
          {/* Tabs */}
          <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => handleTabChange('smart')}
              className={`flex-1 px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'smart'
                  ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Brain className="w-3 h-3 mr-1 inline" />
              Smart
            </button>
            <button
              onClick={() => handleTabChange('seasonal')}
              className={`flex-1 px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'seasonal'
                  ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Calendar className="w-3 h-3 mr-1 inline" />
              Seasonal
            </button>
            <button
              onClick={() => handleTabChange('platform')}
              className={`flex-1 px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'platform'
                  ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Globe className="w-3 h-3 mr-1 inline" />
              Platform
            </button>
          </div>

          {/* Smart Suggestions */}
          {activeTab === 'smart' && suggestions.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-purple-500" />
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                  AI-Powered Suggestions
                </h4>
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                {suggestionItems}
              </div>
            </div>
          )}

          {/* Seasonal Suggestions */}
          {activeTab === 'seasonal' && seasonalStyle && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-4 h-4 text-orange-500" />
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Seasonal Theme
                </h4>
              </div>
              
              <div className="p-3 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg border border-orange-200 dark:border-orange-700">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                      {seasonalStyle} Style
                    </span>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Perfect for the current season
                    </p>
                  </div>
                  <button
                    onClick={() => handleStyleSelect(seasonalStyle)}
                    className="px-3 py-1 text-xs font-medium text-orange-700 dark:text-orange-300 bg-orange-100 dark:bg-orange-900/30 rounded-md hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-colors"
                  >
                    Use This
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Platform Optimized */}
          {activeTab === 'platform' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-3">
                <Globe className="w-4 h-4 text-blue-500" />
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Platform Optimized
                </h4>
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                {platformItems}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};