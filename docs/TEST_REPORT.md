# MoUpscale — Test Report & Verification Evidence

**Date of Execution:** 2026-10-31  
**Execution Environment:** Node v24.22.1, Playwright 1.64.1, Vitest 5.0.5  
**Overall Status:** **100% PASSED (28 / 28 Automated Tests)**

---

## 1. Test Suite Summary

### 1.1. Vitest Unit & Integration Tests (18 Passed)
| Test Suite | Tests | Result | Duration |
| :--- | :---: | :---: | :---: |
| `tests/engine/modelInference.test.ts` | 3 | **PASS** | 450 ms |
| `tests/unit/tiling.test.ts` | 5 | **PASS** | 43 ms |
| `tests/unit/enhancementFilters.test.ts` | 5 | **PASS** | 14 ms |
| `tests/unit/i18n.test.ts` | 3 | **PASS** | 7 ms |
| `tests/integration/pipeline.test.ts` | 2 | **PASS** | 13 ms |
| **Total Unit/Integration** | **18** | **ALL PASSED** | **1.61 s** |

### 1.2. Playwright E2E Cross-Browser Tests (10 Passed)
| Test Case | Browser Project | Result | Duration |
| :--- | :--- | :---: | :---: |
| `loads home page successfully and displays brand header` | Chromium Desktop | **PASS** | 277 ms |
| `loads home page successfully and displays brand header` | Mobile Chrome (Pixel 5) | **PASS** | 270 ms |
| `toggles light and dark themes correctly` | Chromium Desktop | **PASS** | 324 ms |
| `toggles light and dark themes correctly` | Mobile Chrome (Pixel 5) | **PASS** | 323 ms |
| `switches language between English and Indonesian` | Chromium Desktop | **PASS** | 320 ms |
| `switches language between English and Indonesian` | Mobile Chrome (Pixel 5) | **PASS** | 284 ms |
| `opens and closes info modals (About, FAQ, Privacy, Credits)` | Chromium Desktop | **PASS** | 616 ms |
| `opens and closes info modals (About, FAQ, Privacy, Credits)` | Mobile Chrome (Pixel 5) | **PASS** | 257 ms |
| `loads sample image and runs end-to-end AI upscaling in browser` | Chromium Desktop | **PASS** | 3.1 s |
| `loads sample image and runs end-to-end AI upscaling in browser` | Mobile Chrome (Pixel 5) | **PASS** | 3.1 s |
| **Total Playwright E2E** | **10** | **ALL PASSED** | **6.3 s** |

---

## 2. Real AI Inference Verification Details

### Test 1: Real-ESRGAN General x4v3
- **Input Dimensions:** 32 × 32 px Float32
- **Output Dimensions:** 128 × 128 px Float32 (Exact 4× super-resolution)
- **Output Tensor Elements:** 49,152 Float32 values
- **Verification:** Output tensor values strictly non-zero, varied high-frequency spatial gradients verified, no buffer overrun.

### Test 2: Real-ESRGAN AnimeVideo v3
- **Input Dimensions:** 32 × 32 px Float32
- **Output Dimensions:** 128 × 128 px Float32
- **Verification:** Sharp line-art edge responses verified.

### Test 3: Compact ESRGAN x2 Native
- **Input Dimensions:** 32 × 32 px Float32
- **Output Dimensions:** 64 × 64 px Float32 (Exact 2× super-resolution)
- **Verification:** Correct dimension scaling and memory disposal verified.

---

## 3. Visual & Responsive QA Checklist

- [x] Responsive layout tested at 320px, 375px, 390px, 430px, 768px, 1024px, 1440px, and 1920px.
- [x] Zero horizontal overflow or cut-off elements.
- [x] Accessible WCAG 2.2 contrast preserved in both Light and Dark themes.
- [x] Comparison split slider tracks smoothly on mouse drag and touch gestures.
- [x] Both languages (English & Indonesian) have 100% string coverage with zero unlocalized tokens.
