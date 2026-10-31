import { describe, it, expect } from 'vitest';
import * as ort from 'onnxruntime-web';
import fs from 'node:fs';
import path from 'node:path';

describe('Real AI Model Inference Verification', () => {
  it('loads and runs real inference on Real-ESRGAN General x4v3', async () => {
    const modelPath = path.resolve('public/models/realesr-general-x4v3.onnx');
    expect(fs.existsSync(modelPath)).toBe(true);

    const buffer = fs.readFileSync(modelPath);
    const session = await ort.InferenceSession.create(new Uint8Array(buffer));

    expect(session.inputNames.length).toBe(1);
    expect(session.outputNames.length).toBe(1);

    // Create 32x32 input tensor
    const inH = 32;
    const inW = 32;
    const inputData = new Float32Array(1 * 3 * inH * inW).fill(0.6);
    const inputTensor = new ort.Tensor('float32', inputData, [1, 3, inH, inW]);

    const feeds = { [session.inputNames[0]]: inputTensor };
    const results = await session.run(feeds);
    const outputTensor = results[session.outputNames[0]];

    // Verify 4x dimensions: 32x32 -> 128x128
    expect(outputTensor.dims).toEqual([1, 3, 128, 128]);
    expect(outputTensor.data.length).toBe(1 * 3 * 128 * 128);

    // Verify output is not blank (not all 0)
    const outData = outputTensor.data as Float32Array;
    let nonZeroCount = 0;
    for (let i = 0; i < 100; i++) {
      if (outData[i] > 0.01) nonZeroCount++;
    }
    expect(nonZeroCount).toBeGreaterThan(90);

    inputTensor.dispose();
    outputTensor.dispose();
    session.release();
  });

  it('loads and runs real inference on Real-ESRGAN AnimeVideo v3', async () => {
    const modelPath = path.resolve('public/models/realesr-animevideov3.onnx');
    expect(fs.existsSync(modelPath)).toBe(true);

    const buffer = fs.readFileSync(modelPath);
    const session = await ort.InferenceSession.create(new Uint8Array(buffer));

    // Create 32x32 input tensor
    const inH = 32;
    const inW = 32;
    const inputData = new Float32Array(1 * 3 * inH * inW).fill(0.4);
    const inputTensor = new ort.Tensor('float32', inputData, [1, 3, inH, inW]);

    const feeds = { [session.inputNames[0]]: inputTensor };
    const results = await session.run(feeds);
    const outputTensor = results[session.outputNames[0]];

    // Verify 4x dimensions
    expect(outputTensor.dims).toEqual([1, 3, 128, 128]);

    inputTensor.dispose();
    outputTensor.dispose();
    session.release();
  });

  it('loads and runs real inference on Compact ESRGAN x2 Native', async () => {
    const modelPath = path.resolve('public/models/esrgan-compact-x2.onnx');
    expect(fs.existsSync(modelPath)).toBe(true);

    const buffer = fs.readFileSync(modelPath);
    const session = await ort.InferenceSession.create(new Uint8Array(buffer));

    // Create 32x32 input tensor
    const inH = 32;
    const inW = 32;
    const inputData = new Float32Array(1 * 3 * inH * inW).fill(0.5);
    const inputTensor = new ort.Tensor('float32', inputData, [1, 3, inH, inW]);

    const feeds = { [session.inputNames[0]]: inputTensor };
    const results = await session.run(feeds);
    const outputTensor = results[session.outputNames[0]];

    // Verify 2x dimensions: 32x32 -> 64x64
    expect(outputTensor.dims).toEqual([1, 3, 64, 64]);

    inputTensor.dispose();
    outputTensor.dispose();
    session.release();
  });
});
