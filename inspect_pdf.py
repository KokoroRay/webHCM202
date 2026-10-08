import sys
import re
import pypdf

sys.stdout.reconfigure(encoding='utf-8')

with open('extracted_raw.txt', 'r', encoding='utf-8') as f:
    raw = f.read()

print('Total character length:', len(raw))

cau_matches = re.findall(r'Câu\s*\d+[\.\:]?', raw)
print('Total "Câu X:" matches:', len(cau_matches))

# Let's inspect pages 1 to 5 to see if correct answers are indicated or if pypdf extract text shows bold/underlines, or if pdfplumber / pymupdf / pypdf can extract annotations or formatting.
# Let's see some sample questions in detail.
print("\n--- SAMPLE QUESTIONS FROM RAW ---")
print(raw[300:3500])
