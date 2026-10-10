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

def clean_str(s):
    if not s:
        return ""
    s = re.sub(r'\(NHUNG\s*HOANG\)', '', s, flags=re.IGNORECASE)
    s = re.sub(r'\(Ki?é?u\s*h?o?i?\s*kh?a?c?.*?\)', '', s, flags=re.IGNORECASE)
    s = re.sub(r'\(Danh\s*gi?a?\s*c?a?n?\s*b?o?.*?\)', '', s, flags=re.IGNORECASE)
    s = re.sub(r'^\s*[\(\（]\s*', '', s)
    s = re.sub(r'\s*[\)\）]\s*$', '', s)
    return s.strip()

def parse_all_pages():
    if not os.path.exists('ocr_raw_cache.json'):
        print("ocr_raw_cache.json not found!")
        return []

    with open('ocr_raw_cache.json', 'r', encoding='utf-8') as f:
        pages = json.load(f)

    print(f"Parsing Quizlet structure from {len(pages)} OCR pages...")
    extracted_questions = []

    for p in pages:
        page_num = p['page']
        lines = [l['text'].strip() for l in p['lines'] if l['text'].strip()]
        
        # Filter out headers/footers
        lines = [l for l in lines if not any(w in l for w in ["HCM202", "NHUNG HOANG SOURCE", "Ghep the", "Khoi hop", "Da quy", "Thuat ng", "danh gia"])]

        i = 0
        while i < len(lines):
            line = lines[i]
            
            # Check if line is answer badge: A, B, C, D, a, b, c, d
            if line in ["A", "B", "C", "D", "a", "b", "c", "d"] and i > 0:
                ans_letter = line.upper()
                
                # Backtrack to collect question text
                q_parts = []
                b = i - 1
                while b >= 0:
                    prev = lines[b]
                    if prev in ["A", "B", "C", "D", "a", "b", "c", "d"] or re.match(r'^[A-Da-d][\.\,\s\:\/]', prev):
                        break
                    q_parts.insert(0, prev)
                    b -= 1

                q_text = clean_str(" ".join(q_parts))

                # Collect options starting at i+1
                options = []
                f = i + 1
                while f < len(lines):
                    opt_line = lines[f]
                    opt_match = re.match(r'^([A-Da-d])[\.\,\s\:\/](.*)', opt_line)
                    if opt_match:
                        opt_let = opt_match.group(1).upper()
                        opt_txt = clean_str(opt_match.group(2))
                        options.append({
                            "letter": opt_let,
                            "text": opt_txt
                        })
                        f += 1
                    else:
                        # Append to last option body if line doesn't start new option/badge
                        if options and opt_line not in ["A", "B", "C", "D", "a", "b", "c", "d"]:
                            options[-1]["text"] = clean_str(options[-1]["text"] + " " + opt_line)
                            f += 1
                        else:
                            break

                if len(q_text) >= 8 and len(options) >= 2:
                    # Clean options
                    clean_opts = [re.sub(r'^[A-Da-d][\.\,\s\:\/]\s*', '', o['text']).strip() for o in options]
                    clean_opts = [clean_str(o) for o in clean_opts if o.strip()]
                    
                    correct_idx = 0
                    for o_i, o in enumerate(options):
                        if o['letter'] == ans_letter:
                            correct_idx = o_i

                    if len(clean_opts) >= 2:
                        extracted_questions.append({
                            "question": q_text,
                            "options": clean_opts,
                            "correctAnswer": min(correct_idx, len(clean_opts) - 1),
                            "ansLetter": ans_letter,
                            "page": page_num
                        })
                
                i = max(f, i + 1)
            else:
                i += 1

    print(f"Extracted {len(extracted_questions)} question candidates.")
    return extracted_questions

def main():
    with open('src/data/questions.json', 'r', encoding='utf-8') as f:
        original_bank = json.load(f)

    ocr_qs = parse_all_pages()
    if not ocr_qs:
        return

    orig_normalized = [(q, normalize_text(q['question'])) for q in original_bank]

    duplicates = []
    supplementary = []

    for new_q in ocr_qs:
        new_norm = normalize_text(new_q['question'])
        if len(new_norm) < 10:
            continue

        best_match = None
        best_score = 0.0

        for orig_q, orig_norm in orig_normalized:
            if new_norm[:20] in orig_norm or orig_norm[:20] in new_norm:
                score = similarity(new_norm, orig_norm)
            else:
                score = SequenceMatcher(None, new_norm[:40], orig_norm[:40]).ratio()
                if score > 0.6:
                    score = similarity(new_norm, orig_norm)

            if score > best_score:
                best_score = score
                best_match = orig_q

        if best_score >= 0.70:
            duplicates.append({
                "page": new_q['page'],
                "new_question": new_q['question'],
                "matched_id": best_match['id'],
                "matched_question": best_match['question'],
                "similarity_percent": round(best_score * 100, 1)
            })
        else:
            # Check internal duplicates inside supplementary list
            if not any(similarity(new_norm, normalize_text(s['question'])) > 0.80 for s in supplementary):
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
    print(f"Total extracted from new PDF: {len(ocr_qs)}")
    print(f"Duplicate questions count (matched with original 614 bank): {len(duplicates)}")
    print(f"NEW Supplementary questions count: {len(supplementary)}")
    print(f"==================================================")

    # Save output files
    with open('src/data/supplementary_questions.json', 'w', encoding='utf-8') as f:
        json.dump(supplementary, f, ensure_ascii=False, indent=2)

    with open('duplicates_report.json', 'w', encoding='utf-8') as f:
        json.dump(duplicates, f, ensure_ascii=False, indent=2)

    print("Saved supplementary_questions.json & duplicates_report.json successfully!")

if __name__ == '__main__':
    main()
