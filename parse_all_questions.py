import pymupdf
import glob
import sys
import json
import re

sys.stdout.reconfigure(encoding='utf-8')

pdf_files = glob.glob('*.pdf')
doc = pymupdf.open(pdf_files[0])
print("Total pages in PDF:", len(doc))

all_spans = []

for page_idx, page in enumerate(doc):
    blocks = page.get_text("dict")["blocks"]
    for b in blocks:
        if "lines" in b:
            for line in b["lines"]:
                line_spans = []
                for span in line["spans"]:
                    text = span["text"]
                    is_bold = ("Bold" in span["font"]) or ("bold" in span["font"]) or bool(span["flags"] & 16)
                    color = span["color"]
                    line_spans.append({
                        "text": text,
                        "is_bold": is_bold,
                        "color": color,
                        "page": page_idx + 1
                    })
                all_spans.append(line_spans)

print("Extracted total line spans:", len(all_spans))

# Let's inspect how questions and choices are structured
questions = []
current_q = None

# Regex to detect question start: e.g. "Câu 1:", "Câu 1.", "Câu 10 :"
q_regex = re.compile(r'^(Câu\s*\d+)[\.\:]?\s*(.*)', re.IGNORECASE)
# Regex to detect option start: e.g. "a.", "b,", "A.", "a/", "a )", "a. "
opt_regex = re.compile(r'^\s*([a-eA-E])[\.\,\/\)]\s*(.*)')

# Let's run a prototype parser
for line in all_spans:
    full_line_text = "".join(s["text"] for s in line).strip()
    if not full_line_text:
        continue

    # Check header/footer line
    if "ĐỀ CƯƠNG ÔN MÔN" in full_line_text or "Khainh7" in full_line_text or "Mến chào cả lớp" in full_line_text:
        continue

    # Check if this line starts a new question
    q_match = q_regex.match(full_line_text)
    if q_match:
        if current_q:
            questions.append(current_q)
        current_q = {
            "num": q_match.group(1),
            "question": q_match.group(2).strip(),
            "options": [],
            "bold_options": [],
            "raw_lines": [full_line_text]
        }
        continue

    if current_q is not None:
        # Check if line is an option
        opt_match = opt_regex.match(full_line_text)
        if opt_match:
            letter = opt_match.group(1).lower()
            opt_text = opt_match.group(2).strip()
            # check if spans in this line have bold text
            has_bold = any(s["is_bold"] for s in line if len(s["text"].strip()) > 0)
            current_q["options"].append({
                "letter": letter,
                "text": opt_text,
                "full": full_line_text,
                "is_bold": has_bold
            })
        else:
            # If current_q has no options yet, it's continuation of question text
            if len(current_q["options"]) == 0:
                current_q["question"] += " " + full_line_text
            else:
                # Continuation of the last option text
                if current_q["options"]:
                    current_q["options"][-1]["text"] += " " + full_line_text
                    current_q["options"][-1]["full"] += " " + full_line_text
                    if any(s["is_bold"] for s in line if len(s["text"].strip()) > 0):
                        current_q["options"][-1]["is_bold"] = True

if current_q:
    questions.append(current_q)

print(f"Parsed {len(questions)} questions.")

# Let's inspect first 10 parsed questions
print("\n--- FIRST 5 QUESTIONS ---")
for q in questions[:5]:
    print("Num:", q["num"])
    print("Question:", q["question"])
    print("Options:")
    for opt in q["options"]:
        print(f"  [{'X' if opt['is_bold'] else ' '}] {opt['letter']}. {opt['text']}")
    print("-" * 40)
