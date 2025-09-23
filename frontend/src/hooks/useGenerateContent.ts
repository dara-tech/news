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
      You are an expert journalist and content strategist with 15+ years of experience in professional news media. Generate comprehensive, publication-ready content that meets the highest editorial standards.

      TOPIC: "${prompt}"

      EXPERT JOURNALISM REQUIREMENTS:

      TITLE CREATION (30-70 characters each):
      - English: Create compelling, SEO-optimized headlines that follow AP Style guidelines
      - Khmer: Write culturally appropriate, engaging headlines in formal Khmer
      - Use active voice, present tense, and strong action verbs
      - Include key facts, numbers, or impact when relevant
      - Avoid clickbait while maintaining reader interest

      META DESCRIPTIONS (120-160 characters each):
      - English: Write compelling summaries that drive clicks and engagement
      - Khmer: Create culturally sensitive descriptions that resonate with Khmer readers
      - Include primary keywords naturally
      - End with a call-to-action or compelling detail
      - Optimize for social media sharing

      ARTICLE CONTENT (1000-2000 words each):
      - Lead paragraph: Hook readers with the most important information (5W+H)
      - Nut graph: Explain why this story matters and its significance
      - Body paragraphs: Develop the story with multiple perspectives and sources
      - Expert quotes: Include relevant quotes from authorities or stakeholders
      - Background context: Provide necessary historical or contextual information
      - Current developments: Detail recent events and their implications
      - Future outlook: Discuss potential consequences and next steps
      - Conclusion: Summarize key points and provide forward-looking perspective

      CRITICAL FORMATTING REQUIREMENTS:
      - Generate content in HTML format with proper tags
      - Use <h2> tags for section headings (e.g., "Background", "Current Situation", "Implications")
      - Use <p> tags for all paragraphs
      - Use <blockquote> tags for quotes with proper attribution
      - Use <ul> and <li> tags for lists when appropriate
      - Use <strong> tags for emphasis on key points
      - Use <em> tags for subtle emphasis
      - Structure content with 3-5 section headings to break up the content
      - Make content visually appealing and easy to read

      PROFESSIONAL WRITING STANDARDS:
      - Use inverted pyramid structure (most important info first)
      - Write in active voice with clear, concise sentences
      - Include specific details, numbers, and concrete examples
      - Maintain objective, authoritative tone throughout
      - Use transitional phrases to connect ideas smoothly
      - Apply proper journalistic attribution and sourcing
      - Ensure factual accuracy and balanced reporting

      EXPERT FORMATTING:
      - Structure content with clear section breaks
      - Use subheadings to organize complex information
      - Include bullet points or numbered lists for key information
      - Format quotes as blockquotes with proper attribution
      - Add emphasis to important statistics and key facts
      - Create scannable content with varied paragraph lengths

      CULTURAL SENSITIVITY:
      - English: Use international journalistic standards and terminology
      - Khmer: Employ formal, respectful language appropriate for news media
      - Consider cultural context and local perspectives
      - Ensure translations maintain original meaning and impact
      - Use appropriate honorifics and formal address in Khmer

      SEO AND ENGAGEMENT OPTIMIZATION:
      - Include relevant keywords naturally throughout content
      - Use power words that drive engagement and sharing
      - Structure content for easy scanning and mobile reading
      - Include social media-friendly elements and quotable passages
      - Optimize for featured snippets and search visibility

      CRITICAL: Respond with ONLY a valid JSON object. No additional text, explanations, or markdown formatting.

      REQUIRED JSON STRUCTURE:
      {
        "title": {
          "en": "Expert-crafted English headline here",
          "kh": "Expert-crafted Khmer headline here"
        },
        "description": {
          "en": "Compelling English meta description here",
          "kh": "Compelling Khmer meta description here"
        },
        "content": {
          "en": "Comprehensive, expert-level English article in HTML format with <h2> section headings, <p> paragraphs, <blockquote> quotes, <ul> lists, and <strong>/<em> emphasis tags for professional structure, quotes, analysis, and forward-looking perspective",
          "kh": "Comprehensive, expert-level Khmer article in HTML format with <h2> section headings, <p> paragraphs, <blockquote> quotes, <ul> lists, and <strong>/<em> emphasis tags for professional structure, quotes, analysis, and forward-looking perspective"
        }
      }

      Generate expert-level, publication-ready content:
    `;
    try {
      const result = await model.generateContent(contentPrompt);
      const response = await result.response;
      const text = response.text();
      
      // Clean up the response text
      let jsonString = text.trim();
      
      // Remove markdown code blocks if present
      jsonString = jsonString.replace(/```json\s*|\s*```/g, '');
      jsonString = jsonString.replace(/```html\s*|\s*```/g, '');
      jsonString = jsonString.replace(/```\s*|\s*```/g, '');
      
      // Clean up any remaining markdown artifacts
      jsonString = jsonString.replace(/Background\s*/gi, '');
      jsonString = jsonString.replace(/ផ្ទៃខាងក្រោយ\s*/gi, '');
      jsonString = jsonString.replace(/Here's the formatted content:\s*/gi, '');
      jsonString = jsonString.replace(/Here is the formatted content:\s*/gi, '');
      
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
        console.log('JSON Parse Error:', parseError);
        console.log('Raw JSON String:', jsonString);
        
        // If parsing fails, try to fix common JSON issues
        // Fix common issues: unescaped quotes, newlines in strings
        jsonString = jsonString
          .replace(/(?<!\\)"/g, '\\"') // Escape unescaped quotes
          .replace(/\n/g, '\\n') // Escape newlines
          .replace(/\r/g, '\\r') // Escape carriage returns
          .replace(/\t/g, '\\t'); // Escape tabs
        
        console.log('Fixed JSON String:', jsonString);
        
        // Try parsing again
        try {
          parsed = JSON.parse(jsonString);
        } catch (secondError) {
          console.log('Second Parse Error:', secondError);
          throw new Error(`Failed to parse JSON response: ${secondError instanceof Error ? secondError.message : 'Unknown error'}`);
        }
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
    } catch (e) {setError(`Failed to generate content: ${e instanceof Error ? e.message : 'Unknown error'}`);
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
      
      if (cleanedTags.length < 3) {return null;
      }
      
      return cleanedTags;
    } catch (e) {setTagsError(`Failed to generate tags: ${e instanceof Error ? e.message : 'Unknown error'}`);
      return null;
    } finally {
      setIsGeneratingTags(false);
    }
  };

  return { isGenerating, error, generateContent, isGeneratingTags, tagsError, generateTags };
}