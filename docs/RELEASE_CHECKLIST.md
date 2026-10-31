# MoUpscale — Production Release Checklist

## A. Functional Verification
- [x] Single image upload (PNG, JPEG, WebP, AVIF, BMP)
- [x] Multi-image batch selection
- [x] Drag-and-drop upload with visual drop zone feedback
- [x] Clipboard paste support (Ctrl+V / Cmd+V)
- [x] Mobile camera & gallery file picker support
- [x] Sample images loading (Photo, Anime, Logo, Portrait)
- [x] Image removal & full queue clearing
- [x] Corrupted file and invalid format validation with error toasts
- [x] Lazy model downloading with real progress indicators
- [x] Real neural inference (WebGPU / WASM execution)
- [x] 2× upscale (Native 2× model and 4× with downsampling)
- [x] 4× upscale (Real-ESRGAN General and AnimeVideo v3)
- [x] 8× upscale (Multi-pass pipeline with resource warnings)
- [x] Custom output dimensions with aspect-ratio lock
- [x] Preset switching (Standard, Photo, Portrait, Anime, Digital Art, Fast, High Quality)
- [x] Fine-tuning enhancement controls (Denoise, Sharpen, JPEG, Detail, Edge, Vibrance)
- [x] Transparent alpha channel preservation
- [x] Smart tiling engine with feathered cosine seam blending
- [x] Real-time stage and tile progress reporting
- [x] Abort/Cancel handling with safe memory disposal
- [x] Interactive comparison viewer (Split slider, Side-by-side, Original, Enhanced)
- [x] Synchronized pan and zoom (100% pixel inspection, fit-to-view, wheel zoom)
- [x] Single image download with structured naming (`_moupscale_4x.png`)
- [x] Batch queue execution with individual and ZIP download (`packageBatchToZip`)
- [x] Real image metadata inspection (Dimensions, MP, File Size, Provider, Duration)
- [x] Light and Dark theme switching with persistent `localStorage`
- [x] English and Bahasa Indonesia localization with persistent `localStorage`

---

## B. Production Build & Tooling Verification
- [x] `npm run build` succeeds with zero errors (bundle size `< 250 kB` gzipped initial JS)
- [x] `npm run typecheck` (`tsc -b`) succeeds with 0 errors
- [x] `npm run lint` (`oxlint`) succeeds with 0 errors and 0 warnings
- [x] `npm test` (Vitest) 18 / 18 tests passed
- [x] `npm run test:e2e` (Playwright) 10 / 10 cross-browser tests passed
- [x] Production preview (`npm run preview`) tested with real browser interactions

---

## C. Security & Open-Source Compliance
- [x] Zero committed secrets or API tokens
- [x] Zero server-side image uploads (100% private in-browser execution)
- [x] Zero tracking cookies or third-party analytical telemetry
- [x] License compatibility verified (MIT project license, BSD 3-Clause model weights, ISC icons)
- [x] Accurate open-source attribution in UI modal and docs
