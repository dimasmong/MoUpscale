import React, { useState, useRef, useCallback } from 'react';
import { 
  Columns, 
  SplitSquareVertical, 
  Eye, 
  Sparkles, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw,
  Move
} from 'lucide-react';
import { ComparisonViewMode, ProcessedResult, TranslationDictionary, ImageMetadata } from '../../types';

interface ComparisonViewerProps {
  t: TranslationDictionary;
  originalUrl: string;
  originalMetadata: ImageMetadata;
  processedResult?: ProcessedResult | null;
  mode: ComparisonViewMode;
  onModeChange: (mode: ComparisonViewMode) => void;
}

export const ComparisonViewer: React.FC<ComparisonViewerProps> = ({
  t,
  originalUrl,
  originalMetadata,
  processedResult,
  mode,
  onModeChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Split slider position (0 to 100 percent)
  const [sliderPos, setSliderPos] = useState<number>(50);
  const [isDraggingSlider, setIsDraggingSlider] = useState<boolean>(false);

  // Zoom & Pan state
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Handle Split Slider Dragging
  const handleSliderMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(percent);
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    // If clicking on or near the slider handle
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const currentSliderPixel = (sliderPos / 100) * rect.width;
      const clickX = e.clientX - rect.left;

      if (Math.abs(clickX - currentSliderPixel) < 24) {
        setIsDraggingSlider(true);
        return;
      }
    }

    // Otherwise initiate pan
    setIsPanning(true);
    dragStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDraggingSlider) {
      handleSliderMove(e.clientX);
    } else if (isPanning) {
      setPan({
        x: e.clientX - dragStartRef.current.x,
        y: e.clientY - dragStartRef.current.y,
      });
    }
  };

  const handlePointerUp = () => {
    setIsDraggingSlider(false);
    setIsPanning(false);
  };

  // Wheel Zoom support
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomDelta = e.deltaY < 0 ? 0.15 : -0.15;
    setZoom((prev) => Math.max(0.5, Math.min(8, prev + zoomDelta)));
  };

  const handleZoomIn = () => setZoom((prev) => Math.min(8, prev + 0.25));
  const handleZoomOut = () => setZoom((prev) => Math.max(0.5, prev - 0.25));
  const handleResetZoomPan = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setSliderPos(50);
  };
  const handleActualPixels = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const hasResult = !!processedResult;
  const resultUrl = processedResult ? processedResult.dataUrl : originalUrl;

  return (
    <div className="w-full space-y-3">
      {/* Control bar: View Modes & Zoom controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2 rounded-xl glass-panel text-xs font-medium">
        {/* View Mode Buttons */}
        <div className="flex items-center space-x-1 bg-light-surface-subtle dark:bg-dark-surface-subtle p-1 rounded-lg border border-light-border dark:border-dark-border">
          <button
            onClick={() => onModeChange('split')}
            disabled={!hasResult}
            className={`px-2.5 py-1.5 rounded-md flex items-center gap-1.5 transition-colors ${
              mode === 'split' && hasResult
                ? 'bg-primary text-white shadow-sm'
                : 'text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text dark:hover:text-dark-text disabled:opacity-40'
            }`}
            title={t.comparison.split}
          >
            <SplitSquareVertical className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.comparison.split}</span>
          </button>
          <button
            onClick={() => onModeChange('side-by-side')}
            disabled={!hasResult}
            className={`px-2.5 py-1.5 rounded-md flex items-center gap-1.5 transition-colors ${
              mode === 'side-by-side' && hasResult
                ? 'bg-primary text-white shadow-sm'
                : 'text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text dark:hover:text-dark-text disabled:opacity-40'
            }`}
            title={t.comparison.sideBySide}
          >
            <Columns className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.comparison.sideBySide}</span>
          </button>
          <button
            onClick={() => onModeChange('original-only')}
            className={`px-2.5 py-1.5 rounded-md flex items-center gap-1.5 transition-colors ${
              mode === 'original-only'
                ? 'bg-primary text-white shadow-sm'
                : 'text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text dark:hover:text-dark-text'
            }`}
            title={t.comparison.originalOnly}
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.comparison.before}</span>
          </button>
          <button
            onClick={() => onModeChange('enhanced-only')}
            disabled={!hasResult}
            className={`px-2.5 py-1.5 rounded-md flex items-center gap-1.5 transition-colors ${
              mode === 'enhanced-only' && hasResult
                ? 'bg-primary text-white shadow-sm'
                : 'text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text dark:hover:text-dark-text disabled:opacity-40'
            }`}
            title={t.comparison.enhancedOnly}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.comparison.after}</span>
          </button>
        </div>

        {/* Zoom & Pan tools */}
        <div className="flex items-center space-x-1">
          <span className="text-[11px] font-semibold text-light-text-secondary dark:text-dark-text-secondary px-2">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            className="p-1.5 rounded-lg border border-light-border dark:border-dark-border hover:bg-light-surface-subtle dark:hover:bg-dark-surface-subtle text-light-text dark:text-dark-text transition-colors"
            title={t.comparison.zoomIn}
            aria-label={t.comparison.zoomIn}
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-1.5 rounded-lg border border-light-border dark:border-dark-border hover:bg-light-surface-subtle dark:hover:bg-dark-surface-subtle text-light-text dark:text-dark-text transition-colors"
            title={t.comparison.zoomOut}
            aria-label={t.comparison.zoomOut}
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleActualPixels}
            className="px-2 py-1 rounded-lg border border-light-border dark:border-dark-border hover:bg-light-surface-subtle dark:hover:bg-dark-surface-subtle text-light-text dark:text-dark-text text-[11px] font-semibold transition-colors"
            title={t.comparison.actualSize}
          >
            100%
          </button>
          <button
            onClick={handleResetZoomPan}
            className="p-1.5 rounded-lg border border-light-border dark:border-dark-border hover:bg-light-surface-subtle dark:hover:bg-dark-surface-subtle text-light-text dark:text-dark-text transition-colors"
            title={t.comparison.reset}
            aria-label={t.comparison.reset}
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Comparison Canvas / Viewport */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onWheel={handleWheel}
        className="relative w-full h-[380px] sm:h-[480px] lg:h-[560px] rounded-2xl overflow-hidden select-none border border-light-border dark:border-dark-border bg-gradient-to-b from-[#111622] to-[#0A0E17] flex items-center justify-center cursor-grab active:cursor-grabbing shadow-inner"
      >
        {/* Dimension and Mode badges at top corners */}
        <div className="absolute top-3 left-3 z-30 flex items-center gap-2 pointer-events-none">
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/20 shadow-md">
            Input: {originalMetadata.width} × {originalMetadata.height} px
          </span>
          {processedResult && (
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#FD8D14]/90 backdrop-blur-md text-white border border-white/20 shadow-md">
              AI: {processedResult.width} × {processedResult.height} px ({processedResult.scaleApplied}×)
            </span>
          )}
        </div>

        {/* Pan / Zoom transformed wrapper */}
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
            imageRendering: zoom > 1.5 ? 'pixelated' : 'auto',
          }}
          className="relative max-w-full max-h-full flex items-center justify-center transition-transform duration-75"
        >
          {/* Mode 1: Split Slider View */}
          {mode === 'split' && hasResult && (
            <div className="relative overflow-hidden inline-block shadow-2xl rounded-lg">
              {/* Enhanced image (base layer) */}
              <img
                src={resultUrl}
                alt="Enhanced preview"
                className="block max-h-[360px] sm:max-h-[460px] lg:max-h-[520px] w-auto max-w-none pointer-events-none"
              />

              {/* Original image (clipped top layer) */}
              <div
                style={{ width: `${sliderPos}%` }}
                className="absolute inset-y-0 left-0 overflow-hidden border-r-2 border-primary shadow-2xl"
              >
                <img
                  src={originalUrl}
                  alt="Original preview"
                  className="block max-h-[360px] sm:max-h-[460px] lg:max-h-[520px] w-auto max-w-none pointer-events-none"
                  style={{
                    // Align original image precisely with enhanced dimensions
                    width: 'auto',
                    height: '100%',
                  }}
                />
              </div>

              {/* Draggable Divider Handle */}
              <div
                style={{ left: `${sliderPos}%` }}
                className="absolute inset-y-0 -ml-4 w-8 flex items-center justify-center cursor-ew-resize z-20 pointer-events-auto"
              >
                <div className="w-7 h-7 rounded-full bg-primary text-white shadow-glow-primary border-2 border-white flex items-center justify-center transition-transform hover:scale-110">
                  <SplitSquareVertical className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          )}

          {/* Mode 2: Side-by-Side View */}
          {mode === 'side-by-side' && hasResult && (
            <div className="flex items-center gap-3 p-2">
              <div className="relative rounded-lg overflow-hidden border border-white/20 shadow-xl">
                <span className="absolute top-2 left-2 z-10 text-[10px] font-bold px-2 py-0.5 rounded bg-black/70 text-white">
                  {t.comparison.before}
                </span>
                <img
                  src={originalUrl}
                  alt="Original preview"
                  className="max-h-[340px] sm:max-h-[440px] lg:max-h-[500px] w-auto pointer-events-none"
                />
              </div>
              <div className="relative rounded-lg overflow-hidden border border-primary/50 shadow-xl">
                <span className="absolute top-2 left-2 z-10 text-[10px] font-bold px-2 py-0.5 rounded bg-primary text-white">
                  {t.comparison.after}
                </span>
                <img
                  src={resultUrl}
                  alt="Enhanced preview"
                  className="max-h-[340px] sm:max-h-[440px] lg:max-h-[500px] w-auto pointer-events-none"
                />
              </div>
            </div>
          )}

          {/* Mode 3: Original Only */}
          {(mode === 'original-only' || !hasResult) && (
            <div className="relative rounded-lg overflow-hidden shadow-2xl">
              <img
                src={originalUrl}
                alt="Original preview"
                className="max-h-[360px] sm:max-h-[460px] lg:max-h-[520px] w-auto pointer-events-none"
              />
            </div>
          )}

          {/* Mode 4: Enhanced Only */}
          {mode === 'enhanced-only' && hasResult && (
            <div className="relative rounded-lg overflow-hidden shadow-2xl">
              <img
                src={resultUrl}
                alt="Enhanced preview"
                className="max-h-[360px] sm:max-h-[460px] lg:max-h-[520px] w-auto pointer-events-none"
              />
            </div>
          )}
        </div>

        {/* Drag Hint at bottom */}
        <div className="absolute bottom-3 inset-x-0 flex justify-center pointer-events-none">
          <div className="text-[11px] font-medium text-white/70 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 flex items-center gap-1.5">
            <Move className="w-3 h-3 text-primary" />
            <span>{t.comparison.dragHint}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
