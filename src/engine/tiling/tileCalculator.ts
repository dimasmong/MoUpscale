export interface TileCoordinate {
  index: number;
  // Core destination region in original image coordinates
  x: number;
  y: number;
  width: number;
  height: number;
  // Padded extraction region (with overlap)
  srcX: number;
  srcY: number;
  srcWidth: number;
  srcHeight: number;
  // Padding amounts inside the extracted tile
  padLeft: number;
  padTop: number;
  padRight: number;
  padBottom: number;
}

export function determineOptimalTileSize(width: number, height: number, customSize?: number): { tileSize: number; overlap: number } {
  if (customSize && customSize > 0) {
    const overlap = Math.max(8, Math.min(32, Math.floor(customSize * 0.1)));
    return { tileSize: customSize, overlap };
  }

  const maxDim = Math.max(width, height);
  // For small images, single tile is fastest and artifact-free
  if (maxDim <= 256) {
    return { tileSize: 256, overlap: 0 };
  }

  // Check if mobile or constrained
  const isMobile = typeof window !== 'undefined' && (
    /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
    (window.innerWidth <= 768)
  );

  if (isMobile) {
    return { tileSize: 192, overlap: 16 };
  }

  if (maxDim > 1200) {
    return { tileSize: 384, overlap: 24 };
  }

  return { tileSize: 256, overlap: 16 };
}

export function computeTileGrid(
  imageWidth: number,
  imageHeight: number,
  tileSize: number,
  overlap: number
): TileCoordinate[] {
  // If the entire image fits in one tile and overlap is 0, return single tile
  if (imageWidth <= tileSize && imageHeight <= tileSize && overlap === 0) {
    return [
      {
        index: 0,
        x: 0,
        y: 0,
        width: imageWidth,
        height: imageHeight,
        srcX: 0,
        srcY: 0,
        srcWidth: imageWidth,
        srcHeight: imageHeight,
        padLeft: 0,
        padTop: 0,
        padRight: 0,
        padBottom: 0,
      },
    ];
  }

  const tiles: TileCoordinate[] = [];
  let index = 0;

  // Step through image by (tileSize - overlap) so cores tile smoothly
  const stride = Math.max(16, tileSize - overlap);

  for (let y = 0; y < imageHeight; y += stride) {
    const curHeight = Math.min(stride, imageHeight - y);
    
    for (let x = 0; x < imageWidth; x += stride) {
      const curWidth = Math.min(stride, imageWidth - x);

      // Calculate context padding around this core
      const padLeft = Math.min(overlap, x);
      const padTop = Math.min(overlap, y);
      const padRight = Math.min(overlap, imageWidth - (x + curWidth));
      const padBottom = Math.min(overlap, imageHeight - (y + curHeight));

      const srcX = x - padLeft;
      const srcY = y - padTop;
      const srcWidth = padLeft + curWidth + padRight;
      const srcHeight = padTop + curHeight + padBottom;

      tiles.push({
        index,
        x,
        y,
        width: curWidth,
        height: curHeight,
        srcX,
        srcY,
        srcWidth,
        srcHeight,
        padLeft,
        padTop,
        padRight,
        padBottom,
      });

      index++;
    }
  }

  return tiles;
}
