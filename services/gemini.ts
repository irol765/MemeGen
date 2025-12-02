
import { GoogleGenAI } from "@google/genai";
import { MODEL_NAME } from "../constants";

// Helper to handle API Key logic
const getAIClient = async () => {
  try {
    if (window.aistudio && window.aistudio.hasSelectedApiKey) {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (!hasKey) {
        await window.aistudio.openSelectKey();
      }
    }
  } catch (e) {
    console.warn("AI Studio key selection not available or failed", e);
  }

  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("CRITICAL ERROR: process.env.API_KEY is missing. Please check your Vercel Project Settings > Environment Variables. Also ensure vite.config.ts is correctly configured to expose this variable.");
  }

  return new GoogleGenAI({ apiKey: apiKey || '' });
}

// Helper for retry logic on "entity not found"
const generateWithRetry = async (ai: GoogleGenAI, params: any) => {
  try {
    return await ai.models.generateContent(params);
  } catch (error: any) {
    const errMsg = error instanceof Error ? error.message : String(error);
    if (errMsg.includes("Requested entity was not found")) {
      if (window.aistudio && window.aistudio.openSelectKey) {
        await window.aistudio.openSelectKey();
        const newAi = new GoogleGenAI({ apiKey: process.env.API_KEY });
        return await newAi.models.generateContent(params);
      }
    }
    throw error;
  }
}

export const generateStickerSheet = async (
  imageFile: File,
  promptText: string
): Promise<string> => {
  let ai = await getAIClient();
  const base64Image = await fileToBase64(imageFile);
  const cleanBase64 = base64Image.split(',')[1];

  const generateParams = {
    model: MODEL_NAME,
    contents: {
      parts: [
        { text: promptText },
        {
          inlineData: {
            mimeType: imageFile.type,
            data: cleanBase64,
          },
        },
      ],
    },
    config: {
      imageConfig: {
          aspectRatio: "16:9",
          imageSize: "4K"
      },
    },
  };

  const response = await generateWithRetry(ai, generateParams);
  return extractImageFromResponse(response);
};

export const generateBanner = async (
  imageFile: File,
  fullPrompt: string
): Promise<string> => {
  let ai = await getAIClient();
  const base64Image = await fileToBase64(imageFile);
  const cleanBase64 = base64Image.split(',')[1];

  const generateParams = {
    model: MODEL_NAME,
    contents: {
      parts: [
        { text: fullPrompt },
        {
          inlineData: {
            mimeType: imageFile.type,
            data: cleanBase64,
          },
        },
      ],
    },
    config: {
      imageConfig: {
          aspectRatio: "16:9", // Closest to 750x400
          imageSize: "4K"
      },
    },
  };

  const response = await generateWithRetry(ai, generateParams);
  return extractImageFromResponse(response);
};

export const generateDonationGuide = async (
  imageFile: File,
  fullPrompt: string
): Promise<string> => {
  let ai = await getAIClient();
  const base64Image = await fileToBase64(imageFile);
  const cleanBase64 = base64Image.split(',')[1];

  const generateParams = {
    model: MODEL_NAME,
    contents: {
      parts: [
        { text: fullPrompt },
        {
          inlineData: {
            mimeType: imageFile.type,
            data: cleanBase64,
          },
        },
      ],
    },
    config: {
      imageConfig: {
          aspectRatio: "4:3", // Closest to 750x560
          imageSize: "4K"
      },
    },
  };

  const response = await generateWithRetry(ai, generateParams);
  return extractImageFromResponse(response);
};

export const generateDonationThankYou = async (
  imageFile: File,
  fullPrompt: string
): Promise<string> => {
  let ai = await getAIClient();
  const base64Image = await fileToBase64(imageFile);
  const cleanBase64 = base64Image.split(',')[1];

  const generateParams = {
    model: MODEL_NAME,
    contents: {
      parts: [
        { text: fullPrompt },
        {
          inlineData: {
            mimeType: imageFile.type,
            data: cleanBase64,
          },
        },
      ],
    },
    config: {
      imageConfig: {
          aspectRatio: "1:1", // 750x750 is 1:1
          imageSize: "4K"
      },
    },
  };

  const response = await generateWithRetry(ai, generateParams);
  return extractImageFromResponse(response);
};

export const generateStickerCover = async (
  imageFile: File,
  fullPrompt: string
): Promise<string> => {
  let ai = await getAIClient();
  const base64Image = await fileToBase64(imageFile);
  const cleanBase64 = base64Image.split(',')[1];

  const generateParams = {
    model: MODEL_NAME,
    contents: {
      parts: [
        { text: fullPrompt },
        {
          inlineData: {
            mimeType: imageFile.type,
            data: cleanBase64,
          },
        },
      ],
    },
    config: {
      imageConfig: {
          aspectRatio: "1:1", // Target 230x230
          imageSize: "4K" // Maximum resolution for best downsampling quality
      },
    },
  };

  const response = await generateWithRetry(ai, generateParams);
  return extractImageFromResponse(response);
};

export const generateStickerIcon = async (
  imageFile: File,
  fullPrompt: string
): Promise<string> => {
  let ai = await getAIClient();
  const base64Image = await fileToBase64(imageFile);
  const cleanBase64 = base64Image.split(',')[1];

  const generateParams = {
    model: MODEL_NAME,
    contents: {
      parts: [
        { text: fullPrompt },
        {
          inlineData: {
            mimeType: imageFile.type,
            data: cleanBase64,
          },
        },
      ],
    },
    config: {
      imageConfig: {
          aspectRatio: "1:1", // Target 50x50
          imageSize: "4K" // Maximum resolution for best downsampling quality
      },
    },
  };

  const response = await generateWithRetry(ai, generateParams);
  return extractImageFromResponse(response);
};

const extractImageFromResponse = (response: any): string => {
  if (response.candidates && response.candidates[0].content.parts) {
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData && part.inlineData.data) {
         return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
  }
  throw new Error("No image data found in response");
}

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};
