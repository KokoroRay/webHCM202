import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('ocr_raw_cache.json', 'r', encoding='utf-8') as f:
    pages = json.load(f)

print(f"Inspecting parsed items from {len(pages)} cached pages...")

# Let's inspect raw text lines page by page
for p in pages:
    print(f"\n================ PAGE {p['page']} ================")
    lines = [l['text'].strip() for l in p['lines'] if l['text'].strip()]
    for line in lines:
        print("  ", line)
