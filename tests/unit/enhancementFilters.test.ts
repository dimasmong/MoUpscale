import { describe, it, expect } from 'vitest';
import { 
  applySharpening, 
  applyDenoising, 
  applyJpegArtifactReduction, 
  applyColorVibrance,
  upscaleAlphaChannelBilinear 
} from '../../src/engine/postprocessing/enhancementFilters';

describe('Post-processing Enhancement Filters', () => {
  it('applies sharpening filter and enhances edge contrast without buffer overflow', () => {
    const width = 10;
    const height = 10;
    const rgba = new Uint8ClampedArray(width * height * 4).fill(128);

    // Create an edge in the center
    rgba[(4 * width + 4) * 4] = 200;
    rgba[(4 * width + 5) * 4] = 50;

    applySharpening(rgba, width, height, 50);

    // The center high pixel should be enhanced
    expect(rgba[(4 * width + 4) * 4]).toBeGreaterThan(200);
    // Values should stay within [0, 255]
    for (let i = 0; i < rgba.length; i++) {
      expect(rgba[i]).toBeGreaterThanOrEqual(0);
      expect(rgba[i]).toBeLessThanOrEqual(255);
    }
  });

  it('applies denoising and smooths subtle noise variations', () => {
    const width = 10;
    const height = 10;
    const rgba = new Uint8ClampedArray(width * height * 4).fill(120);

    // Add small noise
    rgba[(5 * width + 5) * 4] = 126;

    applyDenoising(rgba, width, height, 60);

    // Filtered value should be closer to background 120
    expect(rgba[(5 * width + 5) * 4]).toBeLessThan(126);
    expect(rgba[(5 * width + 5) * 4]).toBeGreaterThanOrEqual(120);
  });

  it('reduces JPEG ringing artifacts', () => {
    const width = 10;
    const height = 10;
    const rgba = new Uint8ClampedArray(width * height * 4).fill(100);
    rgba[(5 * width + 5) * 4] = 110;

    applyJpegArtifactReduction(rgba, width, height, 50);
    expect(rgba[(5 * width + 5) * 4]).toBeLessThanOrEqual(110);
  });

  it('boosts natural color vibrance without blowing out highlights', () => {
    const width = 4;
    const height = 4;
    const rgba = new Uint8ClampedArray(width * height * 4).fill(150);
    rgba[0] = 180; // slightly saturated pixel

    applyColorVibrance(rgba, width, height, 50);
    expect(rgba[0]).toBeGreaterThanOrEqual(180);
    expect(rgba[0]).toBeLessThanOrEqual(255);
  });

  it('preserves and upscales alpha channel via bilinear interpolation', () => {
    const srcW = 2;
    const srcH = 2;
    // Source: Top half opaque (255), bottom half transparent (0)
    const srcRgba = new Uint8ClampedArray([
      255, 255, 255, 255,   255, 255, 255, 255,
      255, 255, 255, 0,     255, 255, 255, 0,
    ]);

    const outW = 4;
    const outH = 4;
    const outRgba = new Uint8ClampedArray(outW * outH * 4).fill(255);

    upscaleAlphaChannelBilinear(srcRgba, srcW, srcH, outRgba, outW, outH);

    // Check top row has alpha 255
    expect(outRgba[3]).toBe(255);
    expect(outRgba[outW * 4 - 1]).toBe(255);

    // Check bottom row has alpha 0
    const lastPixelAlpha = outRgba[outW * outH * 4 - 1];
    expect(lastPixelAlpha).toBe(0);

    // Check middle row is smoothly interpolated between 0 and 255
    const midAlpha = outRgba[(1 * outW + 1) * 4 + 3];
    expect(midAlpha).toBeGreaterThan(0);
    expect(midAlpha).toBeLessThan(255);
  });
});
