import { OutputFormat } from '../../types/models';

export async function encodeImageDataToBlob(
  rgba: Uint8ClampedArray,
  width: number,
  height: number,
  format: OutputFormat = 'image/png',
  quality: number = 0.95
): Promise<{ blob: Blob; dataUrl: string }> {
  let canvas: HTMLCanvasElement | OffscreenCanvas;
  let ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | null = null;

  if (typeof OffscreenCanvas !== 'undefined') {
    canvas = new OffscreenCanvas(width, height);
    ctx = canvas.getContext('2d');
  } else {
    canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    ctx = (canvas as HTMLCanvasElement).getContext('2d');
  }

  if (!ctx) {
    throw new Error('Failed to create canvas context for image encoding.');
  }

  const imgData = ctx.createImageData(width, height);
  imgData.data.set(rgba);
  ctx.putImageData(imgData, 0, 0);

  let blob: Blob;

  if ('convertToBlob' in canvas) {
    blob = await (canvas as OffscreenCanvas).convertToBlob({
      type: format,
      quality: format === 'image/png' ? undefined : quality,
    });
  } else {
    blob = await new Promise<Blob>((resolve, reject) => {
      (canvas as HTMLCanvasElement).toBlob(
        (b) => {
          if (b) resolve(b);
          else reject(new Error('Failed to create image blob from canvas.'));
        },
        format,
        format === 'image/png' ? undefined : quality
      );
    });
  }

  const dataUrl = URL.createObjectURL(blob);
  return { blob, dataUrl };
}

/**
 * Resamples an image buffer to custom target dimensions using high quality bicubic interpolation
 */
export async function resampleCanvas(
  rgba: Uint8ClampedArray,
  srcWidth: number,
  srcHeight: number,
  targetWidth: number,
  targetHeight: number
): Promise<Uint8ClampedArray> {
  let srcCanvas: HTMLCanvasElement | OffscreenCanvas;
  let targetCanvas: HTMLCanvasElement | OffscreenCanvas;

  if (typeof OffscreenCanvas !== 'undefined') {
    srcCanvas = new OffscreenCanvas(srcWidth, srcHeight);
    targetCanvas = new OffscreenCanvas(targetWidth, targetHeight);
  } else {
    srcCanvas = document.createElement('canvas');
    srcCanvas.width = srcWidth;
    srcCanvas.height = srcHeight;
    targetCanvas = document.createElement('canvas');
    targetCanvas.width = targetWidth;
    targetCanvas.height = targetHeight;
  }

  const srcCtx = srcCanvas.getContext('2d') as CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
  const targetCtx = targetCanvas.getContext('2d') as CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

  const srcImgData = srcCtx.createImageData(srcWidth, srcHeight);
  srcImgData.data.set(rgba);
  srcCtx.putImageData(srcImgData, 0, 0);

  targetCtx.imageSmoothingEnabled = true;
  targetCtx.imageSmoothingQuality = 'high';

  // Draw scaled
  targetCtx.drawImage(srcCanvas as CanvasImageSource, 0, 0, targetWidth, targetHeight);
  const outImgData = targetCtx.getImageData(0, 0, targetWidth, targetHeight);
  return new Uint8ClampedArray(outImgData.data);
}
