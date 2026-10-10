import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('ocr_raw_cache.json', 'r', encoding='utf-8') as f:
    pages = json.load(f)

print(f"Total pages in cache: {len(pages)}")

for p in pages[:5]:
    print(f"\n================ PAGE {p['page']} ================")
    lines = [l['text'] for l in p['lines']]
    print("\n".join(lines[:25]))
