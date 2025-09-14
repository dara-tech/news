'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { GoogleGenAI, Modality } from '@google/genai';

const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

if (!apiKey) {
  throw new Error("NEXT_PUBLIC_GOOGLE_API_KEY is not set in environment variables.");
}

export type LogoStyle = 
  | "minimal"
  | "modern" 
  | "classic"
  | "playful"
  | "corporate"
  | "tech"
  | "creative"
  | "elegant"
  | "bold"
  | "vintage"
  | "geometric"
  | "monogram"
  | "wordmark"
  | "emblem"
  | "badge"
  | "shield";

export interface LogoPreferences {
  style?: LogoStyle;
  colors?: string[];
  theme?: "light" | "dark" | "colorful" | "monochrome";
  industry?: string;
  format?: "svg" | "png" | "jpg";
  size?: "small" | "medium" | "large";
  fontFamily?: string;
  fontWeight?: string;
  borderRadius?: number;
  hasGradient?: boolean;
  hasShadow?: boolean;
}

export interface GeneratedLogo {
  id: string;
  url: string;
  previewUrl: string;
  style: LogoStyle;
  colors: string[];
  text: string;
  format: string;
  size: string;
  svgContent: string;
  createdAt: Date;
}

export function useGenerateLogo() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedLogos, setGeneratedLogos] = useState<GeneratedLogo[]>([]);

  // Smart style recommendation based on industry
  const recommendStyle = (industry?: string): LogoStyle => {
    if (!industry) return 'modern';
    
    const industryMap: Record<string, LogoStyle> = {
      "technology": "tech",
      "software": "tech",
      "startup": "modern",
      "finance": "corporate",
      "banking": "elegant",
      "healthcare": "corporate",
      "medical": "corporate",
      "education": "classic",
      "school": "classic",
      "restaurant": "playful",
      "food": "playful",
      "fashion": "creative",
      "art": "creative",
      "design": "geometric",
      "architecture": "geometric",
      "construction": "bold",
      "law": "elegant",
      "consulting": "corporate",
      "marketing": "creative",
      "entertainment": "playful",
      "gaming": "tech",
      "sports": "bold",
      "fitness": "bold",
      "automotive": "bold",
      "energy": "tech",
      "environmental": "geometric",
      "nonprofit": "emblem",
      "government": "badge",
      "military": "shield",
      "police": "badge",
      "fire": "shield",
    };
    
    const lowerIndustry = industry.toLowerCase();
    for (const [key, style] of Object.entries(industryMap)) {
      if (lowerIndustry.includes(key)) {
        return style;
      }
    }
    
    return 'modern';
  };

  // Smart color selection based on style and industry
  const getSmartColors = (style: LogoStyle, industry?: string): string[] => {
    const colorPalettes: Record<string, string[]> = {
      modern: ["#3B82F6", "#1E40AF", "#6366F1"],
      tech: ["#10B981", "#3B82F6", "#6366F1", "#1F2937"],
      corporate: ["#1F2937", "#4B5563", "#2563EB"],
      elegant: ["#374151", "#6B7280", "#9CA3AF"],
      classic: ["#1F2937", "#991B1B", "#F3F4F6"],
      creative: ["#EC4899", "#8B5CF6", "#06B6D4", "#10B981"],
      playful: ["#FF6B6B", "#4ECDC4", "#45B7D1", "#A855F7"],
      bold: ["#DC2626", "#EA580C", "#D97706", "#1F2937"],
      geometric: ["#6366F1", "#EC4899", "#F3F4F6"],
      minimal: ["#3B82F6", "#6B7280"],
      vintage: ["#92400E", "#78350F", "#451A03"],
      monogram: ["#1F2937", "#374151", "#6B7280"],
      wordmark: ["#1F2937", "#4B5563", "#9CA3AF"],
      emblem: ["#1F2937", "#DC2626", "#2563EB"],
      badge: ["#059669", "#DC2626", "#2563EB"],
      shield: ["#1E3A8A", "#1F2937", "#DC2626"],
    };
    
    // Industry-specific colors
    if (industry) {
      const industryColors: Record<string, string[]> = {
        "healthcare": ["#10B981", "#059669", "#047857"],
        "finance": ["#1F2937", "#374151", "#6B7280"],
        "education": ["#3B82F6", "#1E40AF", "#2563EB"],
        "food": ["#F59E0B", "#D97706", "#92400E"],
        "fashion": ["#EC4899", "#BE185D", "#9D174D"],
        "automotive": ["#DC2626", "#B91C1C", "#991B1B"],
        "energy": ["#F59E0B", "#D97706", "#92400E"],
        "environmental": ["#10B981", "#059669", "#047857"],
      };
      
      const lowerIndustry = industry.toLowerCase();
      for (const [key, colors] of Object.entries(industryColors)) {
        if (lowerIndustry.includes(key)) {
          return colors;
        }
      }
    }
    
    return colorPalettes[style] || ["#3B82F6", "#8B5CF6", "#10B981"];
  };

  // Build AI prompt for logo generation
  const buildLogoPrompt = (
    text: string,
    style: LogoStyle,
    colors: string[],
    preferences?: LogoPreferences
  ): string => {
    const stylePrompts: Record<string, string> = {
      minimal: `Create a minimalist logo for "${text}". Clean lines, simple shapes, essential elements only. Focus on typography and negative space. Colors: ${colors.join(', ')}. Ultra-clean, modern aesthetic.`,
      
      modern: `Design a contemporary logo for "${text}". Sleek, professional, with subtle gradients or modern typography. Forward-thinking design that feels current. Colors: ${colors.join(', ')}. Professional yet approachable.`,
      
      classic: `Create a timeless logo for "${text}". Traditional design elements, serif typography, balanced composition. Enduring appeal that won't date quickly. Colors: ${colors.join(', ')}. Sophisticated and trustworthy.`,
      
      playful: `Design a fun, energetic logo for "${text}". Rounded shapes, bright colors, friendly typography. Approachable and engaging design. Colors: ${colors.join(', ')}. Joyful and memorable.`,
      
      corporate: `Create a professional corporate logo for "${text}". Clean, authoritative design with strong typography. Conveys trust, stability, and professionalism. Colors: ${colors.join(', ')}. Business-ready and credible.`,
      
      tech: `Design a technology-focused logo for "${text}". Modern, digital aesthetic with geometric elements or tech-inspired typography. Forward-looking and innovative. Colors: ${colors.join(', ')}. Cutting-edge and dynamic.`,
      
      creative: `Create an artistic logo for "${text}". Creative typography, unique shapes, artistic flair. Expressive and imaginative design. Colors: ${colors.join(', ')}. Creative and distinctive.`,
      
      elegant: `Design an elegant logo for "${text}". Refined typography, sophisticated composition, premium feel. Luxury and sophistication. Colors: ${colors.join(', ')}. Upscale and refined.`,
      
      bold: `Create a bold, powerful logo for "${text}". Strong typography, impactful design, confident presence. Makes a statement. Colors: ${colors.join(', ')}. Strong and memorable.`,
      
      vintage: `Design a retro logo for "${text}". Classic typography, nostalgic elements, period-appropriate styling. Timeless appeal with vintage charm. Colors: ${colors.join(', ')}. Classic and nostalgic.`,
      
      geometric: `Create a geometric logo for "${text}". Clean shapes, mathematical precision, structured design. Modern and systematic. Colors: ${colors.join(', ')}. Precise and structured.`,
      
      monogram: `Design a monogram logo for "${text}". Use initials or first letter, elegant typography, sophisticated composition. Professional and refined. Colors: ${colors.join(', ')}. Classic and prestigious.`,
      
      wordmark: `Create a wordmark logo for "${text}". Focus on typography, clean lettering, distinctive font choice. Text-based design. Colors: ${colors.join(', ')}. Typography-focused.`,
      
      emblem: `Design an emblem logo for "${text}". Circular or shield-like design, contained within a shape, traditional elements. Classic and authoritative. Colors: ${colors.join(', ')}. Traditional and trustworthy.`,
      
      badge: `Create a badge-style logo for "${text}". Rounded rectangle shape, contained design, professional appearance. Official and credible. Colors: ${colors.join(', ')}. Professional and reliable.`,
      
      shield: `Design a shield logo for "${text}". Shield shape, protective and authoritative feel, strong presence. Security and trust. Colors: ${colors.join(', ')}. Protective and strong.`,
    };

    let basePrompt = stylePrompts[style] || `Create a professional logo for "${text}" in ${style} style. Colors: ${colors.join(', ')}.`;

    // Add preference modifiers
    if (preferences?.industry) {
      basePrompt += ` Industry: ${preferences.industry}.`;
    }
    
    if (preferences?.theme) {
      const themeMap = {
        light: "bright, clean, optimistic atmosphere",
        dark: "sophisticated, dramatic, powerful mood",
        colorful: "vibrant, energetic, dynamic palette",
        monochrome: "elegant black and white or grayscale aesthetic"
      };
      basePrompt += ` Theme: ${themeMap[preferences.theme]}.`;
    }

    // Enhanced final prompt with quality instructions
    return `${basePrompt}

CRITICAL INSTRUCTIONS:
- Create a high-quality logo suitable for business use
- Ensure the logo works well at different sizes (small to large)
- Make it scalable and vector-friendly
- Use appropriate typography that matches the style
- Ensure good contrast and readability
- Create a design that's memorable and distinctive
- Make sure it works in both color and monochrome
- Ensure the logo represents the brand appropriately
- Create a design that's timeless and won't date quickly
- Focus on clean, professional execution
- Ensure the logo is suitable for digital and print use
- Make it appropriate for the specified industry and style`;
  };

  // Generate logo using Gemini AI
  const generateLogoWithAI = async (
    text: string,
    style: LogoStyle,
    colors: string[],
    preferences?: LogoPreferences
  ): Promise<GeneratedLogo | null> => {
    try {
      setIsGenerating(true);
      setError(null);

      const ai = new GoogleGenAI({ apiKey });
      const prompt = buildLogoPrompt(text, style, colors, preferences);

      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash-preview-image-generation",
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
        config: {
          responseModalities: [Modality.TEXT, Modality.IMAGE],
        },
      });

      const parts = response?.candidates?.[0]?.content?.parts;if (!parts) throw new Error("Invalid response format from the API");

      let imageData: string | null = null;
      let generatedText = "";

      for (const part of parts) {if (part.text) {
          generatedText = part.text;}
        else if (part.inlineData?.data) {
          imageData = part.inlineData.data;}
      }

      if (!imageData) {
        throw new Error("No image data returned from the API");
      }

      // Convert base64 to Blob/File
      const byteString = atob(imageData);
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }

      const blob = new Blob([ab], { type: "image/png" });
      const file = new File(
        [blob],
        `logo-${text.toLowerCase()}-${style}.png`,
        { type: "image/png" }
      );

      // Create URLs
      const url = URL.createObjectURL(blob);
      const previewUrl = URL.createObjectURL(blob);// Create SVG placeholder for compatibility
      const svgContent = `
        <svg width="200" height="60" xmlns="http://www.w3.org/2000/svg">
          <image href="${url}" width="200" height="60" preserveAspectRatio="xMidYMid meet"/>
        </svg>
      `;

      const logo: GeneratedLogo = {
        id: `logo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        url,
        previewUrl,
        svgContent,
        style,
        colors,
        text,
        format: 'png',
        size: 'medium',
        createdAt: new Date(),
      };

      setGeneratedLogos(prev => [logo, ...prev]);
      toast.success('Logo generated successfully!');
      return logo;
    } catch (error: unknown) {let message = "Logo generation failed. Please try again later.";
      if (error instanceof Error) {
        message = error.message;
      }
      setError(message);
      toast.error(message);
      
      // Fallback: Create a simple SVG logo for testing
      const fallbackSvg = `
        <svg width="200" height="60" xmlns="http://www.w3.org/2000/svg">
          <rect width="200" height="60" fill="#3B82F6" rx="8"/>
          <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="white" font-family="Arial, sans-serif" font-size="18" font-weight="bold">${text}</text>
        </svg>
      `;
      
      const fallbackBlob = new Blob([fallbackSvg], { type: 'image/svg+xml' });
      const fallbackUrl = URL.createObjectURL(fallbackBlob);
      
      const fallbackLogo: GeneratedLogo = {
        id: `fallback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        url: fallbackUrl,
        previewUrl: fallbackUrl,
        svgContent: fallbackSvg,
        style,
        colors,
        text,
        format: 'svg',
        size: 'medium',
        createdAt: new Date(),
      };
      
      setGeneratedLogos(prev => [fallbackLogo, ...prev]);
      toast.success('Fallback logo created!');
      return fallbackLogo;
    } finally {
      setIsGenerating(false);
    }
  };

  const generateLogo = useCallback(async (options: {
    text: string;
    style?: LogoStyle;
    colors?: string[];
    size?: string;
    format?: string;
    preferences?: LogoPreferences;
  }): Promise<GeneratedLogo | null> => {
    const {
      text,
      style = 'modern',
      colors = getSmartColors(style),
      preferences = {}
    } = options;

    return generateLogoWithAI(text, style, colors, preferences);
  }, []);

  const generateMultipleLogos = useCallback(async (options: {
    text: string;
    styles?: LogoStyle[];
    colors?: string[];
    size?: string;
    format?: string;
    preferences?: LogoPreferences;
  }, count: number = 6): Promise<GeneratedLogo[]> => {
    try {
      setIsGenerating(true);
      setError(null);

      const {
        text,
        styles = ['minimal', 'modern', 'classic', 'playful', 'corporate', 'tech'],
        colors,
        preferences = {}
      } = options;

      const logos: GeneratedLogo[] = [];
      
      for (let i = 0; i < Math.min(count, styles.length); i++) {
        const styleColors = colors || getSmartColors(styles[i]);
        const logo = await generateLogoWithAI(text, styles[i], styleColors, preferences);
        if (logo) {
          logos.push(logo);
        }
        
        // Small delay between generations to avoid rate limiting
        if (i < Math.min(count, styles.length) - 1) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }

      setGeneratedLogos(prev => [...logos, ...prev]);
      toast.success(`${logos.length} logos generated successfully!`);
      return logos;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to generate logos';
      setError(errorMessage);
      toast.error(errorMessage);
      return [];
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const clearGeneratedLogos = useCallback(() => {
    setGeneratedLogos([]);
    setError(null);
  }, []);

  return {
    isGenerating,
    error,
    generatedLogos,
    generateLogo,
    generateMultipleLogos,
    clearGeneratedLogos,
    recommendStyle,
    getSmartColors,
  };
} 