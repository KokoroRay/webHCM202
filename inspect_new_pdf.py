import pymupdf
import sys
import re
import json

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = 'HCM202_4c9dea7892a69190f1e24be168b97614.pdf'
doc = pymupdf.open(pdf_path)
print(f"Opened new PDF: {pdf_path}")
print(f"Total pages: {len(doc)}")

# Inspect text sample from first 5 pages
for page_num in range(min(5, len(doc))):
    page = doc[page_num]
    text = page.get_text()
    print(f"\n--- PAGE {page_num+1} ---")
    print(text[:1000])
