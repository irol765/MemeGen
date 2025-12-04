
import { GoogleGenAI } from "@google/genai";
import { MODEL_NAME } from "../constants";
import { AppSettings } from "../types";

// Helper to determine the effective API key and client
const getClientConfig = async (settings?: AppSettings) => {
  // 1. User Settings
  if (settings?.apiKey) {
    return { 
      apiKey: settings.apiKey, 
      baseUrl: settings.baseUrl,
      useOpenAI: settings.useOpenAIFormat 
    };
  }

  // 2. AI Studio (Native) - Check if injected
  try {
    if (window.aistudio && window.aistudio.hasSelectedApiKey) {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (!hasKey) {
        // We don't force open here, let the app logic handle it, 
        // or return null and let fallback happen.
        // But if we are here, it means no settings key.
      } else {
         // If aistudio has key, it's injected into the environment or handled by SDK automatically 
         // if we initialize without key? No, SDK needs key. 
         // Usually aistudio injects it into process.env.API_KEY dynamically or we use a specific flow.
         // For this app, we prioritize the explicit keys.
      }
    }
  } catch (e) {
    // Ignore
  }

  // 3. Environment Variable
  const envKey = process.env.API_KEY;
  if (envKey && envKey !== '""') {
    return { apiKey: envKey, useOpenAI: false };
  }

  throw new Error("API_KEY_MISSING");
}

