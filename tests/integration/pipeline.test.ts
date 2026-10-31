import { describe, it, expect } from 'vitest';
import { packageBatchToZip } from '../../src/engine/encoding/zipPacker';
import { BatchItem } from '../../src/types';
import JSZip from 'jszip';

describe('Batch and Packaging Integration', () => {
  it('packages multiple processed images into a readable ZIP archive with valid filenames', async () => {
    const dummyBlob1 = new Blob([new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10])], { type: 'image/png' });
    const dummyBlob2 = new Blob([new Uint8Array([255, 216, 255])], { type: 'image/jpeg' });

    const batchItems: BatchItem[] = [
      {
        id: '1',
        file: new File([dummyBlob1], 'landscape.png', { type: 'image/png' }),
        previewUrl: 'blob:fake1',
        metadata: {
          name: 'landscape.png',
          originalSize: 100,
          width: 50,
          height: 50,
          format: 'image/png',
          hasAlpha: false,
          aspectRatio: 1,
          megapixels: 0.002,
        },
        settings: {} as any,
        status: 'completed',
        progress: {} as any,
        result: {
          blob: dummyBlob1,
          dataUrl: 'blob:fake1',
          width: 200,
          height: 200,
          sizeBytes: 100,
          format: 'image/png',
          processingTimeMs: 120,
          executionProvider: 'wasm',
          modelUsed: 'Real-ESRGAN General x4v3',
          scaleApplied: 4,
        },
      },
      {
        id: '2',
        file: new File([dummyBlob2], 'character.jpg', { type: 'image/jpeg' }),
        previewUrl: 'blob:fake2',
        metadata: {
          name: 'character.jpg',
          originalSize: 150,
          width: 60,
          height: 60,
          format: 'image/jpeg',
          hasAlpha: false,
          aspectRatio: 1,
          megapixels: 0.003,
        },
        settings: {} as any,
        status: 'completed',
        progress: {} as any,
        result: {
          blob: dummyBlob2,
          dataUrl: 'blob:fake2',
          width: 120,
          height: 120,
          sizeBytes: 150,
          format: 'image/jpeg',
          processingTimeMs: 90,
          executionProvider: 'wasm',
          modelUsed: 'Compact ESRGAN x2 Native',
          scaleApplied: 2,
        },
      },
    ];

    const zipBlob = await packageBatchToZip(batchItems);
    expect(zipBlob).toBeDefined();
    expect(zipBlob.size).toBeGreaterThan(0);

    // Read back and inspect archive contents
    const zip = await JSZip.loadAsync(await zipBlob.arrayBuffer());
    const fileNames = Object.keys(zip.files);
    expect(fileNames).toContain('landscape_moupscale_4x.png');
    expect(fileNames).toContain('character_moupscale_2x.jpg');
  });

  it('fails gracefully when batch has zero completed items', async () => {
    const emptyBatch: BatchItem[] = [
      {
        id: '1',
        file: new File([], 'test.png'),
        previewUrl: '',
        metadata: {} as any,
        settings: {} as any,
        status: 'queued',
        progress: {} as any,
      },
    ];

    await expect(packageBatchToZip(emptyBatch)).rejects.toThrow('No completed images found');
  });
});
