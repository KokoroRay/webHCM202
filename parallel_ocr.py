import pymupdf
from rapidocr_onnxruntime import RapidOCR
import sys
import json
import os
from concurrent.futures import ProcessPoolExecutor, as_completed

pdf_path = 'HCM202_4c9dea7892a69190f1e24be168b97614.pdf'
ocr_cache_file = 'ocr_raw_cache.json'

def process_single_page(page_num):
    doc = pymupdf.open(pdf_path)
    page = doc[page_num - 1]
    pix = page.get_pixmap(dpi=90)
    img_bytes = pix.tobytes("png")
    doc.close()

    engine = RapidOCR()
    result, _ = engine(img_bytes)

    page_lines = []
    if result:
        for item in result:
            page_lines.append({
                "box": item[0],
                "text": item[1],
                "score": float(item[2])
            })
    return {
        "page": page_num,
        "lines": page_lines
    }

def main():
    sys.stdout.reconfigure(encoding='utf-8')
    doc = pymupdf.open(pdf_path)
    total_pages = len(doc)
    doc.close()

    all_pages_map = {}
    if os.path.exists(ocr_cache_file):
        try:
            with open(ocr_cache_file, 'r', encoding='utf-8') as f:
                cached = json.load(f)
                for item in cached:
                    all_pages_map[item['page']] = item
            print(f"Loaded {len(all_pages_map)} pages from cache.", flush=True)
        except Exception:
            all_pages_map = {}

    remaining_pages = [p for p in range(1, total_pages + 1) if p not in all_pages_map]
    print(f"Starting parallel OCR on {len(remaining_pages)} remaining pages with 6 workers...", flush=True)

    if not remaining_pages:
        print("All pages already OCR processed!", flush=True)
        return

    workers = min(6, os.cpu_count() or 4)
    with ProcessPoolExecutor(max_workers=workers) as executor:
        futures = {executor.submit(process_single_page, p): p for p in remaining_pages}
        
        done_count = 0
        for future in as_completed(futures):
            try:
                res = future.result()
                all_pages_map[res['page']] = res
                done_count += 1
                
                if done_count % 5 == 0 or done_count == len(remaining_pages):
                    # Save sorted cache
                    sorted_cache = [all_pages_map[p] for p in sorted(all_pages_map.keys())]
                    with open(ocr_cache_file, 'w', encoding='utf-8') as f:
                        json.dump(sorted_cache, f, ensure_ascii=False, indent=2)
                    print(f"[{len(sorted_cache)}/{total_pages}] Processed {done_count}/{len(remaining_pages)} pages...", flush=True)
            except Exception as e:
                print(f"Error on page {futures[future]}: {e}", flush=True)

    sorted_cache = [all_pages_map[p] for p in sorted(all_pages_map.keys())]
    with open(ocr_cache_file, 'w', encoding='utf-8') as f:
        json.dump(sorted_cache, f, ensure_ascii=False, indent=2)

    print(f"PARALLEL OCR COMPLETE! Total cached pages: {len(sorted_cache)}", flush=True)

if __name__ == '__main__':
    main()
