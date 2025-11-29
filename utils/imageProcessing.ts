
import JSZip from 'jszip';
import saveAs from 'file-saver';
// @ts-ignore
import { GIFEncoder, quantize, applyPalette } from 'gifenc';
import { GridConfig, StickerSlice } from '../types';

/**
 * Removes background color from an image source using auto-detection.
 * Samples the top-left pixel as the key color.
 * Returns the processed image as a Data URL.
 */
export const removeBackground = (
  imageSrc: string,
  tolerance: number
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }

      ctx.drawImage(img, 0, 0);
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Auto-detect background color from top-left pixel
      const bgR = data[0];
      const bgG = data[1];
      const bgB = data[2];

      // Tolerance conversion: Map 0-50 input to a distance threshold.
      const threshold = tolerance * 5.0;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Euclidean distance
        const dist = Math.sqrt(
          (r - bgR) ** 2 +
          (g - bgG) ** 2 +
          (b - bgB) ** 2
        );

        if (dist < threshold) {
          data[i] = 0;     // Clear Red
          data[i + 1] = 0; // Clear Green
          data[i + 2] = 0; // Clear Blue
          data[i + 3] = 0; // Alpha 0
        }
      }

      ctx.putImageData(imageData, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = reject;
    img.src = imageSrc;
  });
};

/**
 * Slices an image into a grid and returns an array of blobs.
 */
export const sliceImageToBlobs = async (
  imageSrc: string,
  config: GridConfig
): Promise<StickerSlice[]> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = async () => {
      const { rows, cols, padding, offsetX, offsetY } = config;
      const cellWidth = img.width / cols;
      const cellHeight = img.height / rows;
      
      const promises: Promise<StickerSlice | null>[] = [];

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const promise = new Promise<StickerSlice | null>((resSlice) => {
            const canvas = document.createElement('canvas');
            
            const padX = (cellWidth * padding) / 100;
            const padY = (cellHeight * padding) / 100;
            const shiftX = (cellWidth * offsetX) / 100;
            const shiftY = (cellHeight * offsetY) / 100;

            const contentWidth = Math.floor(cellWidth - (padX * 2));
            const contentHeight = Math.floor(cellHeight - (padY * 2));

            if (contentWidth <= 0 || contentHeight <= 0) {
                resSlice(null);
                return;
            }

            canvas.width = contentWidth;
            canvas.height = contentHeight;
            const ctx = canvas.getContext('2d');
            
            if (ctx) {
                const srcX = (c * cellWidth) + padX + shiftX;
                const srcY = (r * cellHeight) + padY + shiftY;

                ctx.drawImage(
                    img,
                    srcX,
                    srcY,
                    contentWidth,
                    contentHeight,
                    0,
                    0,
                    contentWidth,
                    contentHeight
                );

                canvas.toBlob((blob) => {
                    if (blob) {
                        resSlice({
                            id: `sticker_${r}_${c}`,
                            blob: blob,
                            previewUrl: URL.createObjectURL(blob)
                        });
                    } else {
                        resSlice(null);
                    }
                }, 'image/png');
            } else {
                resSlice(null);
            }
          });
          promises.push(promise);
        }
      }

      const results = await Promise.all(promises);
      const slices = results.filter((s): s is StickerSlice => s !== null);
      
      resolve(slices);
    };
    img.onerror = reject;
    img.src = imageSrc;
  });
};

export const createAndDownloadZip = async (slices: StickerSlice[]) => {
  const zip = new JSZip();
  const folder = zip.folder("stickers");
  
  if (folder) {
    slices.forEach((slice, index) => {
        folder.file(`sticker_${index + 1}.png`, slice.blob);
    });
  }

  const content = await zip.generateAsync({ type: "blob" });
  saveAs(content, "meme_stickers.zip");
};

/**
 * Helper to crop/resize image to target dimensions
 */
const cropImageToSize = (imageSrc: string, targetWidth: number, targetHeight: number): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = targetWidth;
            canvas.height = targetHeight;
            const ctx = canvas.getContext('2d');
            
            if (!ctx) {
                reject(new Error("No context"));
                return;
            }

            const scale = Math.max(targetWidth / img.width, targetHeight / img.height);
            const w = img.width * scale;
            const h = img.height * scale;
            const x = (targetWidth - w) / 2;
            const y = (targetHeight - h) / 2;

            ctx.drawImage(img, x, y, w, h);
            resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = reject;
        img.src = imageSrc;
    });
};

export const cropBannerToSize = (imageSrc: string): Promise<string> => {
    return cropImageToSize(imageSrc, 750, 400);
};

export const cropGuideToSize = (imageSrc: string): Promise<string> => {
    return cropImageToSize(imageSrc, 750, 560);
};

export const cropThankYouToSize = (imageSrc: string): Promise<string> => {
    return cropImageToSize(imageSrc, 750, 750);
};

