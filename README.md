# MoUpscale — Professional AI Image Super-Resolution

> Genuine, browser-native AI super-resolution and image enhancement web application. Zero server uploads, private, high-fidelity neural network upscaling using Real-ESRGAN, ONNX Runtime Web, and WebGPU.

[![License: MIT](https://img.shields.io/badge/License-MIT-FD8D14.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/dimasmong/MoUpscale/releases)
[![CI](https://github.com/dimasmong/MoUpscale/actions/workflows/ci.yml/badge.svg)](https://github.com/dimasmong/MoUpscale/actions)
[![React](https://img.shields.io/badge/React-19-61dafb.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646cff.svg)](https://vitejs.dev/)
[![ONNX Runtime Web](https://img.shields.io/badge/Engine-ONNX%20Runtime%20Web-0078d4.svg)](https://github.com/microsoft/onnxruntime)

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
- **Responsive Design System:** Restrained modern glassmorphism in both Light (default) and Dark modes across all viewports (320px to 1920px).
- **Full Internationalization (i18n):** Complete localized support for English and Bahasa Indonesia.
- **Privacy by Design:** Zero image payloads leave your device. All inference is 100% local.

---

## 🖼️ Supported Image Formats

| Format | Decoding Support | Encoding / Export | Notes |
| :--- | :---: | :---: | :--- |
| **PNG** | ✅ Full | ✅ Lossless | Preserves alpha transparency |
| **JPEG / JPG** | ✅ Full | ✅ Adjustable Quality | 10%–100% compression quality control |
| **WebP** | ✅ Full | ✅ Modern Efficient | High compression efficiency with alpha |
| **AVIF** | ✅ Native browser decoding | Browser-dependent | Decodes upright via EXIF orientation |
| **BMP** | ✅ Native browser decoding | Converts to PNG/JPG | Full RGB color channel extraction |

---

## 🧠 Integrated AI Models

| Model Name | Scale | Architecture | Size | Checksum (SHA-256) | Upstream License |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Real-ESRGAN General x4v3** | 4× | SRVGGNetCompact | 4.64 MB | `1940a93ee08283a0429a1b920409a8bcbbd6ad5e83ec65fb20d4fbbcf91cf97e` | BSD 3-Clause |
| **Real-ESRGAN AnimeVideo v3** | 4× | SRVGGNetCompact | 2.38 MB | `0a25cdd3cdfded5508a8e3cb98305f6396f86644d673648ebc46927a052ff3c1` | BSD 3-Clause |
| **Compact ESRGAN x2 Native** | 2× | Compact ESRGAN | 2.30 MB | `75c3f46fb2efd586dca50a97aa3508d4b31a89c9e83ecf0a2ba185387431c4f5` | MIT / Apache 2.0 |

All models are lazy-loaded on demand and cached in the browser's persistent `Cache` API (`moupscale-models-v1`) for offline re-use.

---

## 🛠️ Technology Stack

- **Frontend Framework:** React 19, TypeScript
- **Bundler & Tooling:** Vite 8, PostCSS, Tailwind CSS 3.4
- **AI / Tensor Engine:** ONNX Runtime Web (`onnxruntime-web` v1.31.1)
  - Execution Providers: WebGPU (`webgpu`) & Multi-threaded SIMD WebAssembly (`wasm`)
- **Archive Packing:** JSZip v3.10.1
- **Icons:** Lucide React
- **Testing:** Vitest 5.0.5, Playwright 1.64.1, JSDOM

---

## 🚀 Quick Start & Development

### Prerequisites
- Node.js 18+ (tested on Node v20 / v24)
- npm 9+

### Installation

```bash
# 1. Clone repository
git clone https://github.com/dimasmong/MoUpscale.git
cd MoUpscale

# 2. Install dependencies
npm install

# 3. Start development server with COOP/COEP headers
npm run dev
```

### Production Build

```bash
# Typecheck and compile optimized production bundle
npm run build

# Preview production build locally
npm run preview
```

### Testing & Validation

```bash
# Run unit & integration test suite (Vitest)
npm test

# Run cross-browser Playwright E2E suite
npm run test:e2e

# Run linter
npm run lint
```

---

## 🌐 Browser Compatibility

| Browser | Hardware Acceleration | Fallback Provider | Maximum Tested Resolution |
| :--- | :---: | :---: | :---: |
| **Google Chrome (Desktop 113+)** | WebGPU | WASM SIMD | 4096 × 4096 px |
| **Microsoft Edge (Desktop 113+)** | WebGPU | WASM SIMD | 4096 × 4096 px |
| **Mozilla Firefox (Desktop 120+)** | WASM SIMD | CPU | 3840 × 2160 px |
| **Google Chrome (Android 12+)** | WebGPU / WASM | WASM | 2048 × 2048 px |
| **Apple Safari (iOS 16.4+ / iPadOS)** | WASM SIMD | CPU | 2048 × 2048 px |
| **Apple Safari (macOS 16+)** | WebGPU / WASM | WASM | 4096 × 4096 px |

---

## 🔒 Privacy & Client Security

- **Strict Client-Side Execution:** 100% of image decoding, tile extraction, neural inference, and encoding happens directly inside your browser.
- **Zero Server Uploads:** Your images never leave your local device.
- **Zero Telemetry / Trackers:** No tracking cookies, external analytics, or remote logging.
- **Isolated Memory:** All intermediate tensors and canvas buffers are immediately disposed after rendering.

---

## 📖 Architecture & Documentation

- [System Architecture](file:///docs/ARCHITECTURE.md)
- [AI Models Specification](file:///docs/AI_MODELS.md)
- [Performance & Benchmarks](file:///docs/PERFORMANCE.md)
- [Test Report & Evidence](file:///docs/TEST_REPORT.md)
- [Browser Compatibility Matrix](file:///docs/BROWSER_COMPATIBILITY.md)
- [Release Checklist](file:///docs/RELEASE_CHECKLIST.md)

---

## 📜 License & Attributions

MoUpscale is licensed under the [MIT License](file:///LICENSE).  
Copyright © 2026 Dimas Mong.

Third-party dependencies and neural model weights are attributed in [THIRD_PARTY_LICENSES.md](file:///THIRD_PARTY_LICENSES.md).
