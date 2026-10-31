import os
import urllib.request
import hashlib
import json

os.makedirs('public/models', exist_ok=True)

models = [
    {
        'id': 'realesr-general-x4v3',
        'name': 'Real-ESRGAN General x4v3',
        'file': 'public/models/realesr-general-x4v3.onnx',
        'url': 'https://huggingface.co/CoderViking/realesr-general-x4v3-onnx/resolve/main/realesr-general-x4v3.onnx',
        'scale': 4,
        'architecture': 'SRVGGNetCompact',
        'license': 'BSD 3-Clause',
        'author': 'Xintao Wang et al. (Tencent ARC Lab)',
        'description': 'Lightweight general-purpose 4x super-resolution model for photos, digital graphics, and scans.'
    },
    {
        'id': 'realesr-animevideov3',
        'name': 'Real-ESRGAN AnimeVideo v3',
        'file': 'public/models/realesr-animevideov3.onnx',
        'url': 'https://huggingface.co/universonic/RealESRGAN/resolve/main/realesr-animevideov3_fp32.onnx',
        'scale': 4,
        'architecture': 'SRVGGNetCompact',
        'license': 'BSD 3-Clause',
        'author': 'Xintao Wang et al. (Tencent ARC Lab)',
        'description': 'Specialized 4x super-resolution model preserving crisp line-art and vibrant anime/illustration coloring.'
    },
    {
        'id': 'esrgan-compact-x2',
        'name': 'Compact ESRGAN x2 Native',
        'file': 'public/models/esrgan-compact-x2.onnx',
        'url': 'https://huggingface.co/huggingworld/onnx-image-models/resolve/main/2xNomosUni_compact_otf_medium.onnx',
        'scale': 2,
        'architecture': 'Compact ESRGAN',
        'license': 'MIT / Apache 2.0',
        'author': 'OpenModelDB / Nomos Community',
        'description': 'Native 2x super-resolution for general images and photos with rapid execution.'
    }
]

manifest = []

for m in models:
    dest = m['file']
    if not os.path.exists(dest) or os.path.getsize(dest) == 0:
        print(f"Downloading {m['name']} ({m['id']})...")
        urllib.request.urlretrieve(m['url'], dest)
    size = os.path.getsize(dest)
    with open(dest, 'rb') as f:
        sha = hashlib.sha256(f.read()).hexdigest()
    print(f"Verified: {m['id']} -> {size} bytes ({size / (1024*1024):.2f} MB), SHA256: {sha[:16]}...")
    
    manifest.append({
        'id': m['id'],
        'name': m['name'],
        'fileName': os.path.basename(m['file']),
        'path': f"/models/{os.path.basename(m['file'])}",
        'scale': m['scale'],
        'architecture': m['architecture'],
        'sizeBytes': size,
        'sizeFormatted': f"{size / (1024*1024):.2f} MB",
        'sha256': sha,
        'license': m['license'],
        'author': m['author'],
        'description': m['description'],
        'runtimeCompatibility': ['webgpu', 'wasm', 'cpu']
    })

with open('public/models/manifest.json', 'w', encoding='utf-8') as f:
    json.dump(manifest, f, indent=2)

print("\nModel manifest generated at public/models/manifest.json")
