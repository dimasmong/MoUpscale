import { PresetType, UpscaleSettings } from '../types';

export const DEFAULT_SETTINGS: UpscaleSettings = {
  scaleFactor: 4,
  modelId: 'realesr-general-x4v3',
  preset: 'standard',
  tileSize: 0, // 0 = Auto
  overlap: 16,
  outputFormat: 'image/png',
  quality: 0.95,
  advanced: {
    denoise: 0,
    sharpen: 15,
    jpegArtifacts: 0,
    detailEnhance: 15,
    edgePreserve: 20,
    texturePreserve: 15,
    colorPreserve: 10,
    preserveAlpha: true,
  },
};

export function getPresetSettings(preset: PresetType): Partial<UpscaleSettings> {
  switch (preset) {
    case 'photo':
      return {
        preset: 'photo',
        modelId: 'realesr-general-x4v3',
        scaleFactor: 4,
        advanced: {
          denoise: 10,
          sharpen: 10,
          jpegArtifacts: 5,
          detailEnhance: 10,
          edgePreserve: 15,
          texturePreserve: 25,
          colorPreserve: 20,
          preserveAlpha: true,
        },
      };

    case 'portrait':
      return {
        preset: 'portrait',
        modelId: 'realesr-general-x4v3',
        scaleFactor: 4,
        advanced: {
          denoise: 15,
          sharpen: 5,
          jpegArtifacts: 10,
          detailEnhance: 5,
          edgePreserve: 30,
          texturePreserve: 15,
          colorPreserve: 15,
          preserveAlpha: true,
        },
      };

    case 'anime':
      return {
        preset: 'anime',
        modelId: 'realesr-animevideov3',
        scaleFactor: 4,
        advanced: {
          denoise: 5,
          sharpen: 25,
          jpegArtifacts: 0,
          detailEnhance: 10,
          edgePreserve: 40,
          texturePreserve: 10,
          colorPreserve: 25,
          preserveAlpha: true,
        },
      };

    case 'digital-art':
      return {
        preset: 'digital-art',
        modelId: 'realesr-general-x4v3',
        scaleFactor: 4,
        advanced: {
          denoise: 0,
          sharpen: 25,
          jpegArtifacts: 0,
          detailEnhance: 25,
          edgePreserve: 30,
          texturePreserve: 20,
          colorPreserve: 15,
          preserveAlpha: true,
        },
      };

    case 'fast':
      return {
        preset: 'fast',
        modelId: 'esrgan-compact-x2',
        scaleFactor: 2,
        tileSize: 192,
        advanced: {
          denoise: 0,
          sharpen: 10,
          jpegArtifacts: 0,
          detailEnhance: 0,
          edgePreserve: 10,
          texturePreserve: 10,
          colorPreserve: 0,
          preserveAlpha: true,
        },
      };

    case 'high-quality':
      return {
        preset: 'high-quality',
        modelId: 'realesr-general-x4v3',
        scaleFactor: 4,
        tileSize: 256,
        overlap: 32,
        advanced: {
          denoise: 10,
          sharpen: 20,
          jpegArtifacts: 10,
          detailEnhance: 20,
          edgePreserve: 25,
          texturePreserve: 25,
          colorPreserve: 15,
          preserveAlpha: true,
        },
      };

    case 'standard':
    default:
      return {
        preset: 'standard',
        modelId: 'realesr-general-x4v3',
        scaleFactor: 4,
        advanced: {
          denoise: 0,
          sharpen: 15,
          jpegArtifacts: 0,
          detailEnhance: 15,
          edgePreserve: 20,
          texturePreserve: 15,
          colorPreserve: 10,
          preserveAlpha: true,
        },
      };
  }
}
