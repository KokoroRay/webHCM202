import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

def fix_all_datasets():
    orig_path = 'src/data/questions.json'
    supp_path = 'src/data/supplementary_questions.json'
    combined_path = 'src/data/combined_questions.json'

    with open(combined_path, 'r', encoding='utf-8') as f:
        questions = json.load(f)

    print(f"Processing {len(questions)} total questions...")

    fixed_count = 0

    for q in questions:
        stem = q['question'].strip()
        opts = list(q['options'])
        corr = q.get('correctAnswer', 0)

        # Fix 1: Strip leading option letter prefixes from option strings
        clean_opts = []
        for o in opts:
            o_str = str(o).strip()
            while True:
                m = re.match(r'^\s*([a-dA-D1-4])[\.\,\:\/\s\-\)]\s*(.*)', o_str)
                if m and len(m.group(1)) == 1:
                    o_str = m.group(2).strip()
                else:
                    break
            clean_opts.append(o_str)

        # Fix 2: If len(clean_opts) > 4 (e.g. 5, 6, 7, 8 options due to merged flashcard OCR),
        # keep only the 4 options matching the question context (or top 4 valid choices around correctAnswer)
        if len(clean_opts) > 4:
            # Check if there is a second question prompt in stem or options
            # e.g. "Option A. Option B. Option C. Option D. Theo Hồ Chí Minh..."
            # Find options that belong to this question
            valid_opts = []
            valid_corr = 0
            
            # If correctAnswer is valid index, take 4 options surrounding correctAnswer
            if corr < len(clean_opts):
                target_opt = clean_opts[corr]
                # Slice 4 items containing corr
                start = max(0, corr - 2)
                end = min(len(clean_opts), start + 4)
                if end - start < 4:
                    start = max(0, end - 4)
                valid_opts = clean_opts[start:end]
                valid_corr = valid_opts.index(target_opt) if target_opt in valid_opts else 0
            else:
                valid_opts = clean_opts[:4]
                valid_corr = 0

            clean_opts = valid_opts
            corr = valid_corr

        # Fix 3: Trim question stem if it contains trailing option choices or concatenated next question text
        # Remove trailing option text or question leaks
        if '?' in stem:
            q_parts = stem.split('?')
            stem = q_parts[0].strip() + '?'
        else:
            # Check if option 0 appears in stem
            for opt in clean_opts:
                if len(opt) >= 4 and opt in stem:
                    idx = stem.find(opt)
                    if idx >= 15:
                        stem = stem[:idx].strip()
                        stem = re.sub(r'[\s\,\-\:]+$', '', stem)
                        if not stem.endswith('.') and not stem.endswith('?') and not stem.endswith(':'):
                            stem += ':'
                        break

        # Remove extra noise text from stem
        stem = re.sub(r'\(Kieu\s*hoi\s*khac.*?\)', '', stem, flags=re.IGNORECASE)
        stem = re.sub(r'\(Ki?é?u\s*h?o?i?\s*kh?a?c?.*?\)', '', stem, flags=re.IGNORECASE)
        stem = stem.strip()

        # Update question object
        q['question'] = stem
        q['options'] = clean_opts
        q['correctAnswer'] = corr
        if 'correctAnswers' in q and isinstance(q['correctAnswers'], list):
            q['correctAnswers'] = [c for c in q['correctAnswers'] if c < len(clean_opts)]
            if not q['correctAnswers']:
                q['correctAnswers'] = [corr]
        else:
            q['correctAnswers'] = [corr]

        q['isMulti'] = len(q['correctAnswers']) > 1

    # Save back to questions.json & supplementary_questions.json & combined_questions.json
    orig_list = [q for q in questions if q.get('bank') == 'original' or q['id'] <= 614]
    supp_list = [q for q in questions if q.get('bank') == 'supplementary' or q['id'] > 614]

    with open(orig_path, 'w', encoding='utf-8') as f:
        json.dump(orig_list, f, ensure_ascii=False, indent=2)

    with open(supp_path, 'w', encoding='utf-8') as f:
        json.dump(supp_list, f, ensure_ascii=False, indent=2)

    with open(combined_path, 'w', encoding='utf-8') as f:
        json.dump(questions, f, ensure_ascii=False, indent=2)

    print(f"Successfully cleaned all {len(questions)} questions and saved JSON datasets!")

if __name__ == '__main__':
    fix_all_datasets()
