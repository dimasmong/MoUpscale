import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { DropZone } from './components/upload/DropZone';
import { SettingsPanel } from './components/workspace/SettingsPanel';
import { ComparisonViewer } from './components/preview/ComparisonViewer';
import { ProgressIndicator } from './components/processing/ProgressIndicator';
import { ExportControls } from './components/export/ExportControls';
import { BatchQueueList } from './components/workspace/BatchQueueList';
import { InfoModals, ModalType } from './components/pages/InfoModals';

import { useTheme } from './hooks/useTheme';
import { useI18n } from './hooks/useI18n';
import { 
  BatchItem, 
  ComparisonViewMode, 
  ExecutionProvider, 
  ImageMetadata, 
  ProcessedResult, 
  ProcessingProgress, 
  UpscaleSettings 
} from './types';
import { DEFAULT_SETTINGS } from './utils/presets';
import { decodeImageFile } from './engine/preprocessing/imageDecoder';
import { runSuperResolutionPipeline } from './engine/inference/superResolutionPipeline';
import { packageBatchToZip } from './engine/encoding/zipPacker';
import { detectWebGPUSupport } from './engine/runtime/onnxRuntimeManager';
import { Trash2, Layers, Sparkles } from 'lucide-react';

export function App() {
  const { theme: _theme, toggleTheme, isDark } = useTheme();
  const { language, setLanguage, t } = useI18n();

  // Active view tab: 'workspace' or 'batch'
  const [activeTab, setActiveTab] = useState<'workspace' | 'batch'>('workspace');
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [activeProvider, setActiveProvider] = useState<ExecutionProvider>('wasm');

  // Single Image State
  const [_currentFile, setCurrentFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [inputImageData, setInputImageData] = useState<ImageData | null>(null);
  const [inputMetadata, setInputMetadata] = useState<ImageMetadata | null>(null);
  const [settings, setSettings] = useState<UpscaleSettings>(DEFAULT_SETTINGS);
  const [comparisonMode, setComparisonMode] = useState<ComparisonViewMode>('split');

  // Processing state
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<ProcessingProgress>({
    stage: 'idle',
    percent: 0,
    completedTiles: 0,
    totalTiles: 0,
    elapsedMs: 0,
    currentMessage: t.progress.idle,
  });
  const [processedResult, setProcessedResult] = useState<ProcessedResult | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Batch Queue State
  const [batchItems, setBatchItems] = useState<BatchItem[]>([]);
  const [activeBatchItemId, setActiveBatchItemId] = useState<string | null>(null);
  const [isProcessingBatch, setIsProcessingBatch] = useState<boolean>(false);

  // Detect hardware acceleration on mount
  useEffect(() => {
    detectWebGPUSupport().then((supported) => {
      setActiveProvider(supported ? 'webgpu' : 'wasm');
    });
  }, []);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      if (originalUrl) URL.revokeObjectURL(originalUrl);
      if (processedResult?.dataUrl) URL.revokeObjectURL(processedResult.dataUrl);
      batchItems.forEach((b) => {
        if (b.previewUrl) URL.revokeObjectURL(b.previewUrl);
        if (b.result?.dataUrl) URL.revokeObjectURL(b.result.dataUrl);
      });
    };
  }, [originalUrl, processedResult, batchItems]);

  // Handle files selection from DropZone or File Input
  const handleFilesSelected = useCallback(async (files: File[]) => {
    if (files.length === 0) return;

    if (files.length === 1 && batchItems.length === 0) {
      // Single file workflow
      const file = files[0];
      try {
        const { imageData, metadata } = await decodeImageFile(file);
        const url = URL.createObjectURL(file);

        if (originalUrl) URL.revokeObjectURL(originalUrl);
        if (processedResult?.dataUrl) URL.revokeObjectURL(processedResult.dataUrl);

        setCurrentFile(file);
        setOriginalUrl(url);
        setInputImageData(imageData);
        setInputMetadata(metadata);
        setProcessedResult(null);
        setProgress({
          stage: 'idle',
          percent: 0,
          completedTiles: 0,
          totalTiles: 0,
          elapsedMs: 0,
          currentMessage: t.progress.idle,
        });

        // Add to batch list as well for consistency
        const newItem: BatchItem = {
          id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          file,
          previewUrl: url,
          metadata,
          settings: { ...settings },
          status: 'queued',
          progress: {
            stage: 'idle',
            percent: 0,
            completedTiles: 0,
            totalTiles: 0,
            elapsedMs: 0,
            currentMessage: 'Ready',
          },
        };
        setBatchItems([newItem]);
        setActiveBatchItemId(newItem.id);
      } catch (err) {
        console.error('Failed to load file:', err);
        alert(t.errors.fileCorrupted);
      }
    } else {
      // Multi-file batch workflow
      const newBatchList: BatchItem[] = [...batchItems];
      let firstDecoded: { imageData: ImageData; metadata: ImageMetadata; url: string; file: File } | null = null;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        try {
          const { imageData, metadata } = await decodeImageFile(file);
          const url = URL.createObjectURL(file);
          const item: BatchItem = {
            id: `item-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 7)}`,
            file,
            previewUrl: url,
            metadata,
            settings: { ...settings },
            status: 'queued',
            progress: {
              stage: 'idle',
              percent: 0,
              completedTiles: 0,
              totalTiles: 0,
              elapsedMs: 0,
              currentMessage: 'Queued',
            },
          };
          newBatchList.push(item);
          if (!firstDecoded && !inputImageData) {
            firstDecoded = { imageData, metadata, url, file };
          }
        } catch (e) {
          console.warn(`Could not decode ${file.name}:`, e);
        }
      }

      setBatchItems(newBatchList);

      if (firstDecoded) {
        setCurrentFile(firstDecoded.file);
        setOriginalUrl(firstDecoded.url);
        setInputImageData(firstDecoded.imageData);
        setInputMetadata(firstDecoded.metadata);
        setActiveBatchItemId(newBatchList[0]?.id || null);
      }
    }
  }, [batchItems, inputImageData, originalUrl, processedResult, settings, t.errors.fileCorrupted, t.progress.idle]);

  // Load sample image
  const handleSampleSelected = async (samplePath: string, name: string) => {
    try {
      const response = await fetch(samplePath);
      const blob = await response.blob();
      const ext = samplePath.split('.').pop() || 'png';
      const file = new File([blob], `${name.toLowerCase().replace(/\s+/g, '-')}.${ext}`, {
        type: blob.type || (ext === 'jpg' ? 'image/jpeg' : 'image/png'),
      });
      await handleFilesSelected([file]);
    } catch (e) {
      console.error('Failed to load sample image:', e);
    }
  };

  // Start Upscaling active image
  const handleStartUpscale = async () => {
    if (!inputImageData || isProcessing) return;

    setIsProcessing(true);
    abortControllerRef.current = new AbortController();

    try {
      const result = await runSuperResolutionPipeline(
        inputImageData,
        settings,
        {
          onProgress: (prog) => {
            setProgress(prog);
            if (prog.activeProvider) {
              setActiveProvider(prog.activeProvider);
            }
          },
          abortSignal: abortControllerRef.current.signal,
        }
      );

      setProcessedResult(result);

      // Update in batch list if present
      if (activeBatchItemId) {
        setBatchItems((prev) =>
          prev.map((b) =>
            b.id === activeBatchItemId
              ? {
                  ...b,
                  status: 'completed',
                  result,
                  progress: {
                    stage: 'completed',
                    percent: 100,
                    completedTiles: 1,
                    totalTiles: 1,
                    elapsedMs: result.processingTimeMs,
                    currentMessage: 'Completed',
                  },
                }
              : b
          )
        );
      }
    } catch (err: unknown) {
      const error = err as Error;
      if (error?.name === 'AbortError') {
        setProgress({
          stage: 'cancelled',
          percent: 0,
          completedTiles: 0,
          totalTiles: 0,
          elapsedMs: 0,
          currentMessage: t.progress.cancelled,
        });
      } else {
        console.error('[MoUpscale Pipeline Error]:', err);
        setProgress({
          stage: 'error',
          percent: 0,
          completedTiles: 0,
          totalTiles: 0,
          elapsedMs: 0,
          currentMessage: error?.message || t.errors.generalFailed,
        });
      }
    } finally {
      setIsProcessing(false);
      abortControllerRef.current = null;
    }
  };

  // Cancel processing
  const handleCancelProcessing = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  // Single file download
  const handleDownloadSingle = () => {
    if (!processedResult || !inputMetadata) return;
    const baseName = inputMetadata.name.replace(/\.[^/.]+$/, '');
    const ext = processedResult.format === 'image/jpeg' ? 'jpg' : processedResult.format === 'image/webp' ? 'webp' : 'png';
    const scaleStr = `${processedResult.scaleApplied}x`;
    const filename = `${baseName}_moupscale_${scaleStr}.${ext}`;

    const link = document.createElement('a');
    link.href = processedResult.dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Batch download ZIP
  const handleDownloadBatchZip = async () => {
    try {
      const zipBlob = await packageBatchToZip(batchItems);
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `moupscale_batch_${Date.now()}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to create batch zip:', err);
      alert('Failed to package batch ZIP file.');
    }
  };

  // Process entire batch sequentially
  const handleProcessAllBatch = async () => {
    if (isProcessingBatch || batchItems.length === 0) return;

    setIsProcessingBatch(true);

    for (let i = 0; i < batchItems.length; i++) {
      const item = batchItems[i];
      if (item.status === 'completed') continue;

      // Select active item
      setActiveBatchItemId(item.id);
      setCurrentFile(item.file);
      setOriginalUrl(item.previewUrl);
      setInputMetadata(item.metadata);

      try {
        const { imageData } = await decodeImageFile(item.file);
        setInputImageData(imageData);

        // Mark item as processing
        setBatchItems((prev) =>
          prev.map((b) => (b.id === item.id ? { ...b, status: 'processing' } : b))
        );

        abortControllerRef.current = new AbortController();
        const result = await runSuperResolutionPipeline(
          imageData,
          item.settings,
          {
            onProgress: (prog) => {
              setProgress(prog);
              setBatchItems((prev) =>
                prev.map((b) => (b.id === item.id ? { ...b, progress: prog } : b))
              );
            },
            abortSignal: abortControllerRef.current.signal,
          }
        );

        setProcessedResult(result);
        setBatchItems((prev) =>
          prev.map((b) =>
            b.id === item.id
              ? {
                  ...b,
                  status: 'completed',
                  result,
                  progress: {
                    stage: 'completed',
                    percent: 100,
                    completedTiles: 1,
                    totalTiles: 1,
                    elapsedMs: result.processingTimeMs,
                    currentMessage: 'Completed',
                  },
                }
              : b
          )
        );
      } catch (e: unknown) {
        const error = e as Error;
        console.error(`Batch processing failed for ${item.metadata.name}:`, e);
        setBatchItems((prev) =>
          prev.map((b) =>
            b.id === item.id
              ? {
                  ...b,
                  status: 'error',
                  errorMessage: error?.message || 'Inference error',
                }
              : b
          )
        );
      }
    }

    setIsProcessingBatch(false);
  };

  // Select item from batch queue to view/edit in workspace
  const handleSelectBatchItem = async (id: string) => {
    const item = batchItems.find((b) => b.id === id);
    if (!item) return;

    setActiveBatchItemId(id);
    setCurrentFile(item.file);
    setOriginalUrl(item.previewUrl);
    setInputMetadata(item.metadata);
    setSettings(item.settings);
    setProcessedResult(item.result || null);

    try {
      const { imageData } = await decodeImageFile(item.file);
      setInputImageData(imageData);
    } catch {
      // ignore
    }
  };

  // Remove single item from queue
  const handleRemoveBatchItem = (id: string) => {
    setBatchItems((prev) => prev.filter((b) => b.id !== id));
    if (activeBatchItemId === id) {
      const remaining = batchItems.filter((b) => b.id !== id);
      if (remaining.length > 0) {
        handleSelectBatchItem(remaining[0].id);
      } else {
        handleClearAll();
      }
    }
  };

  // Clear completed batch items
  const handleClearCompleted = () => {
    setBatchItems((prev) => prev.filter((b) => b.status !== 'completed'));
  };

  // Clear everything
  const handleClearAll = () => {
    setCurrentFile(null);
    setInputImageData(null);
    setInputMetadata(null);
    setProcessedResult(null);
    setBatchItems([]);
    setActiveBatchItemId(null);
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    setOriginalUrl(null);
    setProgress({
      stage: 'idle',
      percent: 0,
      completedTiles: 0,
      totalTiles: 0,
      elapsedMs: 0,
      currentMessage: t.progress.idle,
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text transition-colors duration-200">
      {/* Top Header Navigation */}
      <Header
        t={t}
        language={language}
        onLanguageChange={setLanguage}
        isDark={isDark}
        onThemeToggle={toggleTheme}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenModal={setActiveModal}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* If no images uploaded yet, show Hero & Dropzone */}
        {!originalUrl ? (
          <div className="max-w-4xl mx-auto space-y-8 pt-4 pb-12">
            {/* Hero Title & Value Proposition */}
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-bold uppercase tracking-wider mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                Browser-Native Neural Super-Resolution
              </div>
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-light-text dark:text-dark-text leading-tight">
                Enlarge Images with{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-[#FFA742]">
                  Genuine AI Precision
                </span>
              </h1>
              <p className="max-w-2xl mx-auto text-sm sm:text-base text-light-text-secondary dark:text-dark-text-secondary leading-relaxed">
                {t.app.description}
              </p>
            </div>

            {/* DropZone */}
            <DropZone
              t={t}
              onFilesSelected={handleFilesSelected}
              onSampleSelected={handleSampleSelected}
            />
          </div>
        ) : (
          /* Main Workspace Layout */
          <div className="space-y-6 animate-fade-in">
            {/* Workspace action bar: Active image name, Replace, Clear, Switch to Batch */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl glass-panel">
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-xs font-bold text-light-text dark:text-dark-text truncate max-w-[200px] sm:max-w-xs">
                  {inputMetadata?.name}
                </span>
                {inputMetadata && (
                  <span className="text-[11px] font-semibold text-light-text-secondary dark:text-dark-text-secondary">
                    {inputMetadata.width} × {inputMetadata.height} px • {(inputMetadata.originalSize / 1024).toFixed(0)} KB
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {/* Batch switcher tab button */}
                {batchItems.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setActiveTab(activeTab === 'workspace' ? 'batch' : 'workspace')}
                    className="btn-secondary px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Layers className="w-3.5 h-3.5 text-primary" />
                    <span>Queue ({batchItems.length})</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleClearAll}
                  disabled={isProcessing}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-light-text-secondary dark:text-dark-text-secondary hover:text-red-500 transition-colors flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{t.upload.clearAll}</span>
                </button>
              </div>
            </div>

            {/* Active Batch View or Workspace Split View */}
            {activeTab === 'batch' && batchItems.length > 0 ? (
              <div className="space-y-6">
                <BatchQueueList
                  t={t}
                  items={batchItems}
                  activeItemId={activeBatchItemId}
                  onSelectItem={handleSelectBatchItem}
                  onRemoveItem={handleRemoveBatchItem}
                  onClearCompleted={handleClearCompleted}
                  onProcessAll={handleProcessAllBatch}
                  onRetryItem={handleStartUpscale}
                  onDownloadItem={(item) => {
                    if (item.result) {
                      const link = document.createElement('a');
                      link.href = item.result.dataUrl;
                      link.download = `${item.metadata.name}_moupscale.png`;
                      link.click();
                    }
                  }}
                  onDownloadZip={handleDownloadBatchZip}
                  isProcessingBatch={isProcessingBatch}
                />
              </div>
            ) : null}

            {/* Main Interactive Workspace Grid: Comparison viewer (left) and Settings panel (right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Comparison Viewer & Progress & Export info */}
              <div className="lg:col-span-8 space-y-6">
                {/* Comparison Viewer */}
                {inputMetadata && (
                  <ComparisonViewer
                    t={t}
                    originalUrl={originalUrl}
                    originalMetadata={inputMetadata}
                    processedResult={processedResult}
                    mode={comparisonMode}
                    onModeChange={setComparisonMode}
                  />
                )}

                {/* Real Progress indicator when processing */}
                {isProcessing && (
                  <ProgressIndicator
                    t={t}
                    progress={progress}
                    onCancel={handleCancelProcessing}
                  />
                )}

                {/* Export controls when completed */}
                {processedResult && inputMetadata && (
                  <ExportControls
                    t={t}
                    inputMetadata={inputMetadata}
                    processedResult={processedResult}
                    onDownloadSingle={handleDownloadSingle}
                    onDownloadBatchZip={handleDownloadBatchZip}
                    hasBatchItems={batchItems.length > 1}
                  />
                )}
              </div>

              {/* Right Column: Settings Panel */}
              <div className="lg:col-span-4 space-y-6">
                <SettingsPanel
                  t={t}
                  settings={settings}
                  onSettingsChange={setSettings}
                  inputMetadata={inputMetadata}
                  isProcessing={isProcessing}
                  onStartUpscale={handleStartUpscale}
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Global Modals for About, FAQ, Privacy, Terms, Credits */}
      <InfoModals
        t={t}
        activeModal={activeModal}
        onClose={() => setActiveModal(null)}
      />

      {/* Footer */}
      <Footer
        t={t}
        activeProvider={activeProvider}
        onOpenModal={setActiveModal}
      />
    </div>
  );
}

export default App;
