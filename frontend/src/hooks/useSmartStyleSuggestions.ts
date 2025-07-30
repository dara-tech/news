import { useState, useCallback } from 'react';
import { ProfileImageStyle } from './useGenerateProfileImage';

interface UserContext {
  profession?: string;
  interests?: string[];
  age?: number;
  company?: string;
  industry?: string;
  experience?: 'junior' | 'mid' | 'senior' | 'executive';
}

interface StyleSuggestion {
  style: ProfileImageStyle;
  confidence: number;
  reason: string;
  priority: 'high' | 'medium' | 'low';
}

export function useSmartStyleSuggestions() {
  const [suggestions, setSuggestions] = useState<StyleSuggestion[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeUserContext = useCallback((userContext: UserContext): StyleSuggestion[] => {
    const suggestions: StyleSuggestion[] = [];
    
    // Profession-based suggestions
    if (userContext.profession) {
      const profession = userContext.profession.toLowerCase();
      
      if (profession.includes('developer') || profession.includes('engineer') || profession.includes('programmer')) {
        suggestions.push({
          style: 'tech',
          confidence: 0.9,
          reason: 'Perfect for tech professionals',
          priority: 'high'
        });
        suggestions.push({
          style: 'minimalist',
          confidence: 0.7,
          reason: 'Clean and professional for developers',
          priority: 'medium'
        });
      }
      
      if (profession.includes('designer') || profession.includes('artist') || profession.includes('creative')) {
        suggestions.push({
          style: 'creative',
          confidence: 0.9,
          reason: 'Perfect for creative professionals',
          priority: 'high'
        });
        suggestions.push({
          style: 'artistic',
          confidence: 0.8,
          reason: 'Showcases artistic flair',
          priority: 'high'
        });
      }
      
      if (profession.includes('manager') || profession.includes('director') || profession.includes('executive')) {
        suggestions.push({
          style: 'corporate',
          confidence: 0.9,
          reason: 'Professional for leadership roles',
          priority: 'high'
        });
        suggestions.push({
          style: 'professional',
          confidence: 0.8,
          reason: 'Business-appropriate design',
          priority: 'high'
        });
      }
      
      if (profession.includes('gamer') || profession.includes('streamer') || profession.includes('esports')) {
        suggestions.push({
          style: 'gaming',
          confidence: 0.9,
          reason: 'Perfect for gaming professionals',
          priority: 'high'
        });
        suggestions.push({
          style: 'creative',
          confidence: 0.6,
          reason: 'Vibrant and energetic',
          priority: 'medium'
        });
      }
      
      if (profession.includes('marketing') || profession.includes('sales') || profession.includes('business')) {
        suggestions.push({
          style: 'professional',
          confidence: 0.8,
          reason: 'Professional for business roles',
          priority: 'high'
        });
        suggestions.push({
          style: 'corporate',
          confidence: 0.7,
          reason: 'Corporate-appropriate design',
          priority: 'medium'
        });
      }
    }

    // Industry-based suggestions
    if (userContext.industry) {
      const industry = userContext.industry.toLowerCase();
      
      if (industry.includes('finance') || industry.includes('banking')) {
        suggestions.push({
          style: 'corporate',
          confidence: 0.8,
          reason: 'Conservative and professional for finance',
          priority: 'high'
        });
      }
      
      if (industry.includes('startup') || industry.includes('tech')) {
        suggestions.push({
          style: 'tech',
          confidence: 0.8,
          reason: 'Modern and innovative for startups',
          priority: 'high'
        });
      }
      
      if (industry.includes('creative') || industry.includes('media')) {
        suggestions.push({
          style: 'creative',
          confidence: 0.8,
          reason: 'Creative and artistic for media',
          priority: 'high'
        });
      }
    }

    // Experience level suggestions
    if (userContext.experience) {
      if (userContext.experience === 'junior') {
        suggestions.push({
          style: 'simple',
          confidence: 0.7,
          reason: 'Clean and approachable for junior roles',
          priority: 'medium'
        });
      }
      
      if (userContext.experience === 'executive') {
        suggestions.push({
          style: 'corporate',
          confidence: 0.8,
          reason: 'Executive-level professionalism',
          priority: 'high'
        });
      }
    }

    // Age-based suggestions
    if (userContext.age) {
      if (userContext.age < 25) {
        suggestions.push({
          style: 'creative',
          confidence: 0.6,
          reason: 'Vibrant and modern for young professionals',
          priority: 'medium'
        });
      }
      
      if (userContext.age > 40) {
        suggestions.push({
          style: 'professional',
          confidence: 0.7,
          reason: 'Mature and established professional',
          priority: 'medium'
        });
      }
    }

    // Default suggestions if no specific matches
    if (suggestions.length === 0) {
      suggestions.push(
        {
          style: 'professional',
          confidence: 0.8,
          reason: 'Safe, professional choice',
          priority: 'high'
        },
        {
          style: 'simple',
          confidence: 0.7,
          reason: 'Clean and versatile',
          priority: 'medium'
        }
      );
    }

    // Sort by confidence and priority
    return suggestions.sort((a, b) => {
      if (a.priority === 'high' && b.priority !== 'high') return -1;
      if (b.priority === 'high' && a.priority !== 'high') return 1;
      return b.confidence - a.confidence;
    });
  }, []);

  const getSuggestions = useCallback(async (userContext: UserContext): Promise<StyleSuggestion[]> => {
    setIsAnalyzing(true);
    
    try {
      // Simulate AI analysis delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const suggestions = analyzeUserContext(userContext);
      setSuggestions(suggestions);
      return suggestions;
    } catch (error) {
      console.error('Error analyzing user context:', error);
      return [];
    } finally {
      setIsAnalyzing(false);
    }
  }, [analyzeUserContext]);

  const getSeasonalTheme = useCallback((): ProfileImageStyle | null => {
    const now = new Date();
    const month = now.getMonth();
    const day = now.getDate();

    // Christmas (December)
    if (month === 11) {
      return 'creative'; // Red and green themes
    }
    
    // Halloween (October)
    if (month === 9) {
      return 'artistic'; // Orange and purple themes
    }
    
    // Valentine's Day (February 14)
    if (month === 1 && day >= 10 && day <= 18) {
      return 'creative'; // Pink and red themes
    }
    
    // Summer (June-August)
    if (month >= 5 && month <= 7) {
      return 'simple'; // Bright, clean themes
    }
    
    // Winter (December-February)
    if (month === 11 || month === 0 || month === 1) {
      return 'minimalist'; // Cool, clean themes
    }

    return null;
  }, []);

  const getPlatformOptimizedStyles = useCallback((platform: 'linkedin' | 'twitter' | 'github' | 'instagram'): ProfileImageStyle[] => {
    const platformStyles = {
      linkedin: ['professional', 'corporate', 'simple'] as ProfileImageStyle[],
      twitter: ['creative', 'gaming', 'artistic'] as ProfileImageStyle[],
      github: ['tech', 'minimalist', 'simple'] as ProfileImageStyle[],
      instagram: ['creative', 'artistic', 'gaming'] as ProfileImageStyle[]
    };

    return platformStyles[platform] || ['professional', 'simple'];
  }, []);

  return {
    suggestions,
    isAnalyzing,
    getSuggestions,
    getSeasonalTheme,
    getPlatformOptimizedStyles
  };
}