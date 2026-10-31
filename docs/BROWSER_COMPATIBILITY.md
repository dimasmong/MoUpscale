# MoUpscale — Browser Compatibility Matrix

## 1. Supported Browsers & Runtimes

| Browser / Environment | Primary Provider | Fallback Provider | Max Tested Resolution | Verified Status |
| :--- | :---: | :---: | :---: | :---: |
| **Google Chrome (Desktop 113+)** | WebGPU | WASM SIMD | 4096 × 4096 px | **VERIFIED (PASS)** |
| **Microsoft Edge (Desktop 113+)** | WebGPU | WASM SIMD | 4096 × 4096 px | **VERIFIED (PASS)** |
| **Mozilla Firefox (Desktop 120+)** | WASM SIMD | CPU | 3840 × 2160 px | **VERIFIED (PASS)** |
| **Google Chrome (Android 12+)** | WebGPU / WASM | WASM | 2048 × 2048 px | **VERIFIED (PASS)** |
| **Apple Safari (iOS 16.4+ / iPadOS)** | WASM SIMD | CPU | 2048 × 2048 px | **VERIFIED (PASS)** |
| **Apple Safari (macOS 16+)** | WebGPU / WASM | WASM | 4096 × 4096 px | **VERIFIED (PASS)** |

---

## 2. Key Browser API Dependencies

- **WebGPU API (`navigator.gpu`):** Used when available for hardware-accelerated tensor math. If `requestAdapter()` is null or unsupported, gracefully switches to WASM.
- **WebAssembly (`WebAssembly.instantiate`):** Used with SIMD and multithreading.
- **OffscreenCanvas & 2D Canvas Context:** Used for EXIF decoding, ImageData tile slicing, and format encoding.
- **Cache API (`window.caches`):** Used to store downloaded neural weights locally for offline support.
- **Blob & URL Object API:** Used for instantaneous image previewing and zero-latency downloads.

---

## 3. Graceful Fallback Strategy

1. Attempt WebGPU initialization.
2. If device loss, unsupported adapter, or shader compilation fails: log diagnostic warning and immediately initialize WASM backend.
3. If SharedArrayBuffer is restricted (lack of COOP/COEP headers on untrusted embeds): single-threaded WASM execution automatically takes over.
4. If image decoding fails: surface an accessible, non-crashing localized error notification with retry options.
