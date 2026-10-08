import pymupdf
import glob
import sys

sys.stdout.reconfigure(encoding='utf-8')

pdf_files = glob.glob('*.pdf')
doc = pymupdf.open(pdf_files[0])
print("Opened PDF:", pdf_files[0], "Pages:", len(doc))

for page_num in range(min(5, len(doc))):
    page = doc[page_num]
    blocks = page.get_text("dict")["blocks"]
    print(f"\n--- PAGE {page_num+1} ---")
    for b in blocks:
        if "lines" in b:
            for line in b["lines"]:
                for span in line["spans"]:
                    text = span["text"].strip()
                    if text:
                        color = span["color"]
                        font = span["font"]
                        flags = span["flags"]
                        size = span["size"]
                        # Check if red color or bold or underline or yellow
                        if color != 0 or "Bold" in font or "bold" in font or (flags & 16):
                            print(f"[STYLED] font: {font:20s} | color: {color:10d} | flags: {flags:2d} | text: {text}")
                        elif any(text.startswith(prefix) for prefix in ["a.", "b.", "c.", "d.", "a,", "b,", "c,", "d,", "Câu"]):
                            print(f"[PLAIN ] font: {font:20s} | color: {color:10d} | text: {text}")
