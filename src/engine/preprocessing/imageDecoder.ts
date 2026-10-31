import { ImageMetadata } from '../../types/engine';
import { TileCoordinate } from '../tiling/tileCalculator';

export async function decodeImageFile(file: File | Blob): Promise<{
  imageData: ImageData;
  metadata: ImageMetadata;
}> {
  let imgBitmap: ImageBitmap;

  // createImageBitmap with EXIF orientation correction
  try {
    imgBitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  } catch {
    // Fallback for older environments or unformatted blobs
    imgBitmap = await new Promise<ImageBitmap>((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        createImageBitmap(img).then(resolve).catch(reject);
      };
      img.onerror = (e) => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load image element: ' + String(e)));
      };
      img.src = url;
    });
  }

  const width = imgBitmap.width;
  const height = imgBitmap.height;

  if (width <= 0 || height <= 0) {
    throw new Error(`Invalid image dimensions: ${width}x${height}`);
  }

  // Draw to offscreen canvas to obtain raw RGBA ImageData
  let canvas: HTMLCanvasElement | OffscreenCanvas;
  let ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | null = null;

  if (typeof OffscreenCanvas !== 'undefined') {
    canvas = new OffscreenCanvas(width, height);
    ctx = canvas.getContext('2d', { willReadFrequently: true });
  } else {
    canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    ctx = (canvas as HTMLCanvasElement).getContext('2d', { willReadFrequently: true });
  }

  if (!ctx) {
    throw new Error('Could not create 2D canvas context for image decoding.');
  }

  ctx.drawImage(imgBitmap, 0, 0);
  const imageData = ctx.getImageData(0, 0, width, height);

  // Check for genuine alpha transparency
  let hasAlpha = false;
  const totalPixels = width * height;
  const step = Math.max(1, Math.floor(totalPixels / 5000)); // Sample check
  for (let i = 3; i < imageData.data.length; i += 4 * step) {
    if (imageData.data[i] < 250) {
      hasAlpha = true;
      break;
    }
  }

  const name = (file instanceof File) ? file.name : 'input-image';
  const size = file.size;
  const format = file.type || 'image/png';
  const megapixels = Number(((width * height) / 1000000).toFixed(2));
  const aspectRatio = Number((width / height).toFixed(3));

  const metadata: ImageMetadata = {
    name,
    originalSize: size,
    width,
    height,
    format,
    hasAlpha,
    aspectRatio,
    megapixels,
  };

  return { imageData, metadata };
}

/**
 * Extracts a tile from the source ImageData into a normalized NCHW Float32Array
 * Shape: [1, 3, tileHeight, tileWidth], values in [0.0, 1.0].
 */
export function extractTileNCHW(
  source: ImageData,
  tile: TileCoordinate
): Float32Array {
  const srcW = source.width;
  const srcH = source.height;
  const tileW = tile.srcWidth;
  const tileH = tile.srcHeight;

  const totalPixels = tileW * tileH;
  const nchwData = new Float32Array(3 * totalPixels);

  const rOffset = 0;
  const gOffset = totalPixels;
  const bOffset = totalPixels * 2;

  const srcData = source.data;

  for (let ty = 0; ty < tileH; ty++) {
    // Clamp to image bounds
    const sy = Math.min(srcH - 1, Math.max(0, tile.srcY + ty));
    const srcRowStart = sy * srcW * 4;
    const tileRowStart = ty * tileW;

    for (let tx = 0; tx < tileW; tx++) {
      const sx = Math.min(srcW - 1, Math.max(0, tile.srcX + tx));
      const srcIdx = srcRowStart + sx * 4;
      const tileIdx = tileRowStart + tx;

      nchwData[rOffset + tileIdx] = srcData[srcIdx] / 255.0;
      nchwData[gOffset + tileIdx] = srcData[srcIdx + 1] / 255.0;
      nchwData[bOffset + tileIdx] = srcData[srcIdx + 2] / 255.0;
    }
  }

  return nchwData;
}
