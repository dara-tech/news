import { useState } from "react";
import { GoogleGenAI, Modality } from "@google/genai";

const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

if (!apiKey) {
  throw new Error("NEXT_PUBLIC_GOOGLE_API_KEY is not set in environment variables.");
}

export function useGenerateImage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateImage = async (prompt: string): Promise<{ file: File; text: string } | null> => {
    setIsGenerating(true);
    setError(null);
    try {
      const ai = new GoogleGenAI({ apiKey });
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
      const file = new File([blob], "generated-thumbnail.png", { type: "image/png" });
      return { file, text };
    } catch (error: unknown) {
      let message = "Image generation failed. Please try again later.";
      if (error instanceof Error) {
        message = error.message;
      }
      setError(message);
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  return { isGeneratingImage: isGenerating, imageGenerationError: error, generateImage };
} 