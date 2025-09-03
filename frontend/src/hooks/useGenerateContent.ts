import { useState } from "react";
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

if (!apiKey) {
  throw new Error("NEXT_PUBLIC_GOOGLE_API_KEY is not set in environment variables.");
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

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
      Based on the following news article topic, generate comprehensive content suitable for a professional news website. Create detailed, well-structured content in both English and Khmer languages:

      REQUIREMENTS:
      - Title: Create engaging, informative headlines (30-70 characters) that are SEO-friendly and capture reader attention
      - Description: Write compelling meta descriptions (120-160 characters) that summarize the article effectively for search engines and social media
      - Content: Generate comprehensive, well-researched articles (800-1500 words) with proper structure including:
        * Opening paragraph that hooks the reader and provides context
        * Multiple detailed paragraphs covering different aspects of the topic
        * Quotes or expert opinions when relevant
        * Background information and context
        * Current implications and future outlook
        * Proper journalistic structure with who, what, when, where, why, and how
        * Professional tone appropriate for news media
        * Fact-based information with logical flow

      LANGUAGE REQUIREMENTS:
      - English: Use professional journalistic style, active voice, clear and concise language
      - Khmer: Use appropriate formal Khmer language suitable for news media, proper grammar and vocabulary

      FORMATTING:
      - Use proper paragraph breaks for readability
      - Include transitional phrases between sections
      - Maintain consistency in tone and style throughout
      - Ensure cultural sensitivity and accuracy in both languages

      IMPORTANT: You must respond with ONLY a valid JSON object. Do not include any additional text, explanations, or markdown formatting. The JSON must be properly formatted with all strings properly escaped.

      The output must be a valid JSON object with this exact structure: 
      { 
        "title": { 
          "en": "English headline here", 
          "kh": "Khmer headline here" 
        }, 
        "description": { 
          "en": "English description here", 
          "kh": "Khmer description here" 
        }, 
        "content": { 
          "en": "Comprehensive English article content here with multiple paragraphs", 
          "kh": "Comprehensive Khmer article content here with multiple paragraphs" 
        } 
      }

      Topic: "${prompt}"
      
      Generate detailed, professional news content:
    `;
    try {
      const result = await model.generateContent(contentPrompt);
      const response = await result.response;
      const text = response.text();
      
      // Clean up the response text
      let jsonString = text.trim();
      
      // Remove markdown code blocks if present
      jsonString = jsonString.replace(/```json\s*|\s*```/g, '');
      
      // Clean up any remaining markdown artifacts
      jsonString = jsonString.replace(/```html\s*|\s*```/g, '');
      jsonString = jsonString.replace(/Background\s*/gi, '');
      jsonString = jsonString.replace(/ផ្ទៃខាងក្រោយ\s*/gi, '');
      
      // Find JSON object boundaries
      const jsonStart = jsonString.indexOf('{');
      const jsonEnd = jsonString.lastIndexOf('}');
      
      if (jsonStart === -1 || jsonEnd === -1) {
        throw new Error("No valid JSON object found in response");
      }
      
      // Extract only the JSON part
      jsonString = jsonString.substring(jsonStart, jsonEnd + 1);
      
      // Try to parse the JSON
      let parsed;
      try {
        parsed = JSON.parse(jsonString);
      } catch (parseError) {
        // If parsing fails, try to fix common JSON issues
        console.warn("Initial JSON parse failed, attempting to fix:", parseError);
        
        // Fix common issues: unescaped quotes, newlines in strings
        jsonString = jsonString
          .replace(/(?<!\\)"/g, '\\"') // Escape unescaped quotes
          .replace(/\n/g, '\\n') // Escape newlines
          .replace(/\r/g, '\\r') // Escape carriage returns
          .replace(/\t/g, '\\t'); // Escape tabs
        
        // Try parsing again
        parsed = JSON.parse(jsonString);
      }
      
      // Validate the structure
      if (!parsed || typeof parsed !== 'object') {
        throw new Error("Invalid JSON structure received");
      }
      
      return {
        title: parsed.title || { en: '', kh: '' },
        description: parsed.description || { en: '', kh: '' },
        content: parsed.content || { en: '', kh: '' },
      };
    } catch (e) {
      console.error("Error generating content from Gemini API:", e);
      setError(`Failed to generate content: ${e instanceof Error ? e.message : 'Unknown error'}`);
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
      Based on the following news article, generate relevant tags for SEO and content categorization:

      REQUIREMENTS:
      - Generate 5-7 highly relevant tags
      - Tags should be in English only
      - Use single words or short phrases (1-3 words maximum)
      - Focus on key topics, themes, locations, people, organizations mentioned
      - Include both specific and general categories
      - Avoid overly generic tags like "news" or "article"
      - Consider trending topics and searchable keywords
      - Tags should help with content discovery and organization
      - No hashtags (#), no special characters, no extra formatting
      - Separate tags with commas only

      IMPORTANT: Respond with ONLY the comma-separated tags. Do not include any additional text, explanations, or formatting.

      ARTICLE CONTENT:
      Title: "${context.title}"
      Content: "${context.content}"

      Generate comma-separated tags (example format: politics, economy, healthcare, government policy, public health):
    `;
    try {
      const result = await model.generateContent(tagsPrompt);
      const response = await result.response;
      const text = response.text().trim();
      
      // Clean up the response and extract tags
      let cleanText = text
        .replace(/\n/g, '') // Remove newlines
        .replace(/Tags?:/gi, '') // Remove "Tags:" prefix
        .replace(/^[,\s]+|[,\s]+$/g, '') // Remove leading/trailing commas and spaces
        .trim();
      
      // If the response looks like it might contain JSON or other formatting, try to extract just the tags
      if (cleanText.includes('{') || cleanText.includes('[')) {
        // Try to find comma-separated values
        const commaMatch = cleanText.match(/[a-zA-Z0-9\s-]+(?:,\s*[a-zA-Z0-9\s-]+)*/);
        if (commaMatch) {
          cleanText = commaMatch[0];
        }
      }
      
      const tags = cleanText.split(',').map(tag => tag.trim()).filter(Boolean);
      
      // Ensure we have between 3-7 tags and clean them
      const cleanedTags = tags.slice(0, 7).map(tag => 
        tag.toLowerCase()
           .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except hyphens
           .trim()
      ).filter(tag => tag.length > 0 && tag.length <= 20); // Filter out empty or too long tags
      
      if (cleanedTags.length < 3) {
        console.warn("Generated too few tags:", cleanedTags);
        return null;
      }
      
      return cleanedTags;
    } catch (e) {
      console.error("Error generating tags from Gemini API:", e);
      setTagsError(`Failed to generate tags: ${e instanceof Error ? e.message : 'Unknown error'}`);
      return null;
    } finally {
      setIsGeneratingTags(false);
    }
  };

  return { isGenerating, error, generateContent, isGeneratingTags, tagsError, generateTags };
}