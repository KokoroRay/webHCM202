import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('ocr_raw_cache.json', 'r', encoding='utf-8') as f:
    cache = json.load(f)

print(f"Loaded {len(cache)} pages from OCR cache.")

for p in cache:
    page_text = " ".join([l['text'] for l in p['lines']])
    if 'chọn' in page_text.lower():
        matches = re.findall(r'([^.\n]*chọn[^.\n]*)', page_text, re.IGNORECASE)
        for m in matches:
            if any(k in m.lower() for k in ['đáp án', 'phương án', 'đúng', 'chỉ', '2', '3', '4', 'nhiều', 'các']):
                print(f"Page {p['page']}: {m.strip()}")
