import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('ocr_raw_cache.json', 'r', encoding='utf-8') as f:
    pages = json.load(f)

page10 = [p for p in pages if p['page'] == 10][0]
lines = [l['text'].strip() for l in page10['lines'] if l['text'].strip()]

opt_re = re.compile(r'^\s*([a-dA-D1-4])[\.\,\:\/\s\-\)]\s*(.*)')
ans_badge_re = re.compile(r'^\s*([a-dA-D])\s*$')

def parse_page_lines(lines):
    questions = []
    i = 0
    while i < len(lines):
        # Scan forward for the first option line (A. or a.)
        if opt_re.match(lines[i]):
            # Start of options!
            # Backtrack to find question text and optional answer badge
            q_parts = []
            ans_letter = None
            
            b = i - 1
            while b >= 0:
                p_line = lines[b]
                if opt_re.match(p_line):
                    break
                m_b = ans_badge_re.match(p_line)
                if m_b and not ans_letter and len(p_line) == 1:
                    ans_letter = m_b.group(1).upper()
                else:
                    q_parts.insert(0, p_line)
                b -= 1

            q_text = " ".join(q_parts).strip()

            # Now collect all options starting at i
            options = []
            f = i
            while f < len(lines):
                o_line = lines[f]
                m_opt = opt_re.match(o_line)
                if m_opt:
                    options.append({
                        "letter": m_opt.group(1).upper(),
                        "text": m_opt.group(2).strip()
                    })
                    f += 1
                else:
                    # If not an option start, and not start of next question/badge, append to last option
                    if options and not ans_badge_re.match(o_line) and not opt_re.match(o_line):
                        options[-1]["text"] += " " + o_line
                        f += 1
                    else:
                        break

            if len(q_text) >= 8 and len(options) >= 2:
                # Deduce correct answer index
                correct_idx = 0
                if ans_letter:
                    for o_i, o in enumerate(options):
                        if o["letter"] == ans_letter:
                            correct_idx = o_i

                questions.append({
                    "question": q_text,
                    "ans_letter": ans_letter,
                    "correct_idx": correct_idx,
                    "options": options
                })
            
            i = max(f, i + 1)
        else:
            i += 1

    return questions

qs = parse_page_lines(lines)
print(f"Successfully parsed {len(qs)} questions on Page 10:")
for idx, q in enumerate(qs):
    print(f"\nQ{idx+1}: {q['question']}")
    print(f"   Ans Letter: {q['ans_letter']} (Index: {q['correct_idx']})")
    for o in q['options']:
        print(f"   [{o['letter']}] {o['text']}")
