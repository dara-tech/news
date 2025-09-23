import { useState } from "react";
import { GoogleGenerativeAI } from '@google/generative-ai';
import { formatArticleContent } from '@/lib/contentFormatter';
import api from '@/lib/api';

const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

if (!apiKey) {
  throw new Error("NEXT_PUBLIC_GOOGLE_API_KEY is not set in environment variables.");
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

interface FormattedContent {
  content: { en: string; kh: string };
}

export function useFormatContent() {
  const [isFormatting, setIsFormatting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatContent = async (content: { en: string; kh: string }, articleId?: string): Promise<FormattedContent | null> => {
    if (!content.en && !content.kh) {
      setError("Content is required to format.");
      return null;
    }
    
    setIsFormatting(true);
    setError(null);

    try {
      // If we have an article ID, use the backend API for better formatting
      if (articleId) {
        const response = await api.post(`/news/${articleId}/format-content`, {
          content: content,
          options: {
            enableAIEnhancement: true,
            enableReadabilityOptimization: true,
            enableSEOOptimization: true,
            enableVisualEnhancement: true,
            addSectionHeadings: true,
            enhanceQuotes: true,
            optimizeLists: true,
            enableContentAnalysis: false // Disable analysis for performance
          }
        });
        
        if (response.data.success) {
          return {
            content: response.data.data.content
          };
        } else {
          throw new Error(response.data.message || 'Failed to format content');
        }
      }

      // Fallback to local formatting if no article ID
      const formattedEn = formatArticleContent(content.en || '').html;
      const formattedKh = formatArticleContent(content.kh || '').html;

      // Check if content is already well-formatted
      const isAlreadyFormatted = formattedEn.includes('<h2>') || formattedEn.includes('<blockquote>') || formattedEn.includes('<ul>');
      
      if (isAlreadyFormatted) {
        // Content is already well-formatted, return as is
        return {
          content: {
            en: formattedEn,
            kh: formattedKh
          }
        };
      } else {
        // Content is plain text, use AI to convert to HTML
        try {
          const { GoogleGenerativeAI } = await import('@google/generative-ai');
          const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GOOGLE_API_KEY || '');
          const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
          
          const formatPrompt = `
            You are an expert web developer and content formatter. Convert the following plain text news article into professionally formatted HTML content suitable for a premium news website.

            CONTENT TO FORMAT:
            ${content.en}

            EXPERT FORMATTING REQUIREMENTS:
            - Use <h2> tags for main section headings (e.g., "Breaking News", "Background", "Current Situation", "Implications", "What's Next")
            - Use <h3> tags for subheadings within sections
            - Use <p> tags for all paragraphs with proper spacing
            - Use <blockquote> tags for quotes with attribution
            - Use <ul> and <li> tags for bullet point lists
            - Use <ol> and <li> tags for numbered lists
            - Use <strong> tags for emphasis on key points and important terms
            - Use <em> tags for subtle emphasis and italics
            - Structure content with 4-6 section headings to break up long content
            - Make content scannable and visually appealing
            - Maintain professional journalistic style and tone
            - Ensure proper HTML structure and semantic markup

            CRITICAL: Return ONLY the formatted HTML content. No explanations, no markdown, no additional text.
          `;

          const result = await model.generateContent(formatPrompt);
          const response = await result.response;
          const formattedEn = response.text().trim();

          return {
            content: {
              en: formattedEn,
              kh: formattedKh
            }
          };
        } catch (aiError) {// Fallback to local formatting if AI fails
          return {
            content: {
              en: formattedEn,
              kh: formattedKh
            }
          };
        }
      }
    } catch (error) {setError("Failed to format content. Please try again.");
      return null;
    } finally {
      setIsFormatting(false);
    }
  };

  return {
    isFormatting,
    error,
    formatContent
  };
}
