import pymupdf
import sys

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = 'HCM202_4c9dea7892a69190f1e24be168b97614.pdf'
doc = pymupdf.open(pdf_path)
print(f"Total pages in doc: {len(doc)}")

non_empty_pages = 0
for idx, page in enumerate(doc):
    text = page.get_text().strip()
    imgs = page.get_images()
    if text:
        non_empty_pages += 1
        if non_empty_pages <= 5:
            print(f"Page {idx+1} HAS TEXT ({len(text)} chars): {text[:200]}")
    elif len(imgs) > 0:
        if idx < 5:
            print(f"Page {idx+1} HAS {len(imgs)} IMAGES, no text.")

print(f"\nTotal non-empty text pages: {non_empty_pages} / {len(doc)}")
