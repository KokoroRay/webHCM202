import pymupdf
from rapidocr_onnxruntime import RapidOCR
import sys
import json
import os

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = 'HCM202_4c9dea7892a69190f1e24be168b97614.pdf'
doc = pymupdf.open(pdf_path)

ocr_cache_file = 'ocr_raw_cache.json'
all_pages_ocr = []

if os.path.exists(ocr_cache_file):
    try:
        with open(ocr_cache_file, 'r', encoding='utf-8') as f:
            all_pages_ocr = json.load(f)
    except Exception:
        all_pages_ocr = []

processed_pages = {item['page'] for item in all_pages_ocr}
print(f"Loaded {len(processed_pages)} pages from cache. Total to process: {len(doc)}", flush=True)

engine = RapidOCR()

for idx in range(len(doc)):
    page_num = idx + 1
    if page_num in processed_pages:
        continue

    page = doc[idx]
    pix = page.get_pixmap(dpi=90)
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
        "page": page_num,
        "lines": page_lines
    })
    processed_pages.add(page_num)

    # Save cache on EVERY page
    with open(ocr_cache_file, 'w', encoding='utf-8') as f:
        json.dump(all_pages_ocr, f, ensure_ascii=False, indent=2)
    
    print(f"[{page_num}/{len(doc)}] Saved page {page_num} ({len(page_lines)} lines).", flush=True)

print(f"Finished OCR! Total pages cached: {len(all_pages_ocr)}", flush=True)
