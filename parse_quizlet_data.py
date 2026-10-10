import json
import re
import sys
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

def clean_watermarks(text):
    text = re.sub(r'\(NHUNG\s*HOANG\)', '', text, flags=re.IGNORECASE)
    text = re.sub(r'\(Kieu\s*hoi\s*khac.*?\)', '', text, flags=re.IGNORECASE)
    text = re.sub(r'\(Danh\s*gia\s*can\s*bo.*?\)', '', text, flags=re.IGNORECASE)
    return text.strip()

def run_parse():
    if not os.path.exists('ocr_raw_cache.json'):
        print("ocr_raw_cache.json not found!")
        return

    with open('ocr_raw_cache.json', 'r', encoding='utf-8') as f:
        pages = json.load(f)

    with open('src/data/questions.json', 'r', encoding='utf-8') as f:
        original_bank = json.load(f)

    print(f"Loaded {len(pages)} OCR pages and {len(original_bank)} original questions.")

    extracted_questions = []

    for page in pages:
        lines = [clean_watermarks(l['text']) for l in page['lines'] if l['text'].strip()]
        lines = [l for l in lines if l and not any(h in l for h in ["HCM202", "NHUNG HOANG", "Thuat ngu trong", "Ghep the", "Khoi hop", "Da quy", "15 nguoi hoc"])]

        idx = 0
        while idx < len(lines):
            line = lines[idx]
            
            # Check if line is an answer key badge (e.g., single letter A, B, C, D or a, b, c, d)
            if line in ["A", "B", "C", "D", "a", "b", "c", "d"]:
                ans_letter = line.upper()
                
                # Backtrack to get question text
                q_lines = []
                b_idx = idx - 1
                while b_idx >= 0:
                    prev_line = lines[b_idx]
                    if prev_line in ["A", "B", "C", "D", "a", "b", "c", "d"] or re.match(r'^[A-Da-d][\.\,\s\:\/]', prev_line):
                        break
                    q_lines.insert(0, prev_line)
                    b_idx -= 1
                
                q_text = " ".join(q_lines).strip()
                q_text = re.sub(r'\(.*?\)', '', q_text).strip()

                # Forward track to get options
                options = []
                f_idx = idx + 1
                while f_idx < len(lines):
                    opt_line = lines[f_idx]
                    opt_match = re.match(r'^([A-Da-d])[\.\,\s\:\/](.*)', opt_line)
                    if opt_match:
                        opt_letter = opt_match.group(1).upper()
                        opt_body = opt_match.group(2).strip()
                        options.append({
                            "letter": opt_letter,
                            "text": opt_body
                        })
                        f_idx += 1
                    else:
                        # Append to previous option body if line doesn't start new question/badge
                        if options and not opt_line in ["A", "B", "C", "D", "a", "b", "c", "d"]:
                            options[-1]["text"] += " " + opt_line
                            f_idx += 1
                        else:
                            break

                if len(q_text) >= 10 and len(options) >= 2:
                    # Clean options
                    clean_opts = [re.sub(r'^[A-Da-d][\.\,\s\:\/]\s*', '', o['text']).strip() for o in options]
                    clean_opts = [re.sub(r'\(.*?\)', '', o).strip() for o in clean_opts]
                    
                    correct_idx = 0
                    for o_i, o in enumerate(options):
                        if o['letter'] == ans_letter:
                            correct_idx = o_i

                    extracted_questions.append({
                        "question": q_text,
                        "options": clean_opts,
                        "correctAnswer": correct_idx,
                        "ansLetter": ans_letter,
                        "page": page['page']
                    })

                idx = f_idx
            else:
                idx += 1

    print(f"Extracted {len(extracted_questions)} question candidates from OCR cache.")

    # Deduplicate extracted questions against original 614 bank
    orig_normalized = [(q, normalize_text(q['question'])) for q in original_bank]

    duplicates = []
    supplementary = []

    for new_q in extracted_questions:
        new_norm = normalize_text(new_q['question'])
        if len(new_norm) < 10:
            continue

        best_match = None
        best_score = 0.0

        for orig_q, orig_norm in orig_normalized:
            # Check similarity
            if new_norm[:25] in orig_norm or orig_norm[:25] in new_norm:
                score = similarity(new_norm, orig_norm)
            else:
                score = SequenceMatcher(None, new_norm[:40], orig_norm[:40]).ratio()
                if score > 0.65:
                    score = similarity(new_norm, orig_norm)

            if score > best_score:
                best_score = score
                best_match = orig_q

        if best_score >= 0.72:
            duplicates.append({
                "ocr_page": new_q['page'],
                "new_question": new_q['question'],
                "matched_orig_id": best_match['id'],
                "matched_orig_question": best_match['question'],
                "similarity": round(best_score * 100, 1)
            })
        else:
            # Check internal deduplication within supplementary list
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
    print(f"Total extracted from new PDF: {len(extracted_questions)}")
    print(f"Duplicate questions count (with original 614 bank): {len(duplicates)}")
    print(f"NEW Supplementary questions count: {len(supplementary)}")
    print(f"==================================================")

    # Save output files
    with open('src/data/supplementary_questions.json', 'w', encoding='utf-8') as f:
        json.dump(supplementary, f, ensure_ascii=False, indent=2)

    with open('duplicates_report.json', 'w', encoding='utf-8') as f:
        json.dump(duplicates, f, ensure_ascii=False, indent=2)

    print("Saved src/data/supplementary_questions.json and duplicates_report.json successfully!")

if __name__ == '__main__':
    import os
    run_parse()
