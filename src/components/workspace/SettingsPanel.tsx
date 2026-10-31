import React, { useState } from 'react';
import { 
  Sliders, 
  Cpu, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  Lock, 
  Unlock, 
  RotateCcw,
  Layers,
  Image as ImageIcon
} from 'lucide-react';
import { 
  PresetType, 
  ScaleFactor, 
  OutputFormat, 
  UpscaleSettings, 
  TranslationDictionary, 
  ImageMetadata 
} from '../../types';
import { REGISTERED_MODELS } from '../../engine/models/modelRegistry';
import { getPresetSettings, DEFAULT_SETTINGS } from '../../utils/presets';

interface SettingsPanelProps {
  t: TranslationDictionary;
  settings: UpscaleSettings;
  onSettingsChange: (newSettings: UpscaleSettings) => void;
  inputMetadata?: ImageMetadata | null;
  isProcessing: boolean;
  onStartUpscale: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  t,
  settings,
  onSettingsChange,
  inputMetadata,
  isProcessing,
  onStartUpscale,
}) => {
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const handlePresetSelect = (preset: PresetType) => {
    const presetOverrides = getPresetSettings(preset);
    onSettingsChange({
      ...settings,
      ...presetOverrides,
      advanced: {
        ...settings.advanced,
        ...(presetOverrides.advanced || {}),
      },
    });
  };

  const handleScaleSelect = (factor: ScaleFactor) => {
    let customWidth = settings.customWidth;
    let customHeight = settings.customHeight;

    if (factor === 'custom' && inputMetadata) {
      customWidth = customWidth || inputMetadata.width * 2;
      customHeight = customHeight || inputMetadata.height * 2;
    }

    onSettingsChange({
      ...settings,
      scaleFactor: factor,
      customWidth,
      customHeight,
    });
  };

  const handleCustomDimensionChange = (key: 'width' | 'height', val: number) => {
    if (!inputMetadata || val <= 0) return;
    const isLock = settings.lockAspectRatio !== false;

    if (key === 'width') {
      const newHeight = isLock ? Math.round(val / inputMetadata.aspectRatio) : (settings.customHeight || inputMetadata.height);
      onSettingsChange({
        ...settings,
        customWidth: val,
        customHeight: newHeight,
      });
    } else {
      const newWidth = isLock ? Math.round(val * inputMetadata.aspectRatio) : (settings.customWidth || inputMetadata.width);
      onSettingsChange({
        ...settings,
        customWidth: newWidth,
        customHeight: val,
      });
    }
  };

  const handleAdvancedSlider = (key: keyof UpscaleSettings['advanced'], val: number | boolean) => {
    onSettingsChange({
      ...settings,
      advanced: {
        ...settings.advanced,
        [key]: val,
      },
    });
  };

  const resetAdvanced = () => {
    onSettingsChange({
      ...settings,
      advanced: { ...DEFAULT_SETTINGS.advanced },
    });
  };

  // Preset definitions with localized titles
  const PRESET_OPTIONS: { id: PresetType; label: string; desc: string }[] = [
    { id: 'standard', label: t.presets.standard, desc: t.presets.standardDesc },
    { id: 'photo', label: t.presets.photo, desc: t.presets.photoDesc },
    { id: 'portrait', label: t.presets.portrait, desc: t.presets.portraitDesc },
    { id: 'anime', label: t.presets.anime, desc: t.presets.animeDesc },
    { id: 'digital-art', label: t.presets.digitalArt, desc: t.presets.digitalArtDesc },
    { id: 'fast', label: t.presets.fast, desc: t.presets.fastDesc },
    { id: 'high-quality', label: t.presets.highQuality, desc: t.presets.highQualityDesc },
  ];

  // Calculated projected output dimensions
  let projectedWidth = 0;
  let projectedHeight = 0;
  if (inputMetadata) {
    if (settings.scaleFactor === 'custom' && settings.customWidth && settings.customHeight) {
      projectedWidth = settings.customWidth;
      projectedHeight = settings.customHeight;
    } else if (typeof settings.scaleFactor === 'number') {
      projectedWidth = Math.round(inputMetadata.width * settings.scaleFactor);
      projectedHeight = Math.round(inputMetadata.height * settings.scaleFactor);
    }
  }

  return (
    <div className="glass-card rounded-2xl p-5 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-light-border dark:border-dark-border pb-3">
        <div className="flex items-center gap-2">
          <Sliders className="w-5 h-5 text-primary" />
          <h2 className="text-base font-bold text-light-text dark:text-dark-text tracking-tight">
            {t.settings.title}
          </h2>
        </div>
        {inputMetadata && (
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
            {projectedWidth} × {projectedHeight} px
          </span>
        )}
      </div>

      {/* 1. Preset Selector */}
      <div className="space-y-2">
        <label className="block text-xs font-bold uppercase tracking-wider text-light-text-secondary dark:text-dark-text-secondary">
          {t.settings.preset}
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {PRESET_OPTIONS.map((p) => (
            <button
              key={p.id}
              type="button"
              disabled={isProcessing}
              onClick={() => handlePresetSelect(p.id)}
              className={`p-2.5 rounded-xl text-left border transition-all ${
                settings.preset === p.id
                  ? 'border-primary bg-primary/10 text-primary shadow-sm ring-1 ring-primary/40'
                  : 'border-light-border dark:border-dark-border bg-light-surface-subtle dark:bg-dark-surface-subtle text-light-text dark:text-dark-text hover:border-primary/40'
              }`}
            >
              <span className="block text-xs font-bold leading-tight truncate">
                {p.label}
              </span>
              <span className="block text-[10px] text-light-text-secondary dark:text-dark-text-secondary line-clamp-1 mt-0.5">
                {p.desc}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Scale Factor Selection */}
      <div className="space-y-2">
        <label className="block text-xs font-bold uppercase tracking-wider text-light-text-secondary dark:text-dark-text-secondary">
          {t.settings.scale}
        </label>
        <div className="grid grid-cols-4 gap-2">
          {[2, 4, 8, 'custom'].map((factor) => (
            <button
              key={String(factor)}
              type="button"
              disabled={isProcessing}
              onClick={() => handleScaleSelect(factor as ScaleFactor)}
              className={`py-2 rounded-xl text-xs font-bold border transition-all text-center ${
                settings.scaleFactor === factor
                  ? 'border-primary bg-primary text-white shadow-md shadow-primary/25'
                  : 'border-light-border dark:border-dark-border bg-light-surface-subtle dark:bg-dark-surface-subtle text-light-text dark:text-dark-text hover:border-primary/40'
              }`}
            >
              {factor === 'custom' ? 'Custom' : `${factor}×`}
            </button>
          ))}
        </div>

        {/* Informational notices for scale factors */}
        {settings.scaleFactor === 2 && settings.modelId === 'realesr-general-x4v3' && (
          <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
            ℹ 4× neural inference followed by high-precision Lanczos downsampling.
          </p>
        )}
        {settings.scaleFactor === 8 && (
          <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
            ⚠ 8× requires high memory and multi-pass inference.
          </p>
        )}

        {/* Custom Dimensions Input Box */}
        {settings.scaleFactor === 'custom' && (
          <div className="p-3.5 rounded-xl bg-light-surface-subtle dark:bg-dark-surface-subtle border border-light-border dark:border-dark-border space-y-3 mt-2">
            <div className="flex items-center justify-between text-xs font-semibold text-light-text dark:text-dark-text">
              <span>{t.settings.customDimensions}</span>
              <button
                type="button"
                onClick={() =>
                  onSettingsChange({
                    ...settings,
                    lockAspectRatio: settings.lockAspectRatio === false ? true : false,
                  })
                }
                className="flex items-center gap-1 text-[11px] text-primary hover:underline"
              >
                {settings.lockAspectRatio !== false ? (
                  <>
                    <Lock className="w-3 h-3" /> {t.settings.lockAspect}
                  </>
                ) : (
                  <>
                    <Unlock className="w-3 h-3" /> Aspect free
                  </>
                )}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-light-text-secondary dark:text-dark-text-secondary uppercase">
                  {t.settings.width}
                </label>
                <input
                  type="number"
                  min="32"
                  max="16384"
                  value={settings.customWidth || ''}
                  onChange={(e) => handleCustomDimensionChange('width', parseInt(e.target.value, 10))}
                  className="w-full glass-input px-2.5 py-1.5 rounded-lg text-xs font-semibold mt-1"
                />
              </div>
              <div>
                <label className="text-[10px] text-light-text-secondary dark:text-dark-text-secondary uppercase">
                  {t.settings.height}
                </label>
                <input
                  type="number"
                  min="32"
                  max="16384"
                  value={settings.customHeight || ''}
                  onChange={(e) => handleCustomDimensionChange('height', parseInt(e.target.value, 10))}
                  className="w-full glass-input px-2.5 py-1.5 rounded-lg text-xs font-semibold mt-1"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. Model Selector */}
      <div className="space-y-2">
        <label className="block text-xs font-bold uppercase tracking-wider text-light-text-secondary dark:text-dark-text-secondary flex items-center gap-1.5">
          <Cpu className="w-3.5 h-3.5 text-primary" />
          {t.settings.model}
        </label>
        <select
          value={settings.modelId}
          disabled={isProcessing}
          onChange={(e) => onSettingsChange({ ...settings, modelId: e.target.value })}
          className="w-full glass-input px-3 py-2 rounded-xl text-xs font-medium"
        >
          {REGISTERED_MODELS.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name} ({m.scale}×, {m.sizeFormatted}) — {m.architecture}
            </option>
          ))}
        </select>
      </div>

      {/* 4. Tile Size and Output Format in 2 cols */}
      <div className="grid grid-cols-2 gap-3">
        {/* Tile Size */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-light-text-secondary dark:text-dark-text-secondary mb-1.5 flex items-center gap-1">
            <Layers className="w-3 h-3 text-primary" />
            {t.settings.tileSize}
          </label>
          <select
            value={settings.tileSize}
            disabled={isProcessing}
            onChange={(e) => onSettingsChange({ ...settings, tileSize: parseInt(e.target.value, 10) })}
            className="w-full glass-input px-2.5 py-2 rounded-xl text-xs font-medium"
          >
            <option value="0">{t.settings.autoTile}</option>
            <option value="128">128 px (Light)</option>
            <option value="192">192 px (Mobile)</option>
            <option value="256">256 px (Standard)</option>
            <option value="384">384 px (Balanced)</option>
            <option value="512">512 px (Heavy GPU)</option>
          </select>
        </div>

        {/* Output Format */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-light-text-secondary dark:text-dark-text-secondary mb-1.5 flex items-center gap-1">
            <ImageIcon className="w-3 h-3 text-primary" />
            {t.settings.outputFormat}
          </label>
          <select
            value={settings.outputFormat}
            disabled={isProcessing}
            onChange={(e) => onSettingsChange({ ...settings, outputFormat: e.target.value as OutputFormat })}
            className="w-full glass-input px-2.5 py-2 rounded-xl text-xs font-medium"
          >
            <option value="image/png">PNG (Lossless)</option>
            <option value="image/jpeg">JPEG (Compressed)</option>
            <option value="image/webp">WebP (Modern)</option>
          </select>
        </div>
      </div>

      {/* Quality Slider for JPEG / WebP */}
      {settings.outputFormat !== 'image/png' && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-semibold text-light-text dark:text-dark-text">
            <span>{t.settings.quality}</span>
            <span>{Math.round(settings.quality * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.4"
            max="1.0"
            step="0.05"
            value={settings.quality}
            disabled={isProcessing}
            onChange={(e) => onSettingsChange({ ...settings, quality: parseFloat(e.target.value) })}
            className="w-full accent-primary cursor-pointer"
          />
        </div>
      )}

      {/* 5. Advanced Enhancements Collapsible */}
      <div className="border-t border-light-border dark:border-dark-border pt-3">
        <button
          type="button"
          onClick={() => setAdvancedOpen(!advancedOpen)}
          className="w-full flex items-center justify-between text-xs font-bold text-light-text dark:text-dark-text hover:text-primary transition-colors py-1"
        >
          <span className="flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-primary" />
            {t.settings.advancedTitle}
          </span>
          {advancedOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {advancedOpen && (
          <div className="pt-3 space-y-3.5 animate-fade-in text-xs">
            {/* Denoise */}
            <div>
              <div className="flex justify-between text-light-text dark:text-dark-text font-medium mb-1">
                <span>{t.settings.denoise}</span>
                <span>{settings.advanced.denoise}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={settings.advanced.denoise}
                onChange={(e) => handleAdvancedSlider('denoise', parseInt(e.target.value, 10))}
                className="w-full accent-primary"
              />
            </div>

            {/* Sharpen */}
            <div>
              <div className="flex justify-between text-light-text dark:text-dark-text font-medium mb-1">
                <span>{t.settings.sharpen}</span>
                <span>{settings.advanced.sharpen}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={settings.advanced.sharpen}
                onChange={(e) => handleAdvancedSlider('sharpen', parseInt(e.target.value, 10))}
                className="w-full accent-primary"
              />
            </div>

            {/* JPEG Artifacts */}
            <div>
              <div className="flex justify-between text-light-text dark:text-dark-text font-medium mb-1">
                <span>{t.settings.jpegArtifacts}</span>
                <span>{settings.advanced.jpegArtifacts}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={settings.advanced.jpegArtifacts}
                onChange={(e) => handleAdvancedSlider('jpegArtifacts', parseInt(e.target.value, 10))}
                className="w-full accent-primary"
              />
            </div>

            {/* Micro-detail */}
            <div>
              <div className="flex justify-between text-light-text dark:text-dark-text font-medium mb-1">
                <span>{t.settings.detailEnhance}</span>
                <span>{settings.advanced.detailEnhance}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={settings.advanced.detailEnhance}
                onChange={(e) => handleAdvancedSlider('detailEnhance', parseInt(e.target.value, 10))}
                className="w-full accent-primary"
              />
            </div>

            {/* Edge preservation */}
            <div>
              <div className="flex justify-between text-light-text dark:text-dark-text font-medium mb-1">
                <span>{t.settings.edgePreserve}</span>
                <span>{settings.advanced.edgePreserve}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={settings.advanced.edgePreserve}
                onChange={(e) => handleAdvancedSlider('edgePreserve', parseInt(e.target.value, 10))}
                className="w-full accent-primary"
              />
            </div>

            {/* Color Vibrance */}
            <div>
              <div className="flex justify-between text-light-text dark:text-dark-text font-medium mb-1">
                <span>{t.settings.colorPreserve}</span>
                <span>{settings.advanced.colorPreserve}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={settings.advanced.colorPreserve}
                onChange={(e) => handleAdvancedSlider('colorPreserve', parseInt(e.target.value, 10))}
                className="w-full accent-primary"
              />
            </div>

            {/* Preserve Alpha */}
            <div className="flex items-center justify-between pt-1">
              <span className="font-medium text-light-text dark:text-dark-text">
                {t.settings.preserveAlpha}
              </span>
              <input
                type="checkbox"
                checked={settings.advanced.preserveAlpha}
                onChange={(e) => handleAdvancedSlider('preserveAlpha', e.target.checked)}
                className="w-4 h-4 accent-primary rounded cursor-pointer"
              />
            </div>

            {/* Reset button */}
            <button
              type="button"
              onClick={resetAdvanced}
              className="w-full py-1.5 rounded-lg border border-light-border dark:border-dark-border text-xs font-semibold text-light-text-secondary dark:text-dark-text-secondary hover:text-primary transition-colors flex items-center justify-center gap-1.5 mt-2"
            >
              <RotateCcw className="w-3 h-3" />
              {t.settings.resetDefaults}
            </button>
          </div>
        )}
      </div>

      {/* 6. Main Action Button: Upscale */}
      <button
        type="button"
        disabled={isProcessing || !inputMetadata}
        onClick={onStartUpscale}
        className="btn-primary w-full py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
      >
        <Sparkles className="w-4 h-4" />
        <span>{isProcessing ? t.progress.processingTiles : 'Start AI Upscaling'}</span>
      </button>
    </div>
  );
};
