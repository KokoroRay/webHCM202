import pymupdf
from rapidocr_onnxruntime import RapidOCR
import sys
import io
from PIL import Image

sys.stdout.reconfigure(encoding='utf-8')

engine = RapidOCR()
pdf_path = 'HCM202_4c9dea7892a69190f1e24be168b97614.pdf'
doc = pymupdf.open(pdf_path)

print(f"Testing OCR on page 1 of {pdf_path}...")
page = doc[0]
pix = page.get_pixmap(dpi=150)
img_bytes = pix.tobytes("png")

result, _ = engine(img_bytes)

if result:
    print(f"Page 1 OCR returned {len(result)} text lines:")
    for line in result[:15]:
        # line format: [box, text, score]
        print(f"  [{line[2]:.2f}] {line[1]}")
else:
    print("Page 1 OCR returned no text.")
