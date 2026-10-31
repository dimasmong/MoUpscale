import { AdvancedEnhancementOptions } from '../../types/engine';

/**
 * Applies unsharp masking to enhance micro-details and sharpen edges.
 */
export function applySharpening(
  rgba: Uint8ClampedArray,
  width: number,
  height: number,
  strength: number // 0 to 100
): void {
  if (strength <= 0) return;
  const factor = (strength / 100) * 0.75;
  const copy = new Uint8ClampedArray(rgba);

  for (let y = 1; y < height - 1; y++) {
    const rowOffset = y * width * 4;
    const prevRowOffset = (y - 1) * width * 4;
    const nextRowOffset = (y + 1) * width * 4;

    for (let x = 1; x < width - 1; x++) {
      const idx = rowOffset + x * 4;

      for (let c = 0; c < 3; c++) {
        const center = copy[idx + c];
        // 4-neighborhood Laplacian
        const up = copy[prevRowOffset + x * 4 + c];
        const down = copy[nextRowOffset + x * 4 + c];
        const left = copy[rowOffset + (x - 1) * 4 + c];
        const right = copy[rowOffset + (x + 1) * 4 + c];

        const laplacian = 4 * center - (up + down + left + right);
        const sharpened = center + factor * laplacian;
        rgba[idx + c] = Math.min(255, Math.max(0, Math.round(sharpened)));
      }
    }
  }
}

/**
 * Selective edge-preserving bilateral filter for noise suppression.
 */
export function applyDenoising(
  rgba: Uint8ClampedArray,
  width: number,
  height: number,
  strength: number // 0 to 100
): void {
  if (strength <= 0) return;
  const intensityFactor = strength / 100;
  const colorThreshold = 15 + intensityFactor * 30; // tonal range threshold
  const copy = new Uint8ClampedArray(rgba);

  for (let y = 1; y < height - 1; y++) {
    const rowOffset = y * width * 4;
    for (let x = 1; x < width - 1; x++) {
      const idx = rowOffset + x * 4;

      for (let c = 0; c < 3; c++) {
        const centerVal = copy[idx + c];
        let sum = centerVal;
        let count = 1;

        // Sample 3x3 window with photometric distance check
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue;
            const nIdx = (y + dy) * width * 4 + (x + dx) * 4 + c;
            const nVal = copy[nIdx];
            if (Math.abs(nVal - centerVal) < colorThreshold) {
              sum += nVal;
              count++;
            }
          }
        }

        const filtered = sum / count;
        rgba[idx + c] = Math.round(centerVal * (1 - intensityFactor) + filtered * intensityFactor);
      }
    }
  }
}

/**
 * JPEG artifact reduction: deblocking smoothing filter.
 */
export function applyJpegArtifactReduction(
  rgba: Uint8ClampedArray,
  width: number,
  height: number,
  strength: number
): void {
  if (strength <= 0) return;
  const factor = (strength / 100) * 0.4;
  const copy = new Uint8ClampedArray(rgba);

  // Soft 3-tap horizontal and vertical cross-blur
  for (let y = 1; y < height - 1; y++) {
    const rowOffset = y * width * 4;
    for (let x = 1; x < width - 1; x++) {
      const idx = rowOffset + x * 4;

      for (let c = 0; c < 3; c++) {
        const center = copy[idx + c];
        const hAvg = (copy[rowOffset + (x - 1) * 4 + c] + copy[rowOffset + (x + 1) * 4 + c]) * 0.5;
        const vAvg = (copy[(y - 1) * width * 4 + x * 4 + c] + copy[(y + 1) * width * 4 + x * 4 + c]) * 0.5;
        const smooth = (hAvg + vAvg) * 0.5;

        // Only soften slight high-frequency ringing
        if (Math.abs(center - smooth) < 25) {
          rgba[idx + c] = Math.round(center * (1 - factor) + smooth * factor);
        }
      }
    }
  }
}

/**
 * Color preservation: boosts natural vibrance and ensures chromatic fidelity.
 */
export function applyColorVibrance(
  rgba: Uint8ClampedArray,
  width: number,
  height: number,
  strength: number
): void {
  if (strength <= 0) return;
  const factor = (strength / 100) * 0.2; // subtle natural vibrance boost
  const total = width * height * 4;

  for (let i = 0; i < total; i += 4) {
    const r = rgba[i];
    const g = rgba[i + 1];
    const b = rgba[i + 2];

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const sat = max === 0 ? 0 : (max - min) / max;

    // Vibrance selectively boosts lower-saturated pixels
    if (sat < 0.7) {
      const gray = (r * 0.299 + g * 0.587 + b * 0.114);
      rgba[i] = Math.min(255, Math.max(0, Math.round(r + (r - gray) * factor)));
      rgba[i + 1] = Math.min(255, Math.max(0, Math.round(g + (g - gray) * factor)));
      rgba[i + 2] = Math.min(255, Math.max(0, Math.round(b + (b - gray) * factor)));
    }
  }
}

/**
 * Upscales the original alpha channel using bilinear interpolation
 * and injects it into the target upscaled RGBA array.
 */
export function upscaleAlphaChannelBilinear(
  srcRgba: Uint8ClampedArray,
  srcW: number,
  srcH: number,
  outRgba: Uint8ClampedArray,
  outW: number,
  outH: number
): void {
  const xRatio = (srcW - 1) / Math.max(1, outW - 1);
  const yRatio = (srcH - 1) / Math.max(1, outH - 1);

  for (let oy = 0; oy < outH; oy++) {
    const sy = oy * yRatio;
    const y0 = Math.floor(sy);
    const y1 = Math.min(srcH - 1, y0 + 1);
    const yDiff = sy - y0;

    for (let ox = 0; ox < outW; ox++) {
      const sx = ox * xRatio;
      const x0 = Math.floor(sx);
      const x1 = Math.min(srcW - 1, x0 + 1);
      const xDiff = sx - x0;

      const a00 = srcRgba[(y0 * srcW + x0) * 4 + 3];
      const a10 = srcRgba[(y0 * srcW + x1) * 4 + 3];
      const a01 = srcRgba[(y1 * srcW + x0) * 4 + 3];
      const a11 = srcRgba[(y1 * srcW + x1) * 4 + 3];

      const top = a00 * (1 - xDiff) + a10 * xDiff;
      const bottom = a01 * (1 - xDiff) + a11 * xDiff;
      const alpha = top * (1 - yDiff) + bottom * yDiff;

      const outIdx = (oy * outW + ox) * 4 + 3;
      outRgba[outIdx] = Math.min(255, Math.max(0, Math.round(alpha)));
    }
  }
}

/**
 * Main dispatcher to apply all active fine-tuning enhancements.
 */
export function applyAllEnhancements(
  rgba: Uint8ClampedArray,
  width: number,
  height: number,
  options: AdvancedEnhancementOptions
): void {
  if (options.denoise > 0) {
    applyDenoising(rgba, width, height, options.denoise);
  }
  if (options.jpegArtifacts > 0) {
    applyJpegArtifactReduction(rgba, width, height, options.jpegArtifacts);
  }
  if (options.sharpen > 0 || options.detailEnhance > 0) {
    const totalSharpen = Math.min(100, options.sharpen + options.detailEnhance * 0.5);
    applySharpening(rgba, width, height, totalSharpen);
  }
  if (options.colorPreserve > 0) {
    applyColorVibrance(rgba, width, height, options.colorPreserve);
  }
}
