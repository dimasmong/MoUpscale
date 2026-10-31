import JSZip from 'jszip';
import { BatchItem } from '../../types/engine';

export async function packageBatchToZip(
  items: BatchItem[],
  onProgress?: (percent: number) => void
): Promise<Blob> {
  const zip = new JSZip();

  const completedItems = items.filter(
    (item) => item.status === 'completed' && item.result?.blob
  );

  if (completedItems.length === 0) {
    throw new Error('No completed images found in batch to package.');
  }

  for (let i = 0; i < completedItems.length; i++) {
    const item = completedItems[i];
    const result = item.result!;
    const baseName = item.metadata.name.replace(/\.[^/.]+$/, '');
    const ext = result.format === 'image/jpeg' ? 'jpg' : result.format === 'image/webp' ? 'webp' : 'png';
    const scaleLabel = `${result.scaleApplied}x`;
    const filename = `${baseName}_moupscale_${scaleLabel}.${ext}`;

    zip.file(filename, result.blob);
  }

  const zipBlob = await zip.generateAsync(
    {
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    },
    (metadata) => {
      onProgress?.(Math.round(metadata.percent));
    }
  );

  return zipBlob;
}
