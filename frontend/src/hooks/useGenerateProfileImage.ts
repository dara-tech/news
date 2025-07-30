import { useState } from "react";
import { GoogleGenAI, Modality } from "@google/genai";

const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

if (!apiKey) {
  throw new Error("NEXT_PUBLIC_GOOGLE_API_KEY is not set in environment variables.");
}

export type ProfileImageStyle =
  | "simple"
  | "professional"
  | "creative"
  | "gaming"
  | "minimalist"
  | "corporate"
  | "tech"
  | "artistic"
  | "mood"
  | "mood2"
  | "mood3"
  | "mood4";

export interface ProfileImagePreferences {
  style?: ProfileImageStyle;
  colors?: string[];
  theme?: "light" | "dark" | "colorful" | "monochrome";
  gender?: "male" | "female" | "neutral";
  age?: "young" | "adult" | "senior";
  profession?: string;
  platform?: string;
}

export interface GeneratedProfileImage {
  file: File;
  text: string;
  style: ProfileImageStyle;
  previewUrl: string;
  generatedAt: Date;
}

export function useGenerateProfileImage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generationProgress, setGenerationProgress] = useState<{
    current: number;
    total: number;
    style: ProfileImageStyle;
  } | null>(null);

  const generateProfileImage = async (
    username: string,
    preferences?: ProfileImagePreferences
  ): Promise<GeneratedProfileImage | null> => {
    setIsGenerating(true);
    setError(null);

    try {
      const ai = new GoogleGenAI({ apiKey });

      // Build a smart prompt for profile image generation
      const style = preferences?.style || "professional";
      const colors = preferences?.colors?.join(", ") || "blue, purple";

      const prompt = buildPrompt(username, style, colors);

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

      const parts = response?.candidates?.[0]?.content?.parts;
      if (!parts) throw new Error("Invalid response format from the API");

      let imageData = null;
      let text = "";

      for (const part of parts) {
        if (part.text) text = part.text;
        else if (part.inlineData?.data) imageData = part.inlineData.data;
      }

      if (!imageData) throw new Error("No image data returned from the API");

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
        `profile-${username.toLowerCase()}-${style}.png`,
        { type: "image/png" }
      );

      // Create preview URL
      const previewUrl = URL.createObjectURL(blob);

      return {
        file,
        text,
        style,
        previewUrl,
        generatedAt: new Date(),
      };
    } catch (error: unknown) {
      let message = "Profile image generation failed. Please try again later.";
      if (error instanceof Error) {
        message = error.message;
      }
      setError(message);
      return null;
    } finally {
      setIsGenerating(false);
      setGenerationProgress(null);
    }
  };

  const buildPrompt = (
    username: string,
    style: ProfileImageStyle,
    colors: string
  ): string => {
    const stylePrompts = {
      simple: `Create a friendly, clean human character portrait for ${username}. A warm, approachable person with a gentle smile. Use colors: ${colors}. Style: clean, minimalist, professional.`,
      professional: `Create a professional business person character for ${username}. A confident, well-dressed individual in business attire. Use colors: ${colors}. Style: corporate, sophisticated, trustworthy.`,
      creative: `Create a magical fantasy character for ${username}. A whimsical, colorful character with magical elements, sparkles, and fantasy features. Use colors: ${colors}. Style: fantasy, magical, vibrant.`,
      gaming: `Create a cool gaming character for ${username}. A badass, edgy character with gaming elements, neon effects, and cyberpunk vibes. Use colors: ${colors}. Style: gaming, futuristic, cool.`,
      minimalist: `Create a cute animal character for ${username}. An adorable, friendly animal (cat, dog, fox, or other cute creature) with big eyes and sweet expression. Use colors: ${colors}. Style: cute, kawaii, adorable.`,
      corporate: `Create a futuristic robot character for ${username}. A sleek, metallic robot with glowing elements and advanced technology features. Use colors: ${colors}. Style: robotic, futuristic, tech.`,
      tech: `Create an alien character for ${username}. An extraterrestrial being with unique features, glowing elements, and otherworldly appearance. Use colors: ${colors}. Style: alien, sci-fi, otherworldly.`,
      artistic: `Create an anime character for ${username}. A stylized anime avatar with big eyes, colorful hair, and anime-style features. Use colors: ${colors}. Style: anime, manga, stylized.`,
      mood: `Create a happy, cheerful character for ${username}. A bright, optimistic character with a big smile, positive energy, and warm colors. Use colors: ${colors}. Style: happy, cheerful, positive.`,
      mood2: `Create a calm, peaceful character for ${username}. A serene, tranquil character with gentle features, soft colors, and a peaceful expression. Use colors: ${colors}. Style: calm, peaceful, serene.`,
      mood3: `Create an energetic, dynamic character for ${username}. A lively, active character with vibrant energy, dynamic poses, and exciting colors. Use colors: ${colors}. Style: energetic, dynamic, lively.`,
      mood4: `Create a thoughtful, introspective character for ${username}. A contemplative character with deep thinking expression, subtle colors, and intellectual appearance. Use colors: ${colors}. Style: thoughtful, introspective, intellectual.`
    };

    const basePrompt = stylePrompts[style] || stylePrompts.simple;

    return `${basePrompt} Make it a profile picture format, centered, high quality, detailed, suitable for social media profiles. The character should be the main focus with a clean background.`;
  };

  // Individual style generators
  const generateSimpleProfileImage = async (
    username: string
  ): Promise<GeneratedProfileImage | null> => {
    return generateProfileImage(username, {
      style: "simple",
      colors: ["#3B82F6", "#8B5CF6"],
    });
  };

  const generateProfessionalProfileImage = async (
    username: string
  ): Promise<GeneratedProfileImage | null> => {
    return generateProfileImage(username, {
      style: "professional",
      colors: ["#1F2937", "#3B82F6"],
    });
  };

  const generateCreativeProfileImage = async (
    username: string
  ): Promise<GeneratedProfileImage | null> => {
    return generateProfileImage(username, {
      style: "creative",
      colors: ["#EC4899", "#8B5CF6", "#06B6D4"],
    });
  };

  const generateGamingProfileImage = async (
    username: string
  ): Promise<GeneratedProfileImage | null> => {
    return generateProfileImage(username, {
      style: "gaming",
      colors: ["#FF6B6B", "#4ECDC4", "#45B7D1"],
    });
  };

  const generateMinimalistProfileImage = async (
    username: string
  ): Promise<GeneratedProfileImage | null> => {
    return generateProfileImage(username, {
      style: "minimalist",
      colors: ["#F3F4F6", "#9CA3AF"],
    });
  };

  const generateCorporateProfileImage = async (
    username: string
  ): Promise<GeneratedProfileImage | null> => {
    return generateProfileImage(username, {
      style: "corporate",
      colors: ["#1E40AF", "#374151"],
    });
  };

  const generateTechProfileImage = async (
    username: string
  ): Promise<GeneratedProfileImage | null> => {
    return generateProfileImage(username, {
      style: "tech",
      colors: ["#10B981", "#3B82F6", "#6366F1"],
    });
  };

  const generateArtisticProfileImage = async (
    username: string
  ): Promise<GeneratedProfileImage | null> => {
    return generateProfileImage(username, {
      style: "artistic",
      colors: ["#F59E0B", "#EC4899", "#8B5CF6"],
    });
  };

  // Batch generation with progress tracking
  const generateBatchProfileImages = async (
    username: string,
    styles: ProfileImageStyle[] = [
      "simple",
      "professional",
      "creative",
      "gaming",
      "minimalist",
      "corporate",
      "tech",
      "artistic",
    ]
  ): Promise<GeneratedProfileImage[]> => {
    setIsGenerating(true);
    setError(null);
    const results: GeneratedProfileImage[] = [];

    try {
      for (let i = 0; i < styles.length; i++) {
        const style = styles[i];
        setGenerationProgress({
          current: i + 1,
          total: styles.length,
          style,
        });

        const result = await generateProfileImage(username, { style });
        if (result) {
          results.push(result);
        }

        // Small delay between generations to avoid rate limiting
        if (i < styles.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      }

      return results;
    } catch (error: unknown) {
      let message = "Batch generation failed. Please try again later.";
      if (error instanceof Error) {
        message = error.message;
      }
      setError(message);
      return results; // Return partial results
    } finally {
      setIsGenerating(false);
      setGenerationProgress(null);
    }
  };

  return {
    isGeneratingProfileImage: isGenerating,
    profileImageGenerationError: error,
    generationProgress,
    generateProfileImage,
    generateSimpleProfileImage,
    generateProfessionalProfileImage,
    generateCreativeProfileImage,
    generateGamingProfileImage,
    generateMinimalistProfileImage,
    generateCorporateProfileImage,
    generateTechProfileImage,
    generateArtisticProfileImage,
    generateBatchProfileImages,
  };
}