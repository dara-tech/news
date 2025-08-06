import { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

if (!apiKey) {
  throw new Error("NEXT_PUBLIC_GOOGLE_API_KEY is not set in environment variables.");
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

export interface SEOAnalysisResult {
  score: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  feedback: {
    title: {
      score: number;
      issues: string[];
      suggestions: string[];
      trends: string[];
    };
    description: {
      score: number;
      issues: string[];
      suggestions: string[];
      trends: string[];
    };
    keywords: {
      score: number;
      issues: string[];
      suggestions: string[];
      trends: string[];
      trendingKeywords: string[];
    };
    overall: {
      strengths: string[];
      weaknesses: string[];
      recommendations: string[];
      competitiveAnalysis: string[];
    };
  };
  technicalSEO: {
    characterCounts: {
      titleEn: number;
      titleKh: number;
      descEn: number;
      descKh: number;
    };
    keywordDensity: number;
    readabilityScore: number;
    mobileOptimization: boolean;
  };
  trends: {
    currentTrends: string[];
    seasonalTrends: string[];
    competitorTrends: string[];
    emergingKeywords: string[];
  };
}

export interface SEOContent {
  title: string;
  metaTitle: {
    en: string;
    kh: string;
  };
  metaDescription: {
    en: string;
    kh: string;
  };
  keywords: string;
  content?: string;
  category?: string;
}

export const useSEOAnalysis = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeSEO = async (seoContent: SEOContent): Promise<SEOAnalysisResult | null> => {
    if (!seoContent.title) {
      setError("Title is required for SEO analysis.");
      return null;
    }

    setIsAnalyzing(true);
    setError(null);

    const prompt = `
      Perform comprehensive SEO analysis for:
      Title: "${seoContent.title}"
      Meta Title (EN): "${seoContent.metaTitle.en}"
      Meta Title (KH): "${seoContent.metaTitle.kh}"
      Meta Description (EN): "${seoContent.metaDescription.en}"
      Meta Description (KH): "${seoContent.metaDescription.kh}"
      Keywords: "${seoContent.keywords}"
      Category: "${seoContent.category || 'General'}"

      Return JSON with score, grade, feedback, technical SEO, and trends.
      Focus on current best practices, trending keywords, competitive analysis, and actionable recommendations.
    `;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonString = text.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(jsonString);

      return parsed as SEOAnalysisResult;
    } catch (e) {
      console.error("Error analyzing SEO content:", e);
      setError("Failed to analyze SEO content from Gemini API.");
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getTrendingKeywords = async (category: string): Promise<string[]> => {
    setIsAnalyzing(true);
    setError(null);

    const prompt = `Provide trending keywords for category: "${category}". Return as JSON array.`;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonString = text.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(jsonString);

      return parsed as string[];
    } catch (e) {
      console.error("Error getting trending keywords:", e);
      setError("Failed to get trending keywords.");
      return [];
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateAdvancedSEO = async (title: string, category: string): Promise<{
    metaTitle: { en: string; kh: string };
    metaDescription: { en: string; kh: string };
    keywords: string;
    schemaMarkup: string;
  } | null> => {
    if (!title) {
      setError("Title is required for advanced SEO generation.");
      return null;
    }

    setIsAnalyzing(true);
    setError(null);

    const prompt = `
      Generate advanced SEO content for: "${title}" in category: "${category}"
      Include optimized meta titles, descriptions, trending keywords, and schema markup.
      Return as JSON with metaTitle, metaDescription, keywords, and schemaMarkup.
    `;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonString = text.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(jsonString);

      return parsed;
    } catch (e) {
      console.error("Error generating advanced SEO:", e);
      setError("Failed to generate advanced SEO content.");
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  };

  return {
    isAnalyzing,
    error,
    analyzeSEO,
    getTrendingKeywords,
    generateAdvancedSEO
  };
}; 