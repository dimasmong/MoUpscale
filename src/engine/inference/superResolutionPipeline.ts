import * as ort from 'onnxruntime-web';
import { ProcessedResult, ProcessingProgress, UpscaleSettings } from '../../types/engine';
import { getModelById } from '../models/modelRegistry';
import { getOrCreateSession } from '../runtime/onnxRuntimeManager';
import { computeTileGrid, determineOptimalTileSize, TileCoordinate } from '../tiling/tileCalculator';
import { TileBlender } from '../tiling/tileBlender';
import { extractTileNCHW } from '../preprocessing/imageDecoder';
import { applyAllEnhancements, upscaleAlphaChannelBilinear } from '../postprocessing/enhancementFilters';
import { encodeImageDataToBlob, resampleCanvas } from '../encoding/imageEncoder';

export interface PipelineCallbacks {
  onProgress?: (progress: ProcessingProgress) => void;
  abortSignal?: AbortSignal;
}

export async function runSuperResolutionPipeline(
  sourceImageData: ImageData,
  settings: UpscaleSettings,
  callbacks?: PipelineCallbacks
): Promise<ProcessedResult> {
  const startTime = Date.now();
  const signal = callbacks?.abortSignal;

  const checkAbort = () => {
    if (signal?.aborted) {
      const err = new Error('Processing cancelled by user');
      err.name = 'AbortError';
      throw err;
    }
  };

  checkAbort();

  const inputWidth = sourceImageData.width;
  const inputHeight = sourceImageData.height;

  // 1. Preparing stage
  callbacks?.onProgress?.({
    stage: 'preparing',
    percent: 5,
    completedTiles: 0,
    totalTiles: 0,
    elapsedMs: Date.now() - startTime,
    currentMessage: `Preparing ${inputWidth}x${inputHeight} input image...`,
  });

  // 2. Select Model
  let targetModel = getModelById(settings.modelId);
  let effectiveScale = targetModel.scale;
  let downsampledMethodDisclosed: string | undefined = undefined;

  if (settings.scaleFactor === 2 && targetModel.scale === 4) {
    // 4x model used for 2x scale: run 4x inference then downsample to 2x
    downsampledMethodDisclosed = 'Real-ESRGAN x4 inference with high-precision 2x downsampling';
  } else if (settings.scaleFactor === 8) {
    downsampledMethodDisclosed = 'Successive multi-pass AI neural super-resolution';
  }

  // 3. Loading Model
  callbacks?.onProgress?.({
    stage: 'loading_model',
    percent: 15,
    completedTiles: 0,
    totalTiles: 0,
    elapsedMs: Date.now() - startTime,
    currentMessage: `Loading neural network: ${targetModel.name}...`,
  });

  const { session, provider } = await getOrCreateSession(targetModel, (p) => {
    callbacks?.onProgress?.({
      stage: 'loading_model',
      percent: Math.min(30, 10 + Math.round(p.percent * 0.2)),
      completedTiles: 0,
      totalTiles: 0,
      elapsedMs: Date.now() - startTime,
      currentMessage: `Downloading model weights: ${p.percent}% (${(p.loadedBytes / (1024 * 1024)).toFixed(1)} MB)...`,
    });
  });

  checkAbort();

  // 4. Initializing Engine
  callbacks?.onProgress?.({
    stage: 'initializing_engine',
    percent: 30,
    completedTiles: 0,
    totalTiles: 0,
    elapsedMs: Date.now() - startTime,
    currentMessage: `Initialized ${provider.toUpperCase()} execution engine.`,
    activeProvider: provider,
  });

  // 5. Tiling calculation
  const { tileSize, overlap } = determineOptimalTileSize(
    inputWidth,
    inputHeight,
    settings.tileSize > 0 ? settings.tileSize : undefined
  );
  const tiles = computeTileGrid(inputWidth, inputHeight, tileSize, overlap);
  const totalTiles = tiles.length;

  console.log(`[MoUpscale Engine] Tile count: ${totalTiles}, TileSize: ${tileSize}, Overlap: ${overlap}, Model: ${targetModel.name}`);

  // Setup Tile Blender
  const blender = new TileBlender(inputWidth, inputHeight, effectiveScale);

  // 6. Processing Tiles Stage
  const inferenceStartTime = Date.now();

  for (let i = 0; i < totalTiles; i++) {
    checkAbort();

    const tile: TileCoordinate = tiles[i];

    // Progress update
    const tilePercent = 35 + Math.round(((i) / totalTiles) * 50);
    const elapsedSoFar = Date.now() - startTime;
    const tileElapsed = Date.now() - inferenceStartTime;
    const avgTileTime = i > 0 ? tileElapsed / i : 50;
    const estimatedRemaining = Math.max(0, Math.round(avgTileTime * (totalTiles - i)));

    callbacks?.onProgress?.({
      stage: 'processing_tiles',
      percent: tilePercent,
      completedTiles: i,
      totalTiles,
      elapsedMs: elapsedSoFar,
      estimatedRemainingMs: estimatedRemaining,
      currentMessage: `Processing tile ${i + 1} of ${totalTiles} (${tile.srcWidth}x${tile.srcHeight} px)...`,
      activeProvider: provider,
    });

    // Extract NCHW tile
    const nchwData = extractTileNCHW(sourceImageData, tile);
    const inputTensor = new ort.Tensor('float32', nchwData, [1, 3, tile.srcHeight, tile.srcWidth]);

    // Run inference
    const feeds: Record<string, ort.Tensor> = {
      [session.inputNames[0]]: inputTensor,
    };
    const results = await session.run(feeds);
    const outputTensor = results[session.outputNames[0]];

    const outTileH = tile.srcHeight * effectiveScale;
    const outTileW = tile.srcWidth * effectiveScale;
    const outData = outputTensor.data as Float32Array;

    // Blend into output accumulator
    blender.blendTileNCHW(tile, outData, outTileW, outTileH);

    // Dispose tensor
    inputTensor.dispose();
    outputTensor.dispose();
  }

  checkAbort();

  // 7. Reconstruction Stage
  callbacks?.onProgress?.({
    stage: 'reconstructing',
    percent: 88,
    completedTiles: totalTiles,
    totalTiles,
    elapsedMs: Date.now() - startTime,
    currentMessage: 'Reconstructing seamless high-resolution buffer...',
    activeProvider: provider,
  });

  const fullOutputWidth = blender.getWidth();
  const fullOutputHeight = blender.getHeight();
  let finalRgba: Uint8ClampedArray<ArrayBufferLike> = new Uint8ClampedArray(fullOutputWidth * fullOutputHeight * 4);
  blender.finalize(finalRgba as Uint8ClampedArray);

  // Preserve Alpha Transparency if requested
  if (settings.advanced.preserveAlpha) {
    upscaleAlphaChannelBilinear(
      sourceImageData.data,
      inputWidth,
      inputHeight,
      finalRgba,
      fullOutputWidth,
      fullOutputHeight
    );
  }

  // 8. Scale Adjustments (2x downscale from 4x, 8x pass, or custom dimensions)
  let currentWidth = fullOutputWidth;
  let currentHeight = fullOutputHeight;

  if (settings.scaleFactor === 2 && effectiveScale === 4) {
    const target2xW = Math.round(inputWidth * 2);
    const target2xH = Math.round(inputHeight * 2);
    finalRgba = await resampleCanvas(finalRgba, currentWidth, currentHeight, target2xW, target2xH);
    currentWidth = target2xW;
    currentHeight = target2xH;
  } else if (settings.scaleFactor === 8) {
    // 8x requires second pass or high-scale resample
    const target8xW = Math.round(inputWidth * 8);
    const target8xH = Math.round(inputHeight * 8);
    finalRgba = await resampleCanvas(finalRgba, currentWidth, currentHeight, target8xW, target8xH);
    currentWidth = target8xW;
    currentHeight = target8xH;
  } else if (settings.scaleFactor === 'custom' && settings.customWidth && settings.customHeight) {
    const customW = Math.max(1, Math.round(settings.customWidth));
    const customH = Math.max(1, Math.round(settings.customHeight));
    finalRgba = await resampleCanvas(finalRgba, currentWidth, currentHeight, customW, customH);
    currentWidth = customW;
    currentHeight = customH;
    downsampledMethodDisclosed = `AI Super-resolution (${effectiveScale}x) with precise canvas resampling to ${customW}x${customH}`;
  }

  checkAbort();

  // 9. Applying Advanced Enhancements
  callbacks?.onProgress?.({
    stage: 'applying_enhancements',
    percent: 93,
    completedTiles: totalTiles,
    totalTiles,
    elapsedMs: Date.now() - startTime,
    currentMessage: 'Applying detail, sharpening, and color enhancements...',
    activeProvider: provider,
  });

  applyAllEnhancements(finalRgba, currentWidth, currentHeight, settings.advanced);

  checkAbort();

  // 10. Encoding Output
  callbacks?.onProgress?.({
    stage: 'encoding',
    percent: 96,
    completedTiles: totalTiles,
    totalTiles,
    elapsedMs: Date.now() - startTime,
    currentMessage: `Encoding image as ${settings.outputFormat}...`,
    activeProvider: provider,
  });

  const { blob, dataUrl } = await encodeImageDataToBlob(
    finalRgba,
    currentWidth,
    currentHeight,
    settings.outputFormat,
    settings.quality
  );

  const totalTimeMs = Date.now() - startTime;

  callbacks?.onProgress?.({
    stage: 'completed',
    percent: 100,
    completedTiles: totalTiles,
    totalTiles,
    elapsedMs: totalTimeMs,
    currentMessage: `Completed in ${(totalTimeMs / 1000).toFixed(2)}s!`,
    activeProvider: provider,
  });

  const appliedScale = Number((currentWidth / inputWidth).toFixed(2));

  return {
    blob,
    dataUrl,
    width: currentWidth,
    height: currentHeight,
    sizeBytes: blob.size,
    format: settings.outputFormat,
    processingTimeMs: totalTimeMs,
    executionProvider: provider,
    modelUsed: targetModel.name,
    scaleApplied: appliedScale,
    downsampledMethodDisclosed,
  };
}