/**
 * Generates an animated GIF from sticker slices using gifenc.
 * Uses a robust RGBA-only strategy to ensure buffer alignment for Uint32Array compatibility.
 */
export const generateGif = async (
  slices: StickerSlice[], 
  fps: number
): Promise<string> => {
  if (slices.length === 0) return '';
  
  const delay = Math.round(1000 / fps);
  
  // 1. Load all images
  const images = await Promise.all(slices.map(s => loadImage(s.previewUrl)));
  if (images.length === 0) return '';

  const width = images[0].width;
  const height = images[0].height;

  // 2. Pre-process frames (Center content & Get RGBA Data)
  const framesRGBA: Uint8Array[] = [];

  const getContentBounds = (data: Uint8ClampedArray, w: number, h: number) => {
    let minX = w, minY = h, maxX = 0, maxY = 0;
    let found = false;
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            const alpha = data[(y * w + x) * 4 + 3];
            if (alpha > 20) { 
                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;
                found = true;
            }
        }
    }
    return found ? { minX, minY, maxX, maxY, w: maxX - minX + 1, h: maxY - minY + 1 } : null;
  };

  for (const img of images) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    
    if (!ctx) continue;
    
    // Draw original
    ctx.drawImage(img, 0, 0);
    const rawData = ctx.getImageData(0, 0, width, height);
    const bounds = getContentBounds(rawData.data, width, height);

    // Clear and Redraw Centered
    ctx.clearRect(0, 0, width, height);
    if (bounds) {
        const centerX = width / 2;
        const centerY = height / 2;
        const boundCenterX = bounds.minX + bounds.w / 2;
        const boundCenterY = bounds.minY + bounds.h / 2;
        ctx.drawImage(img, Math.round(centerX - boundCenterX), Math.round(centerY - boundCenterY));
    } else {
        ctx.drawImage(img, 0, 0);
    }
    
    const imageData = ctx.getImageData(0, 0, width, height);
    // Copy to Uint8Array to ensure standard array behavior and memory alignment
    framesRGBA.push(new Uint8Array(imageData.data));
  }

  // 3. Generate Global Palette from OPAQUE pixels only
  const opaqueSamples: number[] = [];
  const MAX_SAMPLES = 50000; 
  let globalPixelIndex = 0;

  for (const data of framesRGBA) {
      // Step by 4 (pixel by pixel)
      for (let i = 0; i < data.length; i += 4) {
          globalPixelIndex++;
          // Stride: Sample roughly every 100th pixel to get good distribution without OOM
          if (globalPixelIndex % 100 === 0) { 
             if (data[i + 3] >= 128) {
                // Only if opaque. Push RGBA (4 bytes)
                opaqueSamples.push(data[i], data[i+1], data[i+2], 255);
             }
          }
          if (opaqueSamples.length >= MAX_SAMPLES * 4) break;
      }
      if (opaqueSamples.length >= MAX_SAMPLES * 4) break;
  }

  // Quantize (RGBA Mode)
  // Limit to 255 colors to strictly reserve 1 slot for transparency (appended at end)
  let palette: number[][];
  if (opaqueSamples.length > 0) {
      const pixelData = new Uint8Array(opaqueSamples);
      // Ensure we leave room for 1 transparent color, so max 255 colors from image
      palette = quantize(pixelData, 255, { format: 'rgba' });
  } else {
      palette = [[0,0,0,255]]; // Fallback
  }

  // 4. Construct Final GIF Palette
  // Extract RGB from the quantized palette
  const paletteRGB = palette.map(p => p.slice(0, 3));
  
  // Strategy: Append transparency at the end.
  // This avoids index 0 which might be falsy-checked in some libs.
  const transparentIndex = paletteRGB.length;
  
  // Append a dummy color (black) at the end for the transparent index.
  const finalPalette = [...paletteRGB, [0, 0, 0]]; 

  // 5. Encode Frames
  const gif = new GIFEncoder();

  for (const rgba of framesRGBA) {
      const pixelCount = width * height;
      
      // Map pixels using RGBA format.
      // This returns indices into `palette` (0 to palette.length-1)
      const mappedIndices = applyPalette(rgba, palette, 'rgba');
      
      // Create final index buffer
      const finalIndices = new Uint8Array(pixelCount);

      for (let i = 0; i < pixelCount; i++) {
          const alpha = rgba[i * 4 + 3];
          if (alpha < 128) {
              // Force transparent pixels to the transparent index
              finalIndices[i] = transparentIndex; 
          } else {
              // Use mapped index directly
              finalIndices[i] = mappedIndices[i];
          }
      }

      gif.writeFrame(finalIndices, width, height, { 
        palette: finalPalette, 
        delay: delay,
        transparent: transparentIndex, 
        dispose: 2 // Restore to background (transparent)
      });
  }

  gif.finish();
  
  const buffer = gif.bytes(); 
  const blob = new Blob([buffer], { type: 'image/gif' });
  return URL.createObjectURL(blob);
};

const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};
