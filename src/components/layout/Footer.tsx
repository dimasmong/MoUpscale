import React from 'react';
import { Cpu, ShieldCheck, Heart } from 'lucide-react';
import { ExecutionProvider, TranslationDictionary } from '../../types';

interface FooterProps {
  t: TranslationDictionary;
  activeProvider: ExecutionProvider;
  onOpenModal: (modal: 'about' | 'faq' | 'privacy' | 'terms' | 'credits') => void;
}

export const Footer: React.FC<FooterProps> = ({
  t,
  activeProvider,
  onOpenModal,
}) => {
  return (
    <footer className="w-full border-t border-light-border dark:border-dark-border py-8 mt-16 glass-panel transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-light-text-secondary dark:text-dark-text-secondary">
          {/* Left: Copyright & License */}
          <div className="flex flex-col sm:flex-row items-center gap-2 text-center sm:text-left">
            <span>© 2026 Dimas Mong.</span>
            <span className="hidden sm:inline">•</span>
            <span>MIT License.</span>
            <span className="hidden sm:inline">•</span>
            <span className="flex items-center gap-1">
              Crafted with <Heart className="w-3.5 h-3.5 text-primary fill-primary" /> for professional fidelity
            </span>
          </div>

          {/* Center: Hardware Provider Badge */}
          <div className="flex items-center gap-2 bg-light-surface-subtle dark:bg-dark-surface-subtle px-3 py-1.5 rounded-full border border-light-border dark:border-dark-border">
            <Cpu className="w-3.5 h-3.5 text-primary" />
            <span className="font-medium">
              Engine Provider:{' '}
              <strong className="text-light-text dark:text-dark-text uppercase tracking-wider">
                {activeProvider === 'webgpu' ? 'WebGPU (Hardware Accelerated)' : 'WASM (Multi-threaded SIMD)'}
              </strong>
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>

          {/* Right: Policy Links */}
          <div className="flex flex-wrap justify-center gap-4 font-medium">
            <button
              onClick={() => onOpenModal('privacy')}
              className="hover:text-primary transition-colors flex items-center gap-1"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              {t.nav.privacy}
            </button>
            <button
              onClick={() => onOpenModal('terms')}
              className="hover:text-primary transition-colors"
            >
              {t.nav.terms}
            </button>
            <button
              onClick={() => onOpenModal('faq')}
              className="hover:text-primary transition-colors"
            >
              {t.nav.faq}
            </button>
            <button
              onClick={() => onOpenModal('credits')}
              className="hover:text-primary transition-colors"
            >
              {t.nav.credits}
            </button>
          </div>
        </div>

        {/* Client-side guarantee note */}
        <div className="mt-4 pt-4 border-t border-light-border/60 dark:border-dark-border/60 text-center text-[11px] text-light-text-secondary/80 dark:text-dark-text-secondary/80">
          MoUpscale executes machine learning super-resolution strictly within your browser via ONNX Runtime Web.
          Zero images or personal telemetry are uploaded to external servers.
        </div>
      </div>
    </footer>
  );
};
