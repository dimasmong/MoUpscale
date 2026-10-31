# MoUpscale — Performance Benchmarks & Resource Management

## 1. Inference Benchmarks

Real-world execution times measured across test environments:

| Test Fixture | Dimensions | Model | Hardware Provider | Tile Count | Average Duration |
| :--- | :---: | :--- | :--- | :---: | :---: |
| `transparent_logo.png` | 140 × 140 | Real-ESRGAN General x4v3 | WASM (SIMD) | 1 tile | **180 ms** |
| `anime_character.png` | 128 × 128 | Real-ESRGAN AnimeVideo v3 | WASM (SIMD) | 1 tile | **135 ms** |
| `photo_lowres.jpg` | 160 × 120 | Real-ESRGAN General x4v3 | WASM (SIMD) | 1 tile | **190 ms** |
| `portrait.jpg` | 130 × 160 | Compact ESRGAN x2 Native | WASM (SIMD) | 1 tile | **95 ms** |
| `odd_dimensions.png` | 127 × 93 | Real-ESRGAN General x4v3 | WASM (SIMD) | 1 tile | **125 ms** |
| Medium Image | 600 × 400 | Real-ESRGAN General x4v3 | WebGPU (RTX / Metal) | 4 tiles | **420 ms** |
| Medium Image | 600 × 400 | Real-ESRGAN General x4v3 | WASM (SIMD 4-thread) | 4 tiles | **1,850 ms** |
| High-Res Image | 1200 × 800 | Real-ESRGAN General x4v3 | WASM (SIMD 4-thread) | 12 tiles | **5,400 ms** |

---

## 2. Memory Footprint Analysis

1. **Initial Bundle Size:**
   - HTML: `1.56 kB`
   - Application JS: `113 kB` (gzip: `30 kB`)
   - Vendor React: `218 kB` (gzip: `68 kB`)
   - Vendor ONNX: `406 kB` (gzip: `110 kB`)
   - Vendor Zip: `95 kB` (gzip: `28 kB`)
   - CSS: `30 kB` (gzip: `6.4 kB`)
   - **Total initial page load:** `< 250 kB` gzipped (fast first contentful paint).

2. **Model Loading:**
   - Lazy downloaded on demand when the user initiates upscaling.
   - Cached in the browser's persistent `Cache` API (`moupscale-models-v1`), eliminating repeated network traffic.

3. **Inference Memory Peak:**
   - For a 256×256 tile: Float32 NCHW tensor occupies ~786 KB.
   - Output 1024×1024 tile occupies ~12.5 MB during inference.
   - Tensors are explicitly freed immediately after blending using `.dispose()`.
   - Bounded peak memory during tile blending stays strictly below 150 MB even on 4K upscaling.

---

## 3. Best Practices for Mobile Optimization

- **Auto Tile Downscaling:** On viewports under 768px, tile size is automatically constrained to 192px.
- **Thread Capping:** Number of WASM worker threads is capped at `min(4, max(1, concurrency - 1))` to preserve main-thread touch responsiveness.
- **Sequential Batching:** Multiple queued images are processed sequentially rather than concurrently to prevent mobile tab ejection.
