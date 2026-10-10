import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

def analyze():
    with open('src/data/combined_questions.json', 'r', encoding='utf-8') as f:
        questions = json.load(f)

    print(f"Loaded {len(questions)} total questions.")

    dirty_questions = []
    dirty_options = []

    for q in questions:
        q_text = q['question']
        opts = q['options']

        # Check 1: Option prefixes in q['options'] (e.g. "A. ", "a. ", "B. ", "1. ")
        has_opt_prefix = False
        for opt in opts:
            if re.match(r'^\s*([a-dA-D1-4])[\.\,\:\/\s\-\)]\s*', opt):
                has_opt_prefix = True
                break
        if has_opt_prefix:
            dirty_options.append(q)

        # Check 2: Question text contains option text at the end
        # E.g. Question text has option text appended after '?' or at the end
        # E.g. "Câu hỏi là gì? Năm 1945. Năm 1930. Năm 1975. Năm 1954."
        # Or option text matches all or multiple choices in q['options']
        matched_opts = 0
        for opt in opts:
            clean_opt = opt.strip()
            # remove option prefix if any
            clean_opt = re.sub(r'^\s*([a-dA-D1-4])[\.\,\:\/\s\-\)]\s*', '', clean_opt).strip()
            if len(clean_opt) > 2 and clean_opt in q_text:
                matched_opts += 1
        
        if matched_opts >= 2:
            dirty_questions.append(q)

    print(f"Questions with option prefix in options array: {len(dirty_options)}")
    print(f"Questions where question text contains option choices: {len(dirty_questions)}")

    print("\n--- SAMPLE DIRTY QUESTIONS (Choices inside question text) ---")
    for q in dirty_questions[:10]:
        print(f"ID {q['id']} [{q.get('original_num')}] (Bank: {q.get('bank')}):")
        print(f"   Q: {q['question']}")
        print(f"   Opts: {q['options']}\n")

    print("\n--- SAMPLE DIRTY OPTIONS (Option prefix in options) ---")
    for q in dirty_options[:10]:
        print(f"ID {q['id']} [{q.get('original_num')}]:")
        print(f"   Opts: {q['options']}\n")

if __name__ == '__main__':
    analyze()
