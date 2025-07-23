import { useState } from "react";
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

if (!apiKey) {
  throw new Error("NEXT_PUBLIC_GOOGLE_API_KEY is not set in environment variables.");
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

interface GeneratedContent {
  title: { en: string; kh: string };
  description: { en: string; kh: string };
  content: { en: string; kh: string };
}

export function useGenerateContent() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGeneratingTags, setIsGeneratingTags] = useState(false);
  const [tagsError, setTagsError] = useState<string | null>(null);

  const generateContent = async (prompt: string): Promise<GeneratedContent | null> => {
    if (!prompt) {
      setError("Prompt is required to generate content.");
      return null;
    }
    setIsGenerating(true);
    setError(null);
    const contentPrompt = `
      Based on the following news article topic, generate the following fields in both English and Khmer:
      - title (en, kh)
      - description (en, kh)
      - content (en, kh)
      The output must be a valid JSON object with this structure: { "title": { "en": "...", "kh": "..." }, "description": { "en": "...", "kh": "..." }, "content": { "en": "...", "kh": "..." } }.
      Topic: "${prompt}"
      JSON Output:
    `;
    try {
      const result = await model.generateContent(contentPrompt);
      const response = await result.response;
      const text = response.text();
      const jsonString = text.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(jsonString);
      return {
        title: parsed.title || { en: '', kh: '' },
        description: parsed.description || { en: '', kh: '' },
        content: parsed.content || { en: '', kh: '' },
      };
    } catch (e) {
      console.error("Error generating content from Gemini API:", e);
      setError("Failed to generate content from Gemini API.");
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const generateTags = async (context: { title: string; content: string }): Promise<string[] | null> => {
    if (!context.title && !context.content) {
      setTagsError("Title or content is required to generate tags.");
      return null;
    }
    setIsGeneratingTags(true);
    setTagsError(null);
    const tagsPrompt = `
      Based on the following news article, generate a comma-separated list of 5-7 relevant tags (in English, no hashtags, no extra text, just the tags):
      Title: "${context.title}"
      Content: "${context.content}"
      Tags:
    `;
    try {
      const result = await model.generateContent(tagsPrompt);
      const response = await result.response;
      const text = response.text().trim();
      // Expecting a comma-separated string
      const tags = text.replace(/\n/g, '').split(',').map(tag => tag.trim()).filter(Boolean);
      return tags;
    } catch (e) {
      console.error("Error generating tags from Gemini API:", e);
      setTagsError("Failed to generate tags from Gemini API.");
      return null;
    } finally {
      setIsGeneratingTags(false);
    }
  };

  return { isGenerating, error, generateContent, isGeneratingTags, tagsError, generateTags };
} 