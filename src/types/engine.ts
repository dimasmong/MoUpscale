import { ExecutionProvider, OutputFormat, PresetType, ScaleFactor } from './models';

export interface ImageMetadata {
  name: string;
  originalSize: number;
  width: number;
  height: number;
  format: string;
  hasAlpha: boolean;
  aspectRatio: number;
  megapixels: number;
}

export interface AdvancedEnhancementOptions {
  denoise: number;          // 0 - 100
  sharpen: number;          // 0 - 100
  jpegArtifacts: number;    // 0 - 100
  detailEnhance: number;    // 0 - 100
  edgePreserve: number;     // 0 - 100
  texturePreserve: number;  // 0 - 100
  colorPreserve: number;    // 0 - 100
  preserveAlpha: boolean;
}

export interface UpscaleSettings {
  scaleFactor: ScaleFactor;
  customWidth?: number;
  customHeight?: number;
  lockAspectRatio?: boolean;
  modelId: string;
  preset: PresetType;
  tileSize: number;
  overlap: number;
  outputFormat: OutputFormat;
  quality: number; // 0.1 to 1.0 (for JPEG/WebP)
  advanced: AdvancedEnhancementOptions;
}

export type ProcessingStage = 
  | 'idle'
  | 'preparing'
  | 'loading_model'
  | 'initializing_engine'
  | 'processing_tiles'
  | 'reconstructing'
  | 'applying_enhancements'
  | 'encoding'
  | 'completed'
  | 'cancelled'
  | 'error';

export interface ProcessingProgress {
  stage: ProcessingStage;
  percent: number;
  completedTiles: number;
  totalTiles: number;
  elapsedMs: number;
  estimatedRemainingMs?: number;
  currentMessage: string;
  activeProvider?: ExecutionProvider;
}

export interface ProcessedResult {
  blob: Blob;
  dataUrl: string;
  width: number;
  height: number;
  sizeBytes: number;
  format: OutputFormat;
  processingTimeMs: number;
  executionProvider: ExecutionProvider;
  modelUsed: string;
  scaleApplied: number;
  downsampledMethodDisclosed?: string;
}

export interface BatchItem {
  id: string;
  file: File;
  previewUrl: string;
  metadata: ImageMetadata;
  settings: UpscaleSettings;
  status: 'queued' | 'processing' | 'completed' | 'error' | 'cancelled';
  progress: ProcessingProgress;
  result?: ProcessedResult;
  errorMessage?: string;
}

export type ComparisonViewMode = 'split' | 'side-by-side' | 'original-only' | 'enhanced-only';
