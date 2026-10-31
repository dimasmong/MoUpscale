export type ExecutionProvider = 'webgpu' | 'wasm' | 'cpu';

export interface ModelManifestItem {
  id: string;
  name: string;
  fileName: string;
  path: string;
  scale: number;
  architecture: string;
  sizeBytes: number;
  sizeFormatted: string;
  sha256: string;
  license: string;
  author: string;
  description: string;
  runtimeCompatibility: ExecutionProvider[];
}

export type PresetType = 
  | 'standard' 
  | 'photo' 
  | 'portrait' 
  | 'anime' 
  | 'digital-art' 
  | 'fast' 
  | 'high-quality';

export type ScaleFactor = 2 | 4 | 8 | 'custom';

export type OutputFormat = 'image/png' | 'image/jpeg' | 'image/webp';
