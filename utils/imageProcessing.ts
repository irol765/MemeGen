
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

            // Use better interpolation for downsizing
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';

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

export const cropCoverToSize = (imageSrc: string): Promise<string> => {
    return cropImageToSize(imageSrc, 230, 230);
};

export const cropIconToSize = (imageSrc: string): Promise<string> => {
    return cropImageToSize(imageSrc, 50, 50);
};

/**
 * Generates an animated GIF from sticker slices using gif.js
 * Centers content and handles transparency using a key color.
 */
export const generateGif = async (
  slices: StickerSlice[], 
  fps: number
): Promise<string> => {
  if (slices.length === 0) return '';
  
  // 1. Load all images
  const images = await Promise.all(slices.map(s => loadImage(s.previewUrl)));
  if (images.length === 0) return '';

  const width = images[0].width;
  const height = images[0].height;

  // 2. Prepare gif.js Worker (Blob method to avoid cross-origin issues)
  // Fetch the worker script text from CDN
  const workerBlob = await fetch('https://cdnjs.cloudflare.com/ajax/libs/gif.js/0.2.0/gif.worker.js')
      .then(r => r.blob());
  const workerUrl = URL.createObjectURL(workerBlob);

  // 3. Setup GIF Encoder
  // Use Magenta as the transparent key color.
  const transparentColor = 0xFF00FF; 
  // R=255, G=0, B=255

  return new Promise((resolve, reject) => {
    // @ts-ignore
    if (!window.GIF) {
        reject(new Error("gif.js library not loaded"));
        return;
    }

    // @ts-ignore
    const gif = new window.GIF({
      workers: 2,
      quality: 10,
      width,
      height,
      workerScript: workerUrl,
      transparent: transparentColor
    });

    // Helper to find content bounds for centering
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

    // 4. Process Frames
    images.forEach(img => {
       const canvas = document.createElement('canvas');
       canvas.width = width;
       canvas.height = height;
       const ctx = canvas.getContext('2d', { willReadFrequently: true });
       
       if (!ctx) return;
       
       // Step A: Draw image to check bounds (invisible step)
       ctx.clearRect(0, 0, width, height);
       ctx.drawImage(img, 0, 0);
       const rawData = ctx.getImageData(0, 0, width, height);
       const bounds = getContentBounds(rawData.data, width, height);

       // Step B: Clear and Draw Centered Image
       ctx.clearRect(0, 0, width, height);

       let destX = 0;
       let destY = 0;

       if (bounds) {
           const centerX = width / 2;
           const centerY = height / 2;
           const boundCenterX = bounds.minX + bounds.w / 2;
           const boundCenterY = bounds.minY + bounds.h / 2;
           destX = Math.round(centerX - boundCenterX);
           destY = Math.round(centerY - boundCenterY);
       }
       ctx.drawImage(img, destX, destY);

       // Step C: Binary Alpha Thresholding
       // This prevents "dirty" pixels (blended with background) from appearing as halos.
       // We force pixels to be either fully Opaque (Image Color) or fully Transparent (Key Color).
       const frameData = ctx.getImageData(0, 0, width, height);
       const data = frameData.data;
       const threshold = 128; // Alpha threshold (0-255)

       for (let i = 0; i < data.length; i += 4) {
           const r = data[i];
           const g = data[i+1];
           const b = data[i+2];
           const a = data[i+3];

           if (a < threshold) {
               // Make completely transparent by setting to Key Color and Full Opacity
               // gif.js will then treat this exact color as transparent.
               data[i] = 255;   // R
               data[i+1] = 0;   // G
               data[i+2] = 255; // B
               data[i+3] = 255; // Alpha must be 255 for the color to be "seen" by the encoder as the key
           } else {
               // Keep image pixel, but force full opacity to avoid blending artifacts during quantization
               // Also check if the pixel accidentally matches the key color, and shift it slightly if so.
               if (r === 255 && g === 0 && b === 255) {
                   data[i] = 254; 
               }
               data[i+3] = 255;
           }
       }
       
       ctx.putImageData(frameData, 0, 0);
       
       gif.addFrame(canvas, {delay: 1000 / fps, copy: true});
    });

    gif.on('finished', (blob: Blob) => {
       const url = URL.createObjectURL(blob);
       // Clean up worker URL to prevent memory leaks
       URL.revokeObjectURL(workerUrl);
       resolve(url);
    });

    gif.on('abort', () => {
        URL.revokeObjectURL(workerUrl);
        reject(new Error("GIF generation aborted"));
    });

    try {
        gif.render();
    } catch (e) {
        URL.revokeObjectURL(workerUrl);
        reject(e);
    }
  });
};

const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};