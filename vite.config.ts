import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';

function copyOrtWasmPlugin() {
  return {
    name: 'copy-ort-wasm',
    buildStart() {
      const srcDir = path.resolve(import.meta.dirname, 'node_modules/onnxruntime-web/dist');
      const destDir = path.resolve(import.meta.dirname, 'public/wasm');
      if (fs.existsSync(srcDir)) {
        if (!fs.existsSync(destDir)) {
          fs.mkdirSync(destDir, { recursive: true });
        }
        const files = fs.readdirSync(srcDir);
        for (const file of files) {
          if (file.endsWith('.wasm') || file.endsWith('.mjs')) {
            const srcFile = path.join(srcDir, file);
            const destFile = path.join(destDir, file);
            if (!fs.existsSync(destFile) || fs.statSync(srcFile).size !== fs.statSync(destFile).size) {
              fs.copyFileSync(srcFile, destFile);
              console.log(`[MoUpscale] Copied ORT asset: ${file}`);
            }
          }
        }
      }
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), copyOrtWasmPlugin()],
  server: {
    port: 5173,
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'credentialless',
    },
  },
  preview: {
    port: 4173,
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'credentialless',
    },
  },
  worker: {
    format: 'es',
  },
  optimizeDeps: {
    exclude: ['onnxruntime-web'],
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('onnxruntime-web')) return 'vendor-onnx';
          if (id.includes('jszip')) return 'vendor-zip';
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) return 'vendor-react';
        },
      },
    },
  },
});
