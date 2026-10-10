import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('ocr_raw_cache.json', 'r', encoding='utf-8') as f:
    pages = json.load(f)

for p in pages[5:15]:
    print(f"\n================ PAGE {p['page']} ================")
    lines = [l['text'].strip() for l in p['lines'] if l['text'].strip()]
    for idx, line in enumerate(lines):
        print(f"  [{idx:2d}] {line}")
