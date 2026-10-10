import pymupdf
from rapidocr_onnxruntime import RapidOCR
import sys
import json
import os

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = 'HCM202_4c9dea7892a69190f1e24be168b97614.pdf'
doc = pymupdf.open(pdf_path)
print(f"Fast OCR processing {len(doc)} pages of {pdf_path}...", flush=True)

engine = RapidOCR()
ocr_cache_file = 'ocr_raw_cache.json'

all_pages_ocr = []
if os.path.exists(ocr_cache_file):
    try:
        with open(ocr_cache_file, 'r', encoding='utf-8') as f:
            all_pages_ocr = json.load(f)
        print(f"Loaded {len(all_pages_ocr)} existing pages from cache.", flush=True)
    except Exception:
        all_pages_ocr = []

start_page = len(all_pages_ocr)

for page_idx in range(start_page, len(doc)):
    page = doc[page_idx]
    # dpi=96 is fast and high resolution enough for OCR
    pix = page.get_pixmap(dpi=96)
    img_bytes = pix.tobytes("png")
    
    result, _ = engine(img_bytes)
    
    page_lines = []
    if result:
        for item in result:
            page_lines.append({
                "box": item[0],
                "text": item[1],
                "score": float(item[2])
            })
            
    all_pages_ocr.append({
        "page": page_idx + 1,
        "lines": page_lines
    })
    
    if (page_idx + 1) % 5 == 0 or page_idx == len(doc) - 1:
        print(f"Progress: {page_idx + 1}/{len(doc)} pages done.", flush=True)
        with open(ocr_cache_file, 'w', encoding='utf-8') as f:
            json.dump(all_pages_ocr, f, ensure_ascii=False, indent=2)

print(f"Fast OCR Complete! Total pages cached: {len(all_pages_ocr)}", flush=True)
