import { ModelManifestItem } from '../../types/models';

export const REGISTERED_MODELS: ModelManifestItem[] = [
  {
    id: 'realesr-general-x4v3',
    name: 'Real-ESRGAN General x4v3',
    fileName: 'realesr-general-x4v3.onnx',
    path: '/models/realesr-general-x4v3.onnx',
    scale: 4,
    architecture: 'SRVGGNetCompact',
    sizeBytes: 4866417,
    sizeFormatted: '4.64 MB',
    sha256: '1940a93ee08283a0429a1b920409a8bcbbd6ad5e83ec65fb20d4fbbcf91cf97e',
    license: 'BSD 3-Clause',
    author: 'Xintao Wang et al. (Tencent ARC Lab)',
    description: 'Lightweight general-purpose 4x super-resolution neural network for photos, screenshots, and scans.',
    runtimeCompatibility: ['webgpu', 'wasm', 'cpu']
  },
  {
    id: 'realesr-animevideov3',
    name: 'Real-ESRGAN AnimeVideo v3',
    fileName: 'realesr-animevideov3.onnx',
    path: '/models/realesr-animevideov3.onnx',
    scale: 4,
    architecture: 'SRVGGNetCompact',
    sizeBytes: 2493261,
    sizeFormatted: '2.38 MB',
    sha256: '0a25cdd3cdfded5508a8e3cb98305f6396f86644d673648ebc46927a052ff3c1',
    license: 'BSD 3-Clause',
    author: 'Xintao Wang et al. (Tencent ARC Lab)',
    description: 'Specialized 4x neural model tuned for line-art clarity, anime illustrations, and digital animations.',
    runtimeCompatibility: ['webgpu', 'wasm', 'cpu']
  },
  {
    id: 'esrgan-compact-x2',
    name: 'Compact ESRGAN x2 Native',
    fileName: 'esrgan-compact-x2.onnx',
    path: '/models/esrgan-compact-x2.onnx',
    scale: 2,
    architecture: 'Compact ESRGAN',
    sizeBytes: 2411189,
    sizeFormatted: '2.30 MB',
    sha256: '75c3f46fb2efd586dca50a97aa3508d4b31a89c9e83ecf0a2ba185387431c4f5',
    license: 'MIT / Apache 2.0',
    author: 'OpenModelDB / Nomos Community',
    description: 'Native 2x super-resolution for general images and photos with rapid execution.',
    runtimeCompatibility: ['webgpu', 'wasm', 'cpu']
  }
];

export function getModelById(id: string): ModelManifestItem {
  const model = REGISTERED_MODELS.find(m => m.id === id);
  if (!model) {
    return REGISTERED_MODELS[0];
  }
  return model;
}

export function getDefaultModelForPreset(preset: string): ModelManifestItem {
  switch (preset) {
    case 'anime':
      return REGISTERED_MODELS.find(m => m.id === 'realesr-animevideov3') || REGISTERED_MODELS[0];
    case 'fast':
      return REGISTERED_MODELS.find(m => m.id === 'esrgan-compact-x2') || REGISTERED_MODELS[0];
    case 'photo':
    case 'portrait':
    case 'digital-art':
    case 'high-quality':
    case 'standard':
    default:
      return REGISTERED_MODELS.find(m => m.id === 'realesr-general-x4v3') || REGISTERED_MODELS[0];
  }
}
