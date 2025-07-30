import { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

if (!apiKey) {
  throw new Error("NEXT_PUBLIC_GOOGLE_API_KEY is not set in environment variables.");
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

export const useGenerateSEO = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateSEO = async (title: string): Promise<{ metaTitle: { en: string; kh: string }; metaDescription: { en: string; kh: string }; keywords: string } | null> => {
    if (!title) {
      setError("Title is required to generate SEO content.");
      return null;
    }

    setIsGenerating(true);
    setError(null);

    const prompt = `
      Based on the following news article title, generate optimized SEO metadata in both English and Khmer.
      The output must be a valid JSON object with the following structure: { "metaTitle": { "en": "...", "kh": "..." }, "metaDescription": { "en": "...", "kh": "..." }, "keywords": "..." }.

      - For English (en):
        - metaTitle: A concise and compelling title, under 70 characters.
        - metaDescription: A brief summary of the article, under 160 characters.
      - For Khmer (kh):
        - metaTitle: A concise and compelling title in Khmer, under 70 characters.
        - metaDescription: A brief summary of the article in Khmer, under 160 characters.
      - keywords: A comma-separated list of 5-7 relevant keywords in English.

      Title: "${title}"

      JSON Output:
    `;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonString = text.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(jsonString);

      return {
        metaTitle: parsed.metaTitle || { en: '', kh: '' },
        metaDescription: parsed.metaDescription || { en: '', kh: '' },
        keywords: parsed.keywords || '',
      };
    } catch (e) {
      console.error("Error generating SEO content:", e);
      setError("Failed to generate content from Gemini API.");
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  return { isGenerating, error, generateSEO };
};