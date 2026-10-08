import pymupdf
import glob
import sys

sys.stdout.reconfigure(encoding='utf-8')
pdf_files = glob.glob('*.pdf')
doc = pymupdf.open(pdf_files[0])

# Find pages around question 442
for page_idx in range(60, 80):
    page = doc[page_idx]
    text = page.get_text()
    if "Câu 442" in text or "Câu 443" in text:
        print(f"--- PAGE {page_idx+1} ---")
        blocks = page.get_text("dict")["blocks"]
        for b in blocks:
            if "lines" in b:
                for line in b["lines"]:
                    spans_str = []
                    for s in line["spans"]:
                        b_flag = "BOLD" if (("Bold" in s["font"]) or ("bold" in s["font"]) or (s["flags"] & 16)) else "NORM"
                        spans_str.append(f"[{b_flag}|{s['color']}] '{s['text']}'")
                    print("LINE:", " ".join(spans_str))
