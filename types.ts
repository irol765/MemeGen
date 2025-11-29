

export enum AppStep {
  UPLOAD = 'UPLOAD',
  PROMPT = 'PROMPT',
  GENERATING = 'GENERATING',
  EDITING = 'EDITING',
  EXPORT = 'EXPORT'
}

export enum AppMode {
  STICKERS = 'STICKERS',
  GIF = 'GIF'
}

export type Language = 'en' | 'zh';

export interface GridConfig {
  rows: number;
  cols: number;
  padding: number; // Percentage
  tolerance: number; // For background removal (0-100)
  offsetX: number; // Percentage of cell width (-50 to 50)
  offsetY: number; // Percentage of cell height (-50 to 50)
}

export interface GeneratedImage {
  originalBase64: string; // The raw output from Gemini
  processedBase64: string; // After background removal
}

export interface StickerSlice {
  id: string;
  blob: Blob;
  previewUrl: string;
}