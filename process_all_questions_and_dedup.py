import json
import re
import sys
import os
import unicodedata
from difflib import SequenceMatcher

sys.stdout.reconfigure(encoding='utf-8')

def normalize_text(text):
    if not text:
        return ""
    text = text.lower()
    text = unicodedata.normalize('NFD', text)
    text = ''.join(c for c in text if unicodedata.category(c) != 'Mn')
    text = re.sub(r'[^a-z0-9\s]', '', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def similarity(a, b):
    na = normalize_text(a)
    nb = normalize_text(b)
    if not na or not nb:
        return 0.0
    return SequenceMatcher(None, na, nb).ratio()

def clean_text(s):
    if not s:
        return ""
    s = re.sub(r'\(NHUNG\s*HOANG\)', '', s, flags=re.IGNORECASE)
    s = re.sub(r'\(Ki?é?u\s*h?o?i?\s*kh?a?c?.*?\)', '', s, flags=re.IGNORECASE)
    s = re.sub(r'\(Danh\s*gi?a?\s*c?a?n?\s*b?o?.*?\)', '', s, flags=re.IGNORECASE)
    s = re.sub(r'^\s*[\(\（]\s*', '', s)
    s = re.sub(r'\s*[\)\）]\s*$', '', s)
    return s.strip()

# Option line regex: e.g. "A. Text", "A, Text", "a. Text", "a/ Text", "1. Text"
opt_regex = re.compile(r'^\s*([a-dA-D1-4])[\.\,\:\/\s\-\)]\s*(.*)')

# Answer badge regex: e.g. "A", "B", "C", "D", "a", "b", "c", "d"
badge_regex = re.compile(r'^\s*([a-dA-D])\s*$')

def parse_page_lines(lines, page_num):
    questions = []
    i = 0
    while i < len(lines):
        line = lines[i]
        
        # Check if line is start of an option (A. or a.)
        m_opt = opt_regex.match(line)
        if m_opt and m_opt.group(1).upper() == 'A':
            # Found option A!
            # Backtrack to collect question text & answer badge
            q_parts = []
            ans_letter = None
            
            b = i - 1
            while b >= 0:
                prev = lines[b]
                if opt_regex.match(prev):
                    break
                m_b = badge_regex.match(prev)
                if m_b and len(prev) == 1 and not ans_letter:
                    ans_letter = m_b.group(1).upper()
                else:
                    if not any(wm in prev for wm in ["HCM202", "NHUNG HOANG", "Thuat ng", "danh gia", "Ghep the"]):
                        q_parts.insert(0, prev)
                b -= 1

            q_text = clean_text(" ".join(q_parts))

            # Collect options starting at i
            options = []
            f = i
            while f < len(lines):
                o_line = lines[f]
                m_o = opt_regex.match(o_line)
                if m_o:
                    letter = m_o.group(1).upper()
                    # Map numeric options 1,2,3,4 to A,B,C,D
                    if letter == '1': letter = 'A'
                    elif letter == '2': letter = 'B'
                    elif letter == '3': letter = 'C'
                    elif letter == '4': letter = 'D'
                    
                    options.append({
                        "letter": letter,
                        "text": clean_text(m_o.group(2))
                    })
                    f += 1
                else:
                    # Append continuation text line if not option start or new question/badge
                    if options and not badge_regex.match(o_line) and not opt_regex.match(o_line):
                        options[-1]["text"] = clean_text(options[-1]["text"] + " " + o_line)
                        f += 1
                    else:
                        break

            # Process clean question & options
            if len(q_text) >= 8 and len(options) >= 2:
                clean_opts = [o['text'] for o in options if len(o['text']) > 0]
                
                # Determine correct answer index
                correct_idx = 0
                if ans_letter:
                    for o_i, o in enumerate(options):
                        if o['letter'] == ans_letter:
                            correct_idx = o_i

                if len(clean_opts) >= 2:
                    questions.append({
                        "question": q_text,
                        "options": clean_opts,
                        "correctAnswer": min(correct_idx, len(clean_opts) - 1),
                        "page": page_num
                    })

            i = max(f, i + 1)
        else:
            i += 1

    return questions

def run_extraction_and_dedup():
    if not os.path.exists('ocr_raw_cache.json'):
        print("ocr_raw_cache.json not found!")
        return

    with open('ocr_raw_cache.json', 'r', encoding='utf-8') as f:
        ocr_pages = json.load(f)

    with open('src/data/questions.json', 'r', encoding='utf-8') as f:
        original_bank = json.load(f)

    print(f"Loaded {len(ocr_pages)} OCR pages and {len(original_bank)} original questions.")

    extracted_qs = []
    for p in ocr_pages:
        lines = [l['text'].strip() for l in p['lines'] if l['text'].strip()]
        qs = parse_page_lines(lines, p['page'])
        extracted_qs.extend(qs)

    print(f"Extracted total {len(extracted_qs)} multiple-choice questions from OCR cache.")

    # Deduplicate against original 614 questions
    orig_normalized = [(q, normalize_text(q['question'])) for q in original_bank]

    duplicates = []
    supplementary = []

    for new_q in extracted_qs:
        new_norm = normalize_text(new_q['question'])
        if len(new_norm) < 10:
            continue

        best_match = None
        best_score = 0.0

        for orig_q, orig_norm in orig_normalized:
            if new_norm[:20] in orig_norm or orig_norm[:20] in new_norm:
                score = similarity(new_norm, orig_norm)
            else:
                score = SequenceMatcher(None, new_norm[:45], orig_norm[:45]).ratio()
                if score > 0.65:
                    score = similarity(new_norm, orig_norm)

            if score > best_score:
                best_score = score
                best_match = orig_q

        if best_score >= 0.72:
            duplicates.append({
                "page": new_q['page'],
                "new_question": new_q['question'],
                "matched_orig_id": best_match['id'],
                "matched_orig_question": best_match['question'],
                "similarity": round(best_score * 100, 1)
            })
        else:
            # Check internal duplicates inside supplementary list
            if not any(similarity(new_norm, normalize_text(s['question'])) > 0.82 for s in supplementary):
                supplementary.append({
                    "id": 614 + len(supplementary) + 1,
                    "original_num": f"Câu Bổ Sung #{len(supplementary) + 1}",
                    "question": new_q['question'],
                    "options": new_q['options'],
                    "correctAnswer": new_q['correctAnswer'],
                    "page": new_q['page'],
                    "isSupplementary": True
                })

    print(f"\n================ SUMMARY REPORT ================")
    print(f"Total pages processed: {len(ocr_pages)}")
    print(f"Total extracted from new PDF: {len(extracted_qs)}")
    print(f"Duplicate questions count (with original 614 bank): {len(duplicates)}")
    print(f"NEW Supplementary questions count: {len(supplementary)}")
    print(f"==================================================")

    # Save output files
    with open('src/data/supplementary_questions.json', 'w', encoding='utf-8') as f:
        json.dump(supplementary, f, ensure_ascii=False, indent=2)

    with open('duplicates_report.json', 'w', encoding='utf-8') as f:
        json.dump(duplicates, f, ensure_ascii=False, indent=2)

    print("Saved src/data/supplementary_questions.json & duplicates_report.json successfully!")

if __name__ == '__main__':
    run_extraction_and_dedup()
