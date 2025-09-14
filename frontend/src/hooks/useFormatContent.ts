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
            Convert the following plain text news article into properly formatted HTML content suitable for a professional news website.

            Content to format:
            ${content.en}

            Requirements:
            - Use <h2> tags for section headings (e.g., "Background", "Current Situation", "Implications")
            - Use <p> tags for all paragraphs
            - Use <blockquote> tags for quotes and important statements
            - Use <ul> and <li> tags for lists when appropriate
            - Use <strong> tags for emphasis on key points
            - Use <em> tags for subtle emphasis
            - Structure content with proper headings and subheadings
            - Include 3-5 section headings to break up the content
            - Make content visually appealing and easy to read
            - Maintain professional journalistic style

            Return only the formatted HTML content without any additional text or explanations.
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
