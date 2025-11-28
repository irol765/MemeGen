

import JSZip from 'jszip';
import saveAs from 'file-saver';
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
      // Euclidean distance max is ~441. 
      // We want a working range roughly 0-150 for the slider.
      const threshold = tolerance * 3.5;

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
      
      const slices: StickerSlice[] = [];
      const promises: Promise<void>[] = [];

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const promise = new Promise<void>((resSlice) => {
            const canvas = document.createElement('canvas');
            
            // Padding calculations (applied to each side)
            const padX = (cellWidth * padding) / 100;
            const padY = (cellHeight * padding) / 100;
            
            // Offset calculations (shifts the capture box)
            const shiftX = (cellWidth * offsetX) / 100;
            const shiftY = (cellHeight * offsetY) / 100;

            const contentWidth = cellWidth - (padX * 2);
            const contentHeight = cellHeight - (padY * 2);

            // Ensure we don't have negative dimensions
            if (contentWidth <= 0 || contentHeight <= 0) {
                resSlice();
                return;
            }

            canvas.width = contentWidth;
            canvas.height = contentHeight;
            const ctx = canvas.getContext('2d');
            
            if (ctx) {
                // Source x, y (top-left of the crop box)
                // Base cell pos + Padding + Offset
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
                        slices.push({
                            id: `sticker_${r}_${c}`,
                            blob: blob,
                            previewUrl: URL.createObjectURL(blob)
                        });
                    }
                    resSlice();
                }, 'image/png');
            } else {
                resSlice();
            }
          });
          promises.push(promise);
        }
      }

      await Promise.all(promises);
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
 * Crops/Resizes an image to exactly 750x400 pixels
 */
export const cropBannerToSize = (imageSrc: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const TARGET_WIDTH = 750;
            const TARGET_HEIGHT = 400;
            
            canvas.width = TARGET_WIDTH;
            canvas.height = TARGET_HEIGHT;
            const ctx = canvas.getContext('2d');
            
            if (!ctx) {
                reject(new Error("No context"));
                return;
            }

            // Calculate scaling to cover the area (object-fit: cover)
            const scale = Math.max(TARGET_WIDTH / img.width, TARGET_HEIGHT / img.height);
            const w = img.width * scale;
            const h = img.height * scale;
            const x = (TARGET_WIDTH - w) / 2;
            const y = (TARGET_HEIGHT - h) / 2;

            ctx.drawImage(img, x, y, w, h);
            resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = reject;
        img.src = imageSrc;
    });
};