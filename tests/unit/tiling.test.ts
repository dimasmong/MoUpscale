import { describe, it, expect } from 'vitest';
import { computeTileGrid, determineOptimalTileSize } from '../../src/engine/tiling/tileCalculator';
import { TileBlender } from '../../src/engine/tiling/tileBlender';

describe('Tiling Calculation and Blending', () => {
  it('determines appropriate tile size for various image dimensions', () => {
    const small = determineOptimalTileSize(200, 150);
    expect(small.tileSize).toBe(256);
    expect(small.overlap).toBe(0);

    const normal = determineOptimalTileSize(800, 600);
    expect(normal.tileSize).toBe(256);
    expect(normal.overlap).toBe(16);

    const large = determineOptimalTileSize(2000, 1500);
    expect(large.tileSize).toBe(384);
    expect(large.overlap).toBe(24);
  });

  it('computes complete tile grid covering 100% of image pixels without holes', () => {
    const width = 500;
    const height = 400;
    const tileSize = 256;
    const overlap = 16;

    const tiles = computeTileGrid(width, height, tileSize, overlap);
    expect(tiles.length).toBeGreaterThan(1);

    // Verify all tiles are within bounds and have positive dimensions
    for (const tile of tiles) {
      expect(tile.x).toBeGreaterThanOrEqual(0);
      expect(tile.y).toBeGreaterThanOrEqual(0);
      expect(tile.width).toBeGreaterThan(0);
      expect(tile.height).toBeGreaterThan(0);
      expect(tile.x + tile.width).toBeLessThanOrEqual(width);
      expect(tile.y + tile.height).toBeLessThanOrEqual(height);

      expect(tile.srcX).toBeLessThanOrEqual(tile.x);
      expect(tile.srcY).toBeLessThanOrEqual(tile.y);
      expect(tile.srcWidth).toBeGreaterThanOrEqual(tile.width);
      expect(tile.srcHeight).toBeGreaterThanOrEqual(tile.height);
    }

    // Verify sum of core area matches total image area
    const totalCorePixels = tiles.reduce((acc, t) => acc + t.width * t.height, 0);
    expect(totalCorePixels).toBe(width * height);
  });

  it('computes single tile when image fits within tileSize and overlap is 0', () => {
    const tiles = computeTileGrid(128, 128, 256, 0);
    expect(tiles.length).toBe(1);
    expect(tiles[0].x).toBe(0);
    expect(tiles[0].y).toBe(0);
    expect(tiles[0].width).toBe(128);
    expect(tiles[0].height).toBe(128);
  });

  it('handles odd dimensions correctly (e.g. 127 x 93)', () => {
    const tiles = computeTileGrid(127, 93, 64, 8);
    expect(tiles.length).toBeGreaterThan(1);
    const totalArea = tiles.reduce((acc, t) => acc + t.width * t.height, 0);
    expect(totalArea).toBe(127 * 93);
  });

  it('blends tiles smoothly into final RGBA buffer without NaN or out-of-bounds values', () => {
    const scale = 4;
    const origW = 100;
    const origH = 100;
    const blender = new TileBlender(origW, origH, scale);

    const tiles = computeTileGrid(origW, origH, 64, 16);
    for (const tile of tiles) {
      const outW = tile.srcWidth * scale;
      const outH = tile.srcHeight * scale;
      const tileData = new Float32Array(3 * outW * outH).fill(0.75);
      blender.blendTileNCHW(tile, tileData, outW, outH);
    }

    const finalRgba = new Uint8ClampedArray(origW * scale * origH * scale * 4);
    blender.finalize(finalRgba);

    expect(finalRgba.length).toBe(400 * 400 * 4);
    // Every pixel should be close to 0.75 * 255 = 191
    expect(finalRgba[0]).toBeGreaterThanOrEqual(180);
    expect(finalRgba[0]).toBeLessThanOrEqual(200);
    expect(finalRgba[3]).toBe(255); // Alpha channel default
  });
});
