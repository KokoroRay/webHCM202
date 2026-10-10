import json
import re
import sys
import unicodedata
from difflib import SequenceMatcher

sys.stdout.reconfigure(encoding='utf-8')

def normalize_text(text):
    """Normalize text by converting to lowercase, removing accents and punctuation."""
    if not text:
        return ""
    text = text.lower()
    # Remove accents/diacritics
    text = unicodedata.normalize('NFD', text)
    text = ''.join(c for c in text if unicodedata.category(c) != 'Mn')
    # Remove non-alphanumeric chars
    text = re.sub(r'[^a-z0-9\s]', '', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def similarity_ratio(a, b):
    return SequenceMatcher(None, normalize_text(a), normalize_text(b)).ratio()

def load_original_bank():
    with open('src/data/questions.json', 'r', encoding='utf-8') as f:
        original = json.load(f)
    print(f"Loaded original question bank: {len(original)} questions.")
    return original

def parse_ocr_cache():
    if not os.path.exists('ocr_raw_cache.json'):
        print("ocr_raw_cache.json does not exist yet!")
        return []

    with open('ocr_raw_cache.json', 'r', encoding='utf-8') as f:
        pages = json.load(f)

    print(f"Parsing questions from {len(pages)} OCR pages...")
    
    parsed_questions = []
    
    for p in pages:
        lines = [l['text'].strip() for l in p['lines'] if l['text'].strip()]
        
        idx = 0
        while idx < len(lines):
            line = lines[idx]
            
            # Skip watermarks & headers
            if any(wm in line for wm in ["NHUNG HOANG", "Thuat ngup trong", "Thuat ngu trong", "Ghep the", "Khoi hop", "Da quy"]):
                idx += 1
                continue

            # Look for question & answer pattern
            # Pattern: Option A, B, C, D lines coming after a question
            if re.match(r'^[A-D][\.\,\s]', line) or line in ["A", "B", "C", "D"]:
                # Backtrack to find question text before options
                q_text_parts = []
                back = idx - 1
                while back >= 0 and not re.match(r'^[A-D][\.\,\s]', lines[back]) and lines[back] not in ["A", "B", "C", "D"]:
                    if not any(wm in lines[back] for wm in ["NHUNG HOANG", "Thuat ngup", "Thuat ngu"]):
                        q_text_parts.insert(0, lines[back])
                    back -= 1

                q_text = " ".join(q_text_parts).strip()
                # Clean watermark inside q_text
                q_text = re.sub(r'\(NHUNG\s*HOANG\)', '', q_text, flags=re.IGNORECASE).strip()
                q_text = re.sub(r'\(Kieu\s*hoi\s*khac.*?\)', '', q_text, flags=re.IGNORECASE).strip()

                # Collect options starting at current idx
                options = []
                correct_ans_idx = 0
                
                # Check if current line is single letter answer badge
                if line in ["A", "B", "C", "D"]:
                    ans_letter = line
                    idx += 1
                else:
                    ans_letter = 'A'

                while idx < len(lines):
                    opt_line = lines[idx]
                    opt_match = re.match(r'^([A-D])[\.\,\s\:\/](.*)', opt_line)
                    if opt_match:
                        letter = opt_match.group(1)
                        opt_body = opt_match.group(2).strip()
                        options.append({
                            "letter": letter,
                            "text": opt_body
                        })
                        idx += 1
                    else:
                        # If line belongs to previous option body
                        if options and not any(wm in opt_line for wm in ["NHUNG HOANG", "Thuat ngup", "Thuat ngu"]):
                            options[-1]["text"] += " " + opt_line
                            idx += 1
                        else:
                            break

                if len(q_text) > 10 and len(options) >= 2:
                    # Clean option texts
                    clean_opts = [re.sub(r'^\(NHUNG\s*HOANG\)', '', o["text"]).strip() for o in options]
                    clean_opts = [re.sub(r'^\(Kieu\s*hoi\s*khac.*?\)', '', opt).strip() for opt in clean_opts]
                    
                    # Correct answer index
                    correct_idx = 0
                    for o_i, o in enumerate(options):
                        if o["letter"] == ans_letter:
                            correct_idx = o_i

                    parsed_questions.append({
                        "question": q_text,
                        "options": clean_opts,
                        "correctAnswer": correct_idx,
                        "page": p["page"]
                    })
            else:
                idx += 1

    print(f"Extracted {len(parsed_questions)} raw questions from OCR cache.")
    return parsed_questions

if __name__ == '__main__':
    import os
    original_bank = load_original_bank()
    ocr_questions = parse_ocr_cache()

    duplicates = []
    supplementary = []

    orig_normalized = [(q, normalize_text(q['question'])) for q in original_bank]

    for new_q in ocr_questions:
        new_norm = normalize_text(new_q['question'])
        if len(new_norm) < 15:
            continue

        best_match = None
        best_score = 0.0

        for orig_q, orig_norm in orig_normalized:
            # Quick check if first 30 chars match
            if new_norm[:30] in orig_norm or orig_norm[:30] in new_norm:
                score = similarity_ratio(new_norm, orig_norm)
            else:
                score = SequenceMatcher(None, new_norm[:50], orig_norm[:50]).ratio()
                if score > 0.7:
                    score = similarity_ratio(new_norm, orig_norm)

            if score > best_score:
                best_score = score
                best_match = orig_q

        if best_score >= 0.75:
            duplicates.append({
                "new_question": new_q['question'],
                "matched_question": best_match['question'],
                "matched_id": best_match['id'],
                "similarity": round(best_score * 100, 1)
            })
        else:
            # Check deduplication within supplementary list itself
            if not any(similarity_ratio(new_norm, normalize_text(s['question'])) > 0.85 for s in supplementary):
                supplementary.append(new_q)

    print(f"\n--- COMPARISON RESULTS ---")
    print(f"Total OCR questions extracted: {len(ocr_questions)}")
    print(f"Duplicate questions count: {len(duplicates)}")
    print(f"Unique Supplementary questions count: {len(supplementary)}")

    with open('supplementary_questions.json', 'w', encoding='utf-8') as f:
        json.dump(supplementary, f, ensure_ascii=False, indent=2)

    with open('duplicates_report.json', 'w', encoding='utf-8') as f:
        json.dump(duplicates, f, ensure_ascii=False, indent=2)

    print("\nSaved supplementary_questions.json and duplicates_report.json!")
