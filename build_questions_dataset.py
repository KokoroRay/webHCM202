import pymupdf
import glob
import sys
import json
import re

sys.stdout.reconfigure(encoding='utf-8')

pdf_files = glob.glob('*.pdf')
if not pdf_files:
    print("No PDF file found!")
    sys.exit(1)

doc = pymupdf.open(pdf_files[0])
print("Reading PDF:", pdf_files[0], "Pages:", len(doc))

# Step 1: Collect lines with text, bold status, color, page
all_lines = []
for page_idx, page in enumerate(doc):
    blocks = page.get_text("dict")["blocks"]
    for b in blocks:
        if "lines" in b:
            for line in b["lines"]:
                line_spans = []
                for span in line["spans"]:
                    text = span["text"]
                    is_bold = ("Bold" in span["font"]) or ("bold" in span["font"]) or bool(span["flags"] & 16) or span["color"] != 0
                    line_spans.append({
                        "text": text,
                        "is_bold": is_bold,
                        "color": span["color"]
                    })
                
                full_text = "".join(s["text"] for s in line_spans).strip()
                if not full_text:
                    continue
                
                # Check for bold across meaningful text
                has_bold_content = any(s["is_bold"] for s in line_spans if len(s["text"].strip()) > 0)
                
                all_lines.append({
                    "full_text": full_text,
                    "spans": line_spans,
                    "is_bold": has_bold_content,
                    "page": page_idx + 1
                })

print("Total non-empty lines extracted:", len(all_lines))

# Step 2: Parse into question units
raw_questions = []
cur_q = None

# Regex patterns
q_start_re = re.compile(r'^(Câu\s*\d+|C\d+)[\.\:]?\s*(.*)', re.IGNORECASE)
opt_start_re = re.compile(r'^\s*([\-\*]?\s*[a-eA-E0-9])[\.\,\/\)]\s*(.*)')

for item in all_lines:
    txt = item["full_text"]
    
    # Ignore header text
    if any(h in txt for h in ["ĐỀ CƯƠNG ÔN MÔN", "Khainh7", "Mến chào cả lớp"]):
        continue

    # Check question start
    q_match = q_start_re.match(txt)
    if q_match:
        if cur_q:
            raw_questions.append(cur_q)
        cur_q = {
            "num_str": q_match.group(1),
            "header": q_match.group(2).strip(),
            "lines": [],
            "page": item["page"]
        }
        continue

    if cur_q:
        cur_q["lines"].append(item)

if cur_q:
    raw_questions.append(cur_q)

print(f"Grouped into {len(raw_questions)} raw questions.")

# Step 3: Parse options and correct answer for each raw question
final_questions = []

for idx, rq in enumerate(raw_questions):
    q_text = rq["header"]
    lines = rq["lines"]
    
    options = []
    bold_indices = []
    
    # First pass: try detecting options starting with a., b., c., d., -, etc.
    in_options = False
    
    for l_idx, line_item in enumerate(lines):
        txt = line_item["full_text"]
        opt_match = opt_start_re.match(txt)
        
        if opt_match or (txt.startswith('- ') and len(txt) > 2):
            in_options = True
            if opt_match:
                opt_body = opt_match.group(2).strip()
            else:
                opt_body = txt[2:].strip()
                
            options.append({
                "text": opt_body,
                "is_bold": line_item["is_bold"]
            })
        else:
            if not in_options:
                # Continuation of question title
                if q_text:
                    q_text += " " + txt
                else:
                    q_text = txt
            else:
                # Continuation of previous option or separate line option
                if options:
                    options[-1]["text"] += " " + txt
                    if line_item["is_bold"]:
                        options[-1]["is_bold"] = True
                        
    # If no options were matched by regex (e.g. Q442-Q456), treat each line after question text as an option
    if not options and lines:
        for line_item in lines:
            txt = line_item["full_text"].strip()
            if txt:
                options.append({
                    "text": txt,
                    "is_bold": line_item["is_bold"]
                })

    # Clean up option texts and find correct answer index
    clean_options = []
    correct_idx = 0  # Default fallback to 0 if not detected
    
    for opt_i, opt in enumerate(options):
        # Strip leading letter/bullet if remaining (e.g. "a. ", "a, ")
        cleaned_txt = re.sub(r'^[a-eA-E0-9][\.\,\/\)]\s*', '', opt["text"]).strip()
        cleaned_txt = re.sub(r'^[\-\*]\s*', '', cleaned_txt).strip()
        clean_options.append(cleaned_txt)
        
        if opt["is_bold"]:
            bold_indices.append(opt_i)

    if bold_indices:
        correct_idx = bold_indices[0]  # Pick first bold option as correct
    else:
        correct_idx = 0

    # Ensure minimum 2 options
    if len(clean_options) >= 2:
        final_questions.append({
            "id": len(final_questions) + 1,
            "original_num": rq["num_str"],
            "question": q_text,
            "options": clean_options,
            "correctAnswer": correct_idx,
            "page": rq["page"]
        })

print(f"Final valid structured questions count: {len(final_questions)}")

# Write to src/data/questions.json
with open('questions.json', 'w', encoding='utf-8') as f:
    json.dump(final_questions, f, ensure_ascii=False, indent=2)

print("Saved questions.json successfully!")
