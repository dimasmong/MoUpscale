import React from 'react';
import { 
  Layers, 
  Play, 
  RotateCcw, 
  Download, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  X,
  Archive,
  Image as ImageIcon
} from 'lucide-react';
import { BatchItem, TranslationDictionary } from '../../types';

interface BatchQueueListProps {
  t: TranslationDictionary;
  items: BatchItem[];
  activeItemId: string | null;
  onSelectItem: (id: string) => void;
  onRemoveItem: (id: string) => void;
  onClearCompleted: () => void;
  onProcessAll: () => void;
  onRetryItem: (id: string) => void;
  onDownloadItem: (item: BatchItem) => void;
  onDownloadZip: () => void;
  isProcessingBatch: boolean;
}

export const BatchQueueList: React.FC<BatchQueueListProps> = ({
  t,
  items,
  activeItemId,
  onSelectItem,
  onRemoveItem,
  onClearCompleted,
  onProcessAll,
  onRetryItem,
  onDownloadItem,
  onDownloadZip,
  isProcessingBatch,
}) => {
  const completedCount = items.filter((i) => i.status === 'completed').length;
  const queuedCount = items.filter((i) => i.status === 'queued').length;

  return (
    <div className="glass-card rounded-2xl p-5 space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-light-border dark:border-dark-border pb-3">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-primary" />
          <h3 className="text-base font-bold text-light-text dark:text-dark-text tracking-tight">
            {t.batch.title}
          </h3>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-light-surface-subtle dark:bg-dark-surface-subtle border border-light-border dark:border-dark-border text-light-text-secondary dark:text-dark-text-secondary">
            {items.length} images
          </span>
        </div>

        {/* Global actions */}
        <div className="flex flex-wrap items-center gap-2">
          {completedCount > 0 && (
            <>
              <button
                type="button"
                onClick={onDownloadZip}
                className="btn-secondary px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 text-primary"
              >
                <Archive className="w-3.5 h-3.5" />
                {t.export.downloadAllZip} ({completedCount})
              </button>
              <button
                type="button"
                onClick={onClearCompleted}
                className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-light-text-secondary dark:text-dark-text-secondary hover:text-red-500 transition-colors"
              >
                {t.batch.clearCompleted}
              </button>
            </>
          )}

          <button
            type="button"
            disabled={isProcessingBatch || queuedCount === 0}
            onClick={onProcessAll}
            className="btn-primary px-4 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>{isProcessingBatch ? t.batch.statusProcessing : t.batch.processAll}</span>
          </button>
        </div>
      </div>

      {/* Queue items list */}
      {items.length === 0 ? (
        <div className="text-center py-8 text-light-text-secondary dark:text-dark-text-secondary text-xs">
          <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-40 text-primary" />
          <p>No images in queue. Drop or select images above to start batch upscaling.</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
          {items.map((item) => {
            const isSelected = item.id === activeItemId;
            return (
              <div
                key={item.id}
                onClick={() => onSelectItem(item.id)}
                className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                  isSelected
                    ? 'border-primary bg-primary/5 shadow-sm ring-1 ring-primary/30'
                    : 'border-light-border dark:border-dark-border bg-light-surface/60 dark:bg-dark-surface/60 hover:bg-light-surface dark:hover:bg-dark-surface'
                }`}
              >
                {/* Left thumbnail & metadata */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-light-surface-subtle dark:bg-dark-surface-subtle border border-light-border dark:border-dark-border flex-shrink-0">
                    <img
                      src={item.previewUrl}
                      alt={item.metadata.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="min-w-0">
                    <span className="block text-xs font-bold text-light-text dark:text-dark-text truncate">
                      {item.metadata.name}
                    </span>
                    <span className="block text-[11px] text-light-text-secondary dark:text-dark-text-secondary">
                      {item.metadata.width} × {item.metadata.height} px • {(item.metadata.originalSize / 1024).toFixed(0)} KB
                    </span>
                  </div>
                </div>

                {/* Right status & actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* Status Badge */}
                  {item.status === 'completed' && (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/40">
                      <CheckCircle className="w-3 h-3" />
                      {t.batch.statusCompleted}
                    </span>
                  )}
                  {item.status === 'processing' && (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                      <Clock className="w-3 h-3 animate-spin" />
                      {item.progress.percent}%
                    </span>
                  )}
                  {item.status === 'queued' && (
                    <span className="text-[11px] font-medium text-light-text-secondary dark:text-dark-text-secondary bg-light-surface-subtle dark:bg-dark-surface-subtle px-2 py-0.5 rounded-full">
                      {t.batch.statusQueued}
                    </span>
                  )}
                  {item.status === 'error' && (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded-full">
                      <AlertTriangle className="w-3 h-3" />
                      {t.batch.statusError}
                    </span>
                  )}

                  {/* Individual Download if completed */}
                  {item.status === 'completed' && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDownloadItem(item);
                      }}
                      className="p-1.5 rounded-lg border border-light-border dark:border-dark-border hover:text-primary transition-colors"
                      title="Download"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* Retry if error */}
                  {item.status === 'error' && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRetryItem(item.id);
                      }}
                      className="p-1.5 rounded-lg border border-light-border dark:border-dark-border hover:text-primary transition-colors"
                      title="Retry"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveItem(item.id);
                    }}
                    className="p-1.5 rounded-lg text-light-text-secondary dark:text-dark-text-secondary hover:text-red-500 transition-colors"
                    title="Remove"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
