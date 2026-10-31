import React from 'react';
import { Loader2, XCircle, Cpu, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { ProcessingProgress, TranslationDictionary } from '../../types';

interface ProgressIndicatorProps {
  t: TranslationDictionary;
  progress: ProcessingProgress;
  onCancel: () => void;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  t,
  progress,
  onCancel,
}) => {
  const isCompleted = progress.stage === 'completed';
  const isError = progress.stage === 'error';
  const isCancelled = progress.stage === 'cancelled';

  // Format elapsed seconds
  const elapsedSec = (progress.elapsedMs / 1000).toFixed(1);
  const remainingSec = progress.estimatedRemainingMs ? (progress.estimatedRemainingMs / 1000).toFixed(1) : null;

  return (
    <div className="glass-card rounded-2xl p-5 border border-primary/30 shadow-glow-primary animate-fade-in space-y-3.5">
      {/* Top Header: Stage title & Hardware badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isCompleted ? (
            <CheckCircle className="w-5 h-5 text-emerald-500" />
          ) : isError ? (
            <AlertTriangle className="w-5 h-5 text-red-500" />
          ) : isCancelled ? (
            <XCircle className="w-5 h-5 text-amber-500" />
          ) : (
            <Loader2 className="w-5 h-5 text-primary animate-spin" />
          )}

          <div>
            <h4 className="text-sm font-bold text-light-text dark:text-dark-text tracking-tight">
              {progress.currentMessage}
            </h4>
            <p className="text-[11px] text-light-text-secondary dark:text-dark-text-secondary uppercase tracking-wider font-semibold">
              Stage: {progress.stage.replace('_', ' ')}
            </p>
          </div>
        </div>

        {/* Execution Provider Badge */}
        {progress.activeProvider && (
          <span className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
            <Cpu className="w-3 h-3" />
            {progress.activeProvider.toUpperCase()}
          </span>
        )}
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-light-surface-subtle dark:bg-dark-surface-subtle rounded-full h-2.5 overflow-hidden border border-light-border dark:border-dark-border p-0.5">
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            isCompleted
              ? 'bg-emerald-500'
              : isError
              ? 'bg-red-500'
              : isCancelled
              ? 'bg-amber-500'
              : 'bg-gradient-to-r from-primary to-[#FFA742]'
          }`}
          style={{ width: `${Math.max(3, progress.percent)}%` }}
        />
      </div>

      {/* Stats Row: Percentage, Tiles, Elapsed & Remaining, Cancel Button */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-light-text-secondary dark:text-dark-text-secondary font-medium pt-1">
        {/* Left: Tile and Percent */}
        <div className="flex items-center gap-3">
          <span className="font-bold text-light-text dark:text-dark-text">
            {progress.percent}%
          </span>
          {progress.totalTiles > 0 && (
            <span>
              Tiles: <strong>{progress.completedTiles}</strong> / {progress.totalTiles}
            </span>
          )}
        </div>

        {/* Center: Time stats */}
        <div className="flex items-center gap-2 text-[11px]">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {elapsedSec}s
          </span>
          {remainingSec && !isCompleted && (
            <span>• est. ~{remainingSec}s remaining</span>
          )}
        </div>

        {/* Right: Cancel button */}
        {!isCompleted && !isError && !isCancelled && (
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1 rounded-lg border border-red-300 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 text-xs font-semibold transition-colors flex items-center gap-1"
          >
            <XCircle className="w-3.5 h-3.5" />
            {t.progress.cancelBtn}
          </button>
        )}
      </div>
    </div>
  );
};