// OpenAI Format Handler
const generateWithOpenAI = async (
  apiKey: string,
  baseUrl: string,
  prompt: string,
  base64Image: string,
  mimeType: string,
  config: any
): Promise<string> => {
  // Clean URL: remove trailing slash
  let cleanBaseUrl = baseUrl.replace(/\/+$/, '');
  // If user didn't provide full path to v1, we assume they provided the host. 
  // But standard usage often implies providing the base up to /v1. 
  // Let's assume the user provides the base (e.g. https://api.openai.com or https://proxy.com/v1).
  // If it doesn't end in /v1, we might append it, or we assume the user knows what they are doing.
  // To be safe for "New API" style: usually https://api.example.com
  if (!cleanBaseUrl.includes('/v1')) {
      cleanBaseUrl = `${cleanBaseUrl}/v1`;
  }
  
  const url = `${cleanBaseUrl}/chat/completions`;

  const payload = {
    model: MODEL_NAME, // Some proxies map this, or we might need a generic name. For now send specific.
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: prompt },
          { 
            type: "image_url", 
            image_url: { 
              url: `data:${mimeType};base64,${base64Image}` 
            } 
          }
        ]
      }
    ],
    max_tokens: 4096,
    temperature: 0.7,
    stream: false
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenAI Proxy Error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) throw new Error("No content received from OpenAI proxy");

  // Try to find image data in the text response (Markdown or raw URL)
  // 1. Check for Markdown image: ![alt](url)
  const markdownMatch = content.match(/!\[.*?\]\((.*?)\)/);
  if (markdownMatch && markdownMatch[1]) {
    return markdownMatch[1];
  }

  // 2. Check if content itself is a URL
  if (content.startsWith('http') || content.startsWith('data:image')) {
    return content;
  }
  
  // 3. Check for base64 pattern directly in text
  const base64Match = content.match(/data:image\/[a-zA-Z]+;base64,[^\s"']+/);
  if (base64Match) {
    return base64Match[0];
  }

  // 4. Fallback: return raw content if it looks like a string, might be a URL
  if (typeof content === 'string' && content.length > 10) {
      return content;
  }
  
  throw new Error("Could not extract image from OpenAI proxy response.");
};

// Google GenAI Handler
const generateWithGoogle = async (
  apiKey: string,
  baseUrl: string | undefined,
  params: any
) => {
  const clientParams: any = { apiKey };
  // If baseUrl is provided for Google format, we try to use it if the SDK version allows or transport config.
  // The current @google/genai guidelines don't explicitly document baseUrl in constructor for standard use,
  // but we can try to pass it if the library supports `baseUrl` or `transport` in options.
  // For now, we assume standard behavior unless strictly needed. 
  // If the user sets a custom Base URL for Google format, we assume they want to point to a reverse proxy that mirrors Google API.
  if (baseUrl) {
    clientParams.baseUrl = baseUrl;
  }

  const ai = new GoogleGenAI(clientParams);

  try {
    return await ai.models.generateContent(params);
  } catch (error: any) {
    const errMsg = error instanceof Error ? error.message : String(error);
    // If we are using the environment key and it fails with "Requested entity was not found" (Billing/Project issue),
    // we might try to trigger the AI Studio selector if available.
    if (errMsg.includes("Requested entity was not found") && !baseUrl) {
      if (window.aistudio && window.aistudio.openSelectKey) {
        await window.aistudio.openSelectKey();
        // Retry with refreshed env key? 
        // The SDK automatically picks up the injected key if we re-instantiate or if the environment updates.
        // We'll try re-instantiating with the process.env.API_KEY again.
        const newAi = new GoogleGenAI({ apiKey: process.env.API_KEY });
        return await newAi.models.generateContent(params);
      }
    }
    throw error;
  }
};

const extractImageFromResponse = (response: any): string => {
  if (response.candidates && response.candidates[0].content.parts) {
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData && part.inlineData.data) {
         return `data:image/png;base64,${part.inlineData.data}`;
      }
      // Handle cases where some proxies might return text url in parts
      if (part.text && (part.text.startsWith('http') || part.text.startsWith('data:image'))) {
         return part.text.trim();
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

// --- Generic Generation Wrapper with Fallback ---

const generateGeneric = async (
  imageFile: File,
  promptText: string,
  aspectRatio: string,
  imageSize: string,
  settings?: AppSettings
): Promise<string> => {
  const base64ImageWithHeader = await fileToBase64(imageFile);
  const mimeType = imageFile.type;
  const cleanBase64 = base64ImageWithHeader.split(',')[1];

  const doGenerate = async (apiKey: string, baseUrl: string | undefined, useOpenAI: boolean) => {
      if (useOpenAI) {
        return generateWithOpenAI(
          apiKey, 
          baseUrl || 'https://api.openai.com', 
          promptText, 
          cleanBase64, 
          mimeType,
          { aspectRatio, imageSize }
        );
      } else {
        const generateParams = {
          model: MODEL_NAME,
          contents: {
            parts: [
              { text: promptText },
              {
                inlineData: {
                  mimeType: mimeType,
                  data: cleanBase64,
                },
              },
            ],
          },
          config: {
            imageConfig: {
                aspectRatio: aspectRatio,
                imageSize: imageSize
            },
          },
        };
        const response = await generateWithGoogle(apiKey, baseUrl, generateParams);
        return extractImageFromResponse(response);
      }
  };

  // Logic: 
  // 1. If settings provided, try them.
  // 2. If settings fail (or not provided), try Env Key (Native).

  let lastError;

  // Attempt 1: User Settings (Proxy/Custom)
  if (settings?.apiKey) {
    try {
      return await doGenerate(settings.apiKey, settings.baseUrl, settings.useOpenAIFormat);
    } catch (e) {
      console.warn("Proxy/Settings generation failed, attempting fallback to native...", e);
      lastError = e;
      // If the user specifically set up a proxy, and it failed, we SHOULD fall back to native 
      // ONLY IF the native key is available and likely valid (i.e. different from the one that just failed).
      // Check if we have a native key to fall back to.
      const envKey = process.env.API_KEY;
      if (!envKey || envKey === '""' || envKey === settings.apiKey) {
         throw e; // No fallback available or same key
      }
    }
  }

  // Attempt 2: Native / Env Key
  try {
    const envKey = process.env.API_KEY;
    if (envKey && envKey !== '""') {
       return await doGenerate(envKey, undefined, false);
    }
  } catch (e) {
    lastError = e;
  }

  throw lastError || new Error("Failed to generate image. Please check your API Settings.");
};

// --- Exported Functions ---

export const generateStickerSheet = async (
  imageFile: File,
  promptText: string,
  settings?: AppSettings
): Promise<string> => {
  return generateGeneric(imageFile, promptText, "16:9", "4K", settings);
};

export const generateBanner = async (
  imageFile: File,
  fullPrompt: string,
  settings?: AppSettings
): Promise<string> => {
  return generateGeneric(imageFile, fullPrompt, "16:9", "4K", settings);
};

export const generateDonationGuide = async (
  imageFile: File,
  fullPrompt: string,
  settings?: AppSettings
): Promise<string> => {
  return generateGeneric(imageFile, fullPrompt, "4:3", "4K", settings);
};

export const generateDonationThankYou = async (
  imageFile: File,
  fullPrompt: string,
  settings?: AppSettings
): Promise<string> => {
  return generateGeneric(imageFile, fullPrompt, "1:1", "4K", settings);
};

export const generateStickerCover = async (
  imageFile: File,
  fullPrompt: string,
  settings?: AppSettings
): Promise<string> => {
  return generateGeneric(imageFile, fullPrompt, "1:1", "4K", settings);
};

export const generateStickerIcon = async (
  imageFile: File,
  fullPrompt: string,
  settings?: AppSettings
): Promise<string> => {
  return generateGeneric(imageFile, fullPrompt, "1:1", "4K", settings);
};
