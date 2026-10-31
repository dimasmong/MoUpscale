import { ModelManifestItem } from '../../types/models';

const CACHE_NAME = 'moupscale-models-v1';
const inMemoryCache = new Map<string, ArrayBuffer>();

export interface ModelDownloadProgress {
  modelId: string;
  loadedBytes: number;
  totalBytes: number;
  percent: number;
}

export async function fetchModelBufferWithProgress(
  model: ModelManifestItem,
  onProgress?: (p: ModelDownloadProgress) => void
): Promise<ArrayBuffer> {
  // 1. Check in-memory cache
  if (inMemoryCache.has(model.id)) {
    const buf = inMemoryCache.get(model.id)!;
    onProgress?.({
      modelId: model.id,
      loadedBytes: buf.byteLength,
      totalBytes: buf.byteLength,
      percent: 100,
    });
    return buf;
  }

  // 2. Check Cache API
  if (typeof caches !== 'undefined') {
    try {
      const cache = await caches.open(CACHE_NAME);
      const cachedResponse = await cache.match(model.path);
      if (cachedResponse && cachedResponse.ok) {
        const buf = await cachedResponse.arrayBuffer();
        if (buf.byteLength > 1000) {
          inMemoryCache.set(model.id, buf);
          onProgress?.({
            modelId: model.id,
            loadedBytes: buf.byteLength,
            totalBytes: buf.byteLength,
            percent: 100,
          });
          return buf;
        }
      }
    } catch (e) {
      console.warn('[ModelCache] Cache API match warning:', e);
    }
  }

  // 3. Fetch from network with stream progress
  const response = await fetch(model.path);
  if (!response.ok) {
    throw new Error(`Failed to download model ${model.name}: HTTP ${response.status} ${response.statusText}`);
  }

  const contentLengthHeader = response.headers.get('content-length');
  const totalBytes = contentLengthHeader ? parseInt(contentLengthHeader, 10) : model.sizeBytes;
  
  if (!response.body) {
    const buf = await response.arrayBuffer();
    inMemoryCache.set(model.id, buf);
    return buf;
  }

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let loadedBytes = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) {
      chunks.push(value);
      loadedBytes += value.length;
      const percent = totalBytes > 0 ? Math.min(100, Math.round((loadedBytes / totalBytes) * 100)) : 50;
      onProgress?.({
        modelId: model.id,
        loadedBytes,
        totalBytes,
        percent,
      });
    }
  }

  // Concatenate chunks
  const totalLength = chunks.reduce((acc, c) => acc + c.length, 0);
  const combined = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    combined.set(chunk, offset);
    offset += chunk.length;
  }

  const finalBuffer = combined.buffer;
  inMemoryCache.set(model.id, finalBuffer);

  // Store in browser Cache API for persistent offline use
  if (typeof caches !== 'undefined') {
    try {
      const cache = await caches.open(CACHE_NAME);
      const clonedResponse = new Response(finalBuffer, {
        headers: {
          'Content-Type': 'application/octet-stream',
          'Content-Length': String(finalBuffer.byteLength),
        },
      });
      await cache.put(model.path, clonedResponse);
    } catch (e) {
      console.warn('[ModelCache] Failed to persist model in Cache API:', e);
    }
  }

  return finalBuffer;
}

export async function clearModelCache(): Promise<void> {
  inMemoryCache.clear();
  if (typeof caches !== 'undefined') {
    try {
      await caches.delete(CACHE_NAME);
    } catch {
      // ignore
    }
  }
}
