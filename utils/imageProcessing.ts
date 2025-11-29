
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
  const images = await Promise.all(slices.map(s => loadImage(s.previewUrl)));
  if (images.length === 0) return '';
  const width = images[0].width;
  const height = images[0].height;
  // 1. 预处理帧数据 - 保持原始透明度
  const framesRGBA: Uint8Array[] = [];
  for (const img of images) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    
    if (!ctx) continue;
    
    // 重要：清除canvas为完全透明
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0);
    
    const imageData = ctx.getImageData(0, 0, width, height);
    framesRGBA.push(new Uint8Array(imageData.data));
  }
  // 2. 改进的调色板生成 - 包含透明信息
  const colorSamples: number[] = [];
  const MAX_SAMPLES = 30000;
  let sampleCount = 0;
  for (const data of framesRGBA) {
    for (let i = 0; i < data.length; i += 4) {
      // 降低采样频率，但包含所有像素类型
      if (sampleCount++ % 15 === 0) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];
        
        // 只采样不透明和半透明像素，完全透明像素不加入调色板
        if (a > 10) {
          colorSamples.push(r, g, b);
        }
      }
      if (colorSamples.length >= MAX_SAMPLES * 3) break;
    }
    if (colorSamples.length >= MAX_SAMPLES * 3) break;
  }
  // 3. 生成调色板 - 预留透明槽位
  let palette: number[][];
  if (colorSamples.length > 0) {
    const pixelData = new Uint8Array(colorSamples);
    // 生成少于256色的调色板，为透明索引留位置
    palette = quantize(pixelData, 250, { format: 'rgb' });
  } else {
    palette = [[0, 0, 0]];
  }
  // 4. 设置透明索引 - 使用索引0作为透明索引
  const transparentIndex = 0;
  
  // 构建最终调色板：索引0为透明色，后面是图像颜色
  const finalPalette = [[0, 0, 0], ...palette];
  // 5. 编码帧
  const gif = new GIFEncoder();
  for (const rgba of framesRGBA) {
    const pixelCount = width * height;
    
    // 使用RGB模式应用调色板
    const rgbData = new Uint8Array(pixelCount * 3);
    for (let i = 0, j = 0; i < rgba.length; i += 4, j += 3) {
      rgbData[j] = rgba[i];     // R
      rgbData[j + 1] = rgba[i + 1]; // G
      rgbData[j + 2] = rgba[i + 2]; // B
    }
    
    const mappedIndices = applyPalette(rgbData, palette, 'rgb');
    const finalIndices = new Uint8Array(pixelCount);
    for (let i = 0; i < pixelCount; i++) {
      const alpha = rgba[i * 4 + 3];
      
      if (alpha < 128) {
        // 透明像素 -> 透明索引0
        finalIndices[i] = transparentIndex;
      } else {
        // 不透明像素 -> 调色板索引 + 1（因为索引0是透明色）
        finalIndices[i] = mappedIndices[i] + 1;
        
        // 安全检查：确保不超出调色板范围
        if (finalIndices[i] >= finalPalette.length) {
          finalIndices[i] = finalPalette.length - 1;
        }
      }
    }
    gif.writeFrame(finalIndices, width, height, { 
      palette: finalPalette, 
      delay: delay,
      transparent: transparentIndex,
      dispose: 2 // 恢复到背景（透明）
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
