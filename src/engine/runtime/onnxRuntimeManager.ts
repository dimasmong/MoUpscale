import * as ort from 'onnxruntime-web';
import { ExecutionProvider, ModelManifestItem } from '../../types/models';
import { fetchModelBufferWithProgress, ModelDownloadProgress } from '../models/modelCache';

// Configure ONNX Runtime Web environment
if (typeof window !== 'undefined') {
  ort.env.wasm.wasmPaths = '/wasm/';
  // Auto-detect thread count (capped reasonably for browser stability)
  const logicalProcessors = navigator.hardwareConcurrency || 4;
  ort.env.wasm.numThreads = Math.min(4, Math.max(1, logicalProcessors - 1));
  ort.env.wasm.simd = true;
}

let webGpuChecked = false;
let isWebGpuAvailable = false;

export async function detectWebGPUSupport(): Promise<boolean> {
  if (webGpuChecked) return isWebGpuAvailable;
  if (typeof navigator === 'undefined' || !navigator.gpu) {
    webGpuChecked = true;
    isWebGpuAvailable = false;
    return false;
  }
  try {
    const adapter = await navigator.gpu.requestAdapter();
    isWebGpuAvailable = !!adapter;
  } catch (e) {
    console.warn('[ONNX] WebGPU adapter check failed:', e);
    isWebGpuAvailable = false;
  }
  webGpuChecked = true;
  return isWebGpuAvailable;
}

interface LoadedSessionRecord {
  session: ort.InferenceSession;
  provider: ExecutionProvider;
  modelId: string;
}

const sessionCache = new Map<string, LoadedSessionRecord>();

export async function getOrCreateSession(
  model: ModelManifestItem,
  onProgress?: (p: ModelDownloadProgress) => void
): Promise<{ session: ort.InferenceSession; provider: ExecutionProvider }> {
  // Check active cached session
  if (sessionCache.has(model.id)) {
    const cached = sessionCache.get(model.id)!;
    return { session: cached.session, provider: cached.provider };
  }

  // 1. Fetch model binary
  const modelBuffer = await fetchModelBufferWithProgress(model, onProgress);

  // 2. Determine best execution provider
  const canUseWebGPU = await detectWebGPUSupport();
  
  let session: ort.InferenceSession | null = null;
  let activeProvider: ExecutionProvider = 'wasm';

  // Try WebGPU first if supported
  if (canUseWebGPU) {
    try {
      console.log(`[ONNX] Attempting WebGPU session for ${model.name}...`);
      session = await ort.InferenceSession.create(modelBuffer, {
        executionProviders: ['webgpu'],
        graphOptimizationLevel: 'all',
      });
      activeProvider = 'webgpu';
      console.log(`[ONNX] Successfully initialized WebGPU session for ${model.name}`);
    } catch (gpuError) {
      console.warn(`[ONNX] WebGPU session failed, falling back to WASM:`, gpuError);
    }
  }

  // Fallback to WASM
  if (!session) {
    console.log(`[ONNX] Initializing WASM session for ${model.name}...`);
    session = await ort.InferenceSession.create(modelBuffer, {
      executionProviders: ['wasm'],
      graphOptimizationLevel: 'all',
    });
    activeProvider = 'wasm';
    console.log(`[ONNX] Successfully initialized WASM session for ${model.name}`);
  }

  sessionCache.set(model.id, {
    session,
    provider: activeProvider,
    modelId: model.id,
  });

  return { session, provider: activeProvider };
}

export function releaseSession(modelId: string): void {
  if (sessionCache.has(modelId)) {
    try {
      sessionCache.get(modelId)!.session.release();
    } catch (e) {
      console.warn('[ONNX] Error releasing session:', e);
    }
    sessionCache.delete(modelId);
  }
}

export function releaseAllSessions(): void {
  for (const [_, rec] of sessionCache.entries()) {
    try {
      rec.session.release();
    } catch {
      // ignore
    }
  }
  sessionCache.clear();
}
