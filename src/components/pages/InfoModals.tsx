import React from 'react';
import { X, ShieldCheck, HelpCircle, Award, FileText, Info } from 'lucide-react';
import { TranslationDictionary } from '../../types';

export type ModalType = 'about' | 'faq' | 'privacy' | 'terms' | 'credits' | null;

interface InfoModalsProps {
  t: TranslationDictionary;
  activeModal: ModalType;
  onClose: () => void;
}

export const InfoModals: React.FC<InfoModalsProps> = ({
  t,
  activeModal,
  onClose,
}) => {
  if (!activeModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="glass-card w-full max-w-2xl max-h-[85vh] rounded-2xl overflow-hidden flex flex-col shadow-2xl border border-light-border dark:border-dark-border"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-light-border dark:border-dark-border">
          <div className="flex items-center gap-2">
            {activeModal === 'about' && <Info className="w-5 h-5 text-primary" />}
            {activeModal === 'faq' && <HelpCircle className="w-5 h-5 text-primary" />}
            {activeModal === 'privacy' && <ShieldCheck className="w-5 h-5 text-primary" />}
            {activeModal === 'terms' && <FileText className="w-5 h-5 text-primary" />}
            {activeModal === 'credits' && <Award className="w-5 h-5 text-primary" />}

            <h3 className="text-base font-bold text-light-text dark:text-dark-text tracking-tight">
              {activeModal === 'about' && t.modals.aboutTitle}
              {activeModal === 'faq' && t.modals.faqTitle}
              {activeModal === 'privacy' && t.modals.privacyTitle}
              {activeModal === 'terms' && t.modals.termsTitle}
              {activeModal === 'credits' && t.modals.creditsTitle}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text dark:hover:text-dark-text hover:bg-light-surface-subtle dark:hover:bg-dark-surface-subtle transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content Scroll Area */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm text-light-text-secondary dark:text-dark-text-secondary leading-relaxed">
          {activeModal === 'about' && (
            <div className="space-y-3">
              <p>
                <strong className="text-light-text dark:text-dark-text">MoUpscale</strong> is a dedicated AI-powered image upscaling and enhancement web application engineered to enlarge images while improving perceived details, reducing compression artifacts, and producing authentic high-resolution outputs.
              </p>
              <h4 className="text-sm font-bold text-light-text dark:text-dark-text pt-2">
                Core Engineering Philosophy
              </h4>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Browser-First Inference:</strong> All neural networks execute strictly within your client environment via ONNX Runtime Web.</li>
                <li><strong>Hardware Acceleration:</strong> Automatically leverages WebGPU when supported, with graceful fallback to multi-threaded SIMD WebAssembly.</li>
                <li><strong>Smart Tiling Engine:</strong> Large images are split into overlapping tiles with cosine-feathered blending, eliminating tile boundary seams and avoiding browser memory crashes.</li>
                <li><strong>Honest AI:</strong> No simulated loading spinners, no fake progress bars, and no ordinary bicubic interpolations disguised as super-resolution.</li>
              </ul>
              <div className="pt-2 text-[11px]">
                Copyright © 2026 Dimas Mong. Licensed under the MIT License.
              </div>
            </div>
          )}

          {activeModal === 'faq' && (
            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-light-text dark:text-dark-text">
                  How does browser-based AI upscaling work?
                </h4>
                <p className="mt-1">
                  MoUpscale loads pre-trained neural network models directly into your browser using ONNX Runtime Web. Your local GPU (via WebGPU) or CPU (via WebAssembly) performs the tensor calculations locally.
                </p>
              </div>
              <div>
                <h4 className="font-bold text-light-text dark:text-dark-text">
                  Are my uploaded images sent to any server?
                </h4>
                <p className="mt-1">
                  No. 100% of the image decoding, tile extraction, neural inference, and encoding happen inside your browser. Your images never leave your computer or phone.
                </p>
              </div>
              <div>
                <h4 className="font-bold text-light-text dark:text-dark-text">
                  What is the difference between 2× and 4× models?
                </h4>
                <p className="mt-1">
                  Our 4× models (Real-ESRGAN General and AnimeVideo v3) enlarge each dimension by a factor of 4. When 2× is selected, you can use our native 2× compact model or choose 4× inference with high-precision downsampling for maximum sharpness.
                </p>
              </div>
              <div>
                <h4 className="font-bold text-light-text dark:text-dark-text">
                  Why does high resolution take time on mobile devices?
                </h4>
                <p className="mt-1">
                  Neural network super-resolution involves millions of convolutional operations. On mobile devices without WebGPU, the multi-threaded WASM CPU fallback processes tiles sequentially to conserve system memory and prevent tab crashes.
                </p>
              </div>
            </div>
          )}

          {activeModal === 'privacy' && (
            <div className="space-y-3">
              <p>
                <strong>Privacy by Design:</strong> MoUpscale is built from the ground up with a client-side architecture to guarantee complete image confidentiality.
              </p>
              <h4 className="font-bold text-light-text dark:text-dark-text pt-1">
                Data Handling Practices
              </h4>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>No Image Uploads:</strong> Your images are processed exclusively in your device's memory. No image payloads are transmitted over the internet.</li>
                <li><strong>No Server-Side Logging:</strong> We do not log filenames, image metadata, or output contents.</li>
                <li><strong>No Tracking Cookies:</strong> Only user preferences (such as your chosen theme and language) are stored locally in your browser's <code className="px-1 py-0.5 rounded bg-light-surface-subtle dark:bg-dark-surface-subtle">localStorage</code>.</li>
                <li><strong>Model Caching:</strong> AI model weights are cached in your browser's Cache API to avoid re-downloading them on subsequent visits.</li>
              </ul>
            </div>
          )}

          {activeModal === 'terms' && (
            <div className="space-y-3">
              <h4 className="font-bold text-light-text dark:text-dark-text">
                Terms of Use
              </h4>
              <p>
                MoUpscale is provided under the open-source MIT License. You are free to use this application for personal and commercial image upscaling projects.
              </p>
              <p>
                The software is provided &quot;as is&quot;, without warranty of any kind, express or implied. Users retain full ownership and copyright of any images processed through the application.
              </p>
            </div>
          )}

          {activeModal === 'credits' && (
            <div className="space-y-3">
              <p>
                MoUpscale is made possible thanks to pioneering research and open-source contributions in deep learning and web standards:
              </p>
              <div className="space-y-2.5 pt-1">
                <div className="p-3 rounded-xl border border-light-border dark:border-dark-border bg-light-surface-subtle dark:bg-dark-surface-subtle">
                  <div className="flex items-center justify-between font-bold text-light-text dark:text-dark-text">
                    <span>Real-ESRGAN</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary">BSD 3-Clause</span>
                  </div>
                  <p className="text-[11px] mt-0.5">
                    Xintao Wang, Liangbin Xie, Chao Dong, Ying Shan (Tencent ARC Lab).
                  </p>
                </div>

                <div className="p-3 rounded-xl border border-light-border dark:border-dark-border bg-light-surface-subtle dark:bg-dark-surface-subtle">
                  <div className="flex items-center justify-between font-bold text-light-text dark:text-dark-text">
                    <span>ONNX Runtime Web</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary">MIT License</span>
                  </div>
                  <p className="text-[11px] mt-0.5">
                    Microsoft Corporation. High-performance cross-platform inferencing engine for WebGPU and WebAssembly.
                  </p>
                </div>

                <div className="p-3 rounded-xl border border-light-border dark:border-dark-border bg-light-surface-subtle dark:bg-dark-surface-subtle">
                  <div className="flex items-center justify-between font-bold text-light-text dark:text-dark-text">
                    <span>JSZip</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary">MIT License</span>
                  </div>
                  <p className="text-[11px] mt-0.5">
                    Stuart Knightley, David Duponchel, Franz Buchinger, António Afonso.
                  </p>
                </div>

                <div className="p-3 rounded-xl border border-light-border dark:border-dark-border bg-light-surface-subtle dark:bg-dark-surface-subtle">
                  <div className="flex items-center justify-between font-bold text-light-text dark:text-dark-text">
                    <span>Lucide Icons</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary">ISC License</span>
                  </div>
                  <p className="text-[11px] mt-0.5">
                    Lucide Contributors. Beautiful and consistent iconography.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end px-6 py-3 border-t border-light-border dark:border-dark-border bg-light-surface-subtle dark:bg-dark-surface-subtle">
          <button
            type="button"
            onClick={onClose}
            className="btn-primary px-4 py-1.5 rounded-xl text-xs font-semibold"
          >
            {t.modals.close}
          </button>
        </div>
      </div>
    </div>
  );
};
