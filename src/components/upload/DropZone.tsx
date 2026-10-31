import React, { useRef, useState, useEffect, useCallback } from 'react';
import { UploadCloud, Image as ImageIcon, Sparkles, AlertCircle, FileCheck } from 'lucide-react';
import { TranslationDictionary } from '../../types';

interface DropZoneProps {
  t: TranslationDictionary;
  onFilesSelected: (files: File[]) => void;
  onSampleSelected: (samplePath: string, name: string) => void;
  disabled?: boolean;
}

const SAMPLE_LIST = [
  { id: 'photo', name: 'Landscape Photo', path: '/samples/sample-photo.jpg', badge: 'Photo' },
  { id: 'anime', name: 'Anime Illustration', path: '/samples/sample-anime.png', badge: 'Anime' },
  { id: 'graphic', name: 'Transparent Logo', path: '/samples/sample-graphic.png', badge: 'PNG' },
  { id: 'portrait', name: 'Face Portrait', path: '/samples/sample-portrait.jpg', badge: 'Portrait' },
];

export const DropZone: React.FC<DropZoneProps> = ({
  t,
  onFilesSelected,
  onSampleSelected,
  disabled = false,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndEmitFiles = useCallback((fileList: FileList | File[]) => {
    setErrorMessage(null);
    const validFiles: File[] = [];
    const validMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/bmp'];

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      if (validMimes.includes(file.type) || /\.(jpe?g|png|webp|avif|bmp)$/i.test(file.name)) {
        validFiles.push(file);
      } else {
        setErrorMessage(t.errors.invalidFileType);
      }
    }

    if (validFiles.length > 0) {
      onFilesSelected(validFiles);
    }
  }, [onFilesSelected, t.errors.invalidFileType]);

  // Handle Clipboard Paste (Ctrl+V / Cmd+V)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (disabled) return;
      const items = e.clipboardData?.items;
      if (!items) return;

      const pastedFiles: File[] = [];
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile();
          if (file) pastedFiles.push(file);
        }
      }

      if (pastedFiles.length > 0) {
        validateAndEmitFiles(pastedFiles);
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [disabled, validateAndEmitFiles]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndEmitFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndEmitFiles(e.target.files);
      // Reset input value to allow re-uploading the same file if needed
      e.target.value = '';
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Drop Target Box */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
        className={`relative w-full rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer p-8 sm:p-12 text-center flex flex-col items-center justify-center ${
          isDragOver
            ? 'border-primary bg-primary/5 scale-[1.01] shadow-glow-primary'
            : 'border-light-border dark:border-dark-border bg-light-surface/80 dark:bg-dark-surface/80 hover:border-primary/50 hover:bg-light-surface dark:hover:bg-dark-surface shadow-glass-light dark:shadow-glass-dark'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
        aria-label={t.upload.dragDropTitle}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/avif,image/bmp"
          multiple
          onChange={handleFileInputChange}
          className="hidden"
          disabled={disabled}
        />

        {/* Upload Icon with glow */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-[#FD8D14]/10 to-[#FD8D14]/20 border border-primary/20 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-200">
          <UploadCloud className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
        </div>

        {/* Primary title */}
        <h3 className="text-lg sm:text-xl font-bold text-light-text dark:text-dark-text tracking-tight mb-1">
          {t.upload.dragDropTitle}
        </h3>
        <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-4">
          {t.upload.dragDropSubtitle}
        </p>

        {/* Browse Button */}
        <button
          type="button"
          disabled={disabled}
          className="btn-primary px-6 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 mb-4"
        >
          <ImageIcon className="w-4 h-4" />
          {t.upload.browseButton}
        </button>

        {/* Hints */}
        <div className="flex flex-col sm:flex-row items-center gap-2 text-xs text-light-text-secondary dark:text-dark-text-secondary font-medium">
          <span className="flex items-center gap-1">
            <FileCheck className="w-3.5 h-3.5 text-emerald-500" />
            {t.upload.supportsFormats}
          </span>
          <span className="hidden sm:inline">•</span>
          <span>{t.upload.pasteHint}</span>
        </div>
      </div>

      {/* Error alert if validation fails */}
      {errorMessage && (
        <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 text-xs sm:text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Try with Sample Images Section */}
      <div className="pt-2">
        <div className="flex items-center gap-2 mb-2.5">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-xs font-semibold uppercase tracking-wider text-light-text-secondary dark:text-dark-text-secondary">
            {t.upload.sampleImages}
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {SAMPLE_LIST.map((sample) => (
            <button
              key={sample.id}
              type="button"
              disabled={disabled}
              onClick={() => onSampleSelected(sample.path, sample.name)}
              className="flex items-center gap-2.5 p-2 rounded-xl border border-light-border dark:border-dark-border bg-light-surface/60 dark:bg-dark-surface/60 hover:bg-light-surface dark:hover:bg-dark-surface hover:border-primary/40 transition-all text-left group"
            >
              <div className="w-10 h-10 rounded-lg overflow-hidden bg-light-surface-subtle dark:bg-dark-surface-subtle flex-shrink-0 border border-light-border dark:border-dark-border">
                <img
                  src={sample.path}
                  alt={sample.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
                />
              </div>
              <div className="min-w-0">
                <span className="block text-xs font-semibold text-light-text dark:text-dark-text truncate">
                  {sample.name}
                </span>
                <span className="inline-block text-[10px] font-medium text-primary bg-primary/10 px-1.5 py-0.2 rounded">
                  {sample.badge}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
