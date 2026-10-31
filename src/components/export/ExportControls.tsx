import React from 'react';
import { Download, Archive, CheckCircle, Info, Sparkles, Cpu, Clock } from 'lucide-react';
import { ProcessedResult, TranslationDictionary, ImageMetadata } from '../../types';

interface ExportControlsProps {
  t: TranslationDictionary;
  inputMetadata: ImageMetadata;
  processedResult: ProcessedResult;
  onDownloadSingle: () => void;
  onDownloadBatchZip?: () => void;
  hasBatchItems?: boolean;
}

export const ExportControls: React.FC<ExportControlsProps> = ({
  t,
  inputMetadata,
  processedResult,
  onDownloadSingle,
  onDownloadBatchZip,
  hasBatchItems = false,
}) => {
  const pixelIncrease = (
    (processedResult.width * processedResult.height) /
    Math.max(1, inputMetadata.width * inputMetadata.height)
  ).toFixed(1);

  const formattedInputSize = (inputMetadata.originalSize / 1024).toFixed(1);
  const formattedOutputSize = (processedResult.sizeBytes / 1024).toFixed(1);
  const durationSec = (processedResult.processingTimeMs / 1000).toFixed(2);

  return (
    <div className="glass-card rounded-2xl p-5 sm:p-6 space-y-5 animate-fade-in">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-light-border dark:border-dark-border pb-4">
        <div>
          <h3 className="text-base font-bold text-light-text dark:text-dark-text tracking-tight flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-500" />
            {t.progress.completed}
          </h3>
          <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-0.5">
            {processedResult.downsampledMethodDisclosed || `AI Super-resolution using ${processedResult.modelUsed}`}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {hasBatchItems && onDownloadBatchZip && (
            <button
              type="button"
              onClick={onDownloadBatchZip}
              className="btn-secondary px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5"
            >
              <Archive className="w-4 h-4 text-primary" />
              <span>{t.export.downloadAllZip}</span>
            </button>
          )}

          <button
            type="button"
            onClick={onDownloadSingle}
            className="btn-primary px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>{t.export.downloadSelected}</span>
          </button>
        </div>
      </div>

      {/* Real Image Information Panel Grid */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-light-text-secondary dark:text-dark-text-secondary flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-primary" />
          {t.export.fileInfo}
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          {/* Input Dimensions */}
          <div className="p-3 rounded-xl bg-light-surface-subtle dark:bg-dark-surface-subtle border border-light-border dark:border-dark-border">
            <span className="block text-[10px] text-light-text-secondary dark:text-dark-text-secondary uppercase">
              {t.export.originalDimensions}
            </span>
            <span className="font-bold text-light-text dark:text-dark-text mt-0.5 block">
              {inputMetadata.width} × {inputMetadata.height} px
            </span>
            <span className="text-[10px] text-light-text-secondary dark:text-dark-text-secondary">
              ({inputMetadata.megapixels} MP, {formattedInputSize} KB)
            </span>
          </div>

          {/* Output Dimensions */}
          <div className="p-3 rounded-xl bg-primary/5 border border-primary/20">
            <span className="block text-[10px] text-primary uppercase font-bold">
              {t.export.outputDimensions}
            </span>
            <span className="font-bold text-primary mt-0.5 block text-sm">
              {processedResult.width} × {processedResult.height} px
            </span>
            <span className="text-[10px] text-light-text-secondary dark:text-dark-text-secondary">
              ({((processedResult.width * processedResult.height) / 1000000).toFixed(2)} MP, {formattedOutputSize} KB)
            </span>
          </div>

          {/* Resolution Increase Factor */}
          <div className="p-3 rounded-xl bg-light-surface-subtle dark:bg-dark-surface-subtle border border-light-border dark:border-dark-border">
            <span className="block text-[10px] text-light-text-secondary dark:text-dark-text-secondary uppercase">
              {t.export.resolutionIncrease}
            </span>
            <span className="font-bold text-light-text dark:text-dark-text mt-0.5 block flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              {pixelIncrease}× Total Pixels
            </span>
            <span className="text-[10px] text-light-text-secondary dark:text-dark-text-secondary">
              Factor: {processedResult.scaleApplied}× scale
            </span>
          </div>

          {/* Engine & Duration */}
          <div className="p-3 rounded-xl bg-light-surface-subtle dark:bg-dark-surface-subtle border border-light-border dark:border-dark-border">
            <span className="block text-[10px] text-light-text-secondary dark:text-dark-text-secondary uppercase">
              {t.export.executionTime}
            </span>
            <span className="font-bold text-light-text dark:text-dark-text mt-0.5 block flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-primary" />
              {durationSec}s
            </span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <Cpu className="w-2.5 h-2.5" />
              {processedResult.executionProvider.toUpperCase()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
