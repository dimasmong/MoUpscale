# MoUpscale — AI Model Specifications & Manifest

## 1. Overview
MoUpscale utilizes verified upstream neural network architectures optimized for client-side browser inference. All models are stored in ONNX format with opsets fully compatible with both WebGPU and WebAssembly.

---

## 2. Integrated Models

### 2.1. Real-ESRGAN General x4v3
- **Model ID:** `realesr-general-x4v3`
- **File Name:** `realesr-general-x4v3.onnx`
- **Scale Factor:** 4×
- **Architecture:** `SRVGGNetCompact` (1.21M parameters, FP32)
- **Input Tensor Layout:** `[1, 3, H, W]` (RGB, values in `[0.0, 1.0]`)
- **Output Tensor Layout:** `[1, 3, H*4, W*4]` (RGB, values in `[0.0, 1.0]`)
- **File Size:** 4,866,417 bytes (~4.64 MB)
- **SHA-256 Checksum:** `1940a93ee08283a0429a1b920409a8bcbbd6ad5e83ec65fb20d4fbbcf91cf97e`
- **Source & Author:** Xintao Wang et al., Tencent ARC Lab (converted by CoderViking)
- **License:** BSD 3-Clause
- **Best For:** General photography, digital artwork, document scans, textured landscapes.

### 2.2. Real-ESRGAN AnimeVideo v3
- **Model ID:** `realesr-animevideov3`
- **File Name:** `realesr-animevideov3.onnx`
- **Scale Factor:** 4×
- **Architecture:** `SRVGGNetCompact` (FP32)
- **Input Tensor Layout:** `[1, 3, H, W]` (RGB, values in `[0.0, 1.0]`)
- **Output Tensor Layout:** `[1, 3, H*4, W*4]`
- **File Size:** 2,493,261 bytes (~2.38 MB)
- **SHA-256 Checksum:** `0a25cdd3cdfded5508a8e3cb98305f6396f86644d673648ebc46927a052ff3c1`
- **Source & Author:** Xintao Wang et al., Tencent ARC Lab
- **License:** BSD 3-Clause
- **Best For:** Anime illustrations, comic art, stylized graphic animations, line drawings.

### 2.3. Compact ESRGAN x2 Native
- **Model ID:** `esrgan-compact-x2`
- **File Name:** `esrgan-compact-x2.onnx`
- **Scale Factor:** 2×
- **Architecture:** `Compact ESRGAN`
- **Input Tensor Layout:** `[1, 3, H, W]`
- **Output Tensor Layout:** `[1, 3, H*2, W*2]`
- **File Size:** 2,411,189 bytes (~2.30 MB)
- **SHA-256 Checksum:** `75c3f46fb2efd586dca50a97aa3508d4b31a89c9e83ecf0a2ba185387431c4f5`
- **Source & Author:** OpenModelDB / Nomos Community
- **License:** MIT / Apache 2.0
- **Best For:** Rapid 2× upscaling, mobile devices, lightweight previews.

---

## 3. Scale Factor Processing Matrix

| Mode | Primary Engine | Secondary Pass | Disclosure In Metadata |
| :--- | :--- | :--- | :--- |
| **2× (Native)** | `esrgan-compact-x2` (2×) | None | Native 2× neural super-resolution |
| **2× (Ultra Sharp)**| `realesr-general-x4v3` (4×)| Bicubic/Lanczos 2× downsampling | 4× AI inference with high-precision downsampling |
| **4×** | `realesr-general-x4v3` (4×) | None | Native 4× neural super-resolution |
| **8×** | `realesr-general-x4v3` (4×) | Resampling to 8× target | Multi-pass successive AI super-resolution |
| **Custom** | Nearest integer AI model | Aspect-locked canvas resampler | AI Super-resolution with precise canvas resampling |

---

## 4. Model Integrity Verification

Integrity is validated at runtime and build time using SHA-256 hashes against `public/models/manifest.json`. Model files that fail hash verification are rejected immediately to protect against corrupted downloads.
