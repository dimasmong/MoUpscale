# MoUpscale — Professional AI Image Super-Resolution

> Genuine, browser-native AI super-resolution and image enhancement web application. Zero server uploads, private, high-fidelity neural network upscaling.

[![License: MIT](https://img.shields.io/badge/License-MIT-orange.svg)](https://opensource.org/licenses/MIT)
[![ONNX Runtime Web](https://img.shields.io/badge/Engine-ONNX%20Runtime%20Web-blue)](https://github.com/microsoft/onnxruntime)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.x-purple)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8)](https://tailwindcss.com/)

---

## 🌟 Key Features

- **Genuine Neural Network Super-Resolution:** Executes real machine learning models (Real-ESRGAN General x4v3, Real-ESRGAN AnimeVideo v3, Compact ESRGAN x2 Native) directly in the browser via ONNX Runtime Web.
- **Smart Tiled Inference:** Dynamic tile size allocation (128px – 512px) with feathered cosine seam blending to eliminate grid artifacts and prevent browser memory exhaustion on large images.
- **Hardware Acceleration:** Native WebGPU execution provider with automatic multi-threaded SIMD WebAssembly (WASM) fallback.
- **Versatile Scale Factors:**
  - `2×`: Native Compact ESRGAN model or Real-ESRGAN x4 with Lanczos downsampling.
  - `4×`: Full 4× neural super-resolution for general photos and anime.
  - `8×`: Multi-pass AI pipeline for ultra-high resolutions.
  - `Custom`: AI super-resolution with precise aspect-ratio locked canvas resampling.
- **Transparent Alpha Channel Preservation:** Retains transparency layers for logos, web icons, and digital art with bilinear edge reconstruction.
- **Fine-Tuning Enhancements:** Adjustable denoising, unsharp masking, JPEG de-blocking, micro-detail contrast, and natural color vibrance.
- **Interactive Before/After Comparison Viewer:**
  - 4 modes: Draggable Split Slider, Side-by-Side, Original Only, Enhanced Only.
  - Synchronized pan and zoom (100% pixel inspection, fit-to-view, mouse wheel & pinch zoom).
- **Batch Processing & ZIP Export:** Queue multiple images, track per-image progress, and download individual files or all as a compressed ZIP archive.
- **Responsive Design System:** Restrained modern glassmorphism in both Light (default) and Dark modes across viewports (320px to 1920px).
- **Full Internationalization (i18n):** Complete localized support for English and Bahasa Indonesia.
- **Privacy by Design:** Zero image payloads leave your device. All inference is 100% local.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ (tested on Node v20/v24)
- npm 9+

### Installation & Development

```bash
# 1. Install dependencies
npm install

# 2. Start Vite development server with WASM headers
npm run dev
```

### Production Build & Preview

```bash
# Typecheck and build optimized client bundle
npm run build

# Preview production build locally
npm run preview
```

### Test Suite Execution

```bash
# Run unit & integration test suite (Vitest)
npm test

# Run browser E2E test suite (Playwright Desktop & Mobile)
npm run test:e2e

# Run linter
npm run lint
```

---

## 🧠 Integrated AI Models

| Model Name | Scale | Architecture | Size | Checksum (SHA-256) | License |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Real-ESRGAN General x4v3** | 4× | SRVGGNetCompact | 4.64 MB | `1940a93e...` | BSD 3-Clause |
| **Real-ESRGAN AnimeVideo v3** | 4× | SRVGGNetCompact | 2.38 MB | `0a25cdd3...` | BSD 3-Clause |
| **Compact ESRGAN x2 Native** | 2× | Compact ESRGAN | 2.30 MB | `75c3f46f...` | MIT / Apache 2.0 |

---

## 📁 Project Architecture

```text
MoUpscale/
├── public/
│   ├── models/        # Verified ONNX neural network weights & manifest
│   ├── samples/       # Offline test fixtures & sample images
│   ├── wasm/          # ONNX Runtime WebAssembly & JSEP assets
│   └── favicon.svg    # Vector brand icon
├── src/
│   ├── components/
│   │   ├── layout/    # Header, Footer, Navigation, Theme/Lang controls
│   │   ├── upload/    # DropZone, sample loader, clipboard paste
│   │   ├── workspace/ # SettingsPanel, BatchQueueList
│   │   ├── preview/   # ComparisonViewer (Split, Side-by-Side, Zoom/Pan)
│   │   ├── processing/# Real ProgressIndicator, Tile progress
│   │   ├── export/    # ExportControls, metadata panel
│   │   └── pages/     # About, FAQ, Privacy, Terms, Credits modals
│   ├── engine/
│   │   ├── models/    # Model registry and browser cache service
│   │   ├── runtime/   # ONNX Runtime WebGPU/WASM session manager
│   │   ├── tiling/    # TileCalculator and feathered TileBlender
│   │   ├── inference/ # SuperResolutionPipeline orchestrator
│   │   ├── preprocessing/ # Image decoding, EXIF orientation, NCHW conversion
│   │   ├── postprocessing/# Enhancement filters (denoise, sharpen, vibrance)
│   │   └── encoding/  # Image encoder (PNG, JPEG, WebP) & JSZip packer
│   ├── hooks/         # useTheme, useI18n
│   ├── i18n/          # English and Indonesian translation dictionaries
│   └── types/         # TypeScript definitions
├── tests/
│   ├── unit/          # Tiling, filters, and i18n tests
│   ├── engine/        # Real ONNX model inference tests
│   ├── integration/   # Batch ZIP export tests
│   └── e2e/           # Playwright cross-browser tests
└── docs/              # In-depth architectural & QA reports
```

---

## 📜 License & Compliance

© 2026 Dimas Mong. Distributed under the **MIT License**.
See [LICENSE](file:///LICENSE) for full open-source license notices and third-party attributions.
