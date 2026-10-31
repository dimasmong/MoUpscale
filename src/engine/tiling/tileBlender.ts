import { TileCoordinate } from './tileCalculator';

export class TileBlender {
  private outputWidth: number;
  private outputHeight: number;
  private scale: number;
  
  // Float32 accumulators for RGB channels and weights
  private rAccum: Float32Array;
  private gAccum: Float32Array;
  private bAccum: Float32Array;
  private weightAccum: Float32Array;

  constructor(originalWidth: number, originalHeight: number, scale: number) {
    this.scale = scale;
    this.outputWidth = Math.round(originalWidth * scale);
    this.outputHeight = Math.round(originalHeight * scale);

    const totalPixels = this.outputWidth * this.outputHeight;
    this.rAccum = new Float32Array(totalPixels);
    this.gAccum = new Float32Array(totalPixels);
    this.bAccum = new Float32Array(totalPixels);
    this.weightAccum = new Float32Array(totalPixels);
  }

  /**
   * Adds an upscaled tile (RGB Float32 array, NCHW layout: [3, tileH, tileW])
   * into the blended accumulator.
   */
  public blendTileNCHW(
    tileCoord: TileCoordinate,
    tileData: Float32Array,
    tileOutWidth: number,
    tileOutHeight: number
  ): void {
    const scale = this.scale;
    const destStartX = Math.round(tileCoord.srcX * scale);
    const destStartY = Math.round(tileCoord.srcY * scale);

    const padLeftOut = Math.round(tileCoord.padLeft * scale);
    const padTopOut = Math.round(tileCoord.padTop * scale);
    const padRightOut = Math.round(tileCoord.padRight * scale);
    const padBottomOut = Math.round(tileCoord.padBottom * scale);

    const tilePlaneSize = tileOutWidth * tileOutHeight;
    const rOffset = 0;
    const gOffset = tilePlaneSize;
    const bOffset = tilePlaneSize * 2;

    for (let ty = 0; ty < tileOutHeight; ty++) {
      const outY = destStartY + ty;
      if (outY < 0 || outY >= this.outputHeight) continue;

      // Vertical weight feathering
      let weightY = 1.0;
      if (padTopOut > 0 && ty < padTopOut) {
        weightY = (ty + 1) / (padTopOut + 1);
      } else if (padBottomOut > 0 && ty >= tileOutHeight - padBottomOut) {
        weightY = (tileOutHeight - ty) / (padBottomOut + 1);
      }

      for (let tx = 0; tx < tileOutWidth; tx++) {
        const outX = destStartX + tx;
        if (outX < 0 || outX >= this.outputWidth) continue;

        // Horizontal weight feathering
        let weightX = 1.0;
        if (padLeftOut > 0 && tx < padLeftOut) {
          weightX = (tx + 1) / (padLeftOut + 1);
        } else if (padRightOut > 0 && tx >= tileOutWidth - padRightOut) {
          weightX = (tileOutWidth - tx) / (padRightOut + 1);
        }

        const weight = Math.max(0.001, weightX * weightY);
        const tileIdx = ty * tileOutWidth + tx;
        const outIdx = outY * this.outputWidth + outX;

        const r = tileData[rOffset + tileIdx];
        const g = tileData[gOffset + tileIdx];
        const b = tileData[bOffset + tileIdx];

        this.rAccum[outIdx] += r * weight;
        this.gAccum[outIdx] += g * weight;
        this.bAccum[outIdx] += b * weight;
        this.weightAccum[outIdx] += weight;
      }
    }
  }

  /**
   * Finalizes the blended buffer and writes into Uint8ClampedArray (RGBA).
   */
  public finalize(targetRgba: Uint8ClampedArray): void {
    const totalPixels = this.outputWidth * this.outputHeight;

    for (let i = 0; i < totalPixels; i++) {
      const w = this.weightAccum[i];
      const invW = w > 0 ? 1.0 / w : 1.0;

      const r = Math.min(255, Math.max(0, Math.round(this.rAccum[i] * invW * 255)));
      const g = Math.min(255, Math.max(0, Math.round(this.gAccum[i] * invW * 255)));
      const b = Math.min(255, Math.max(0, Math.round(this.bAccum[i] * invW * 255)));

      const rgbaIdx = i * 4;
      targetRgba[rgbaIdx] = r;
      targetRgba[rgbaIdx + 1] = g;
      targetRgba[rgbaIdx + 2] = b;
      // Default alpha is 255; will be updated if alpha channel exists
      targetRgba[rgbaIdx + 3] = 255;
    }
  }

  public getWidth(): number {
    return this.outputWidth;
  }

  public getHeight(): number {
    return this.outputHeight;
  }
}
