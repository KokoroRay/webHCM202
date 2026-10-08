import sys
import json
import re

sys.stdout.reconfigure(encoding='utf-8')

# Import our prototype parser or run analysis on questions list
from parse_all_questions import questions

print(f"Total questions parsed: {len(questions)}")

no_options = []
no_bold = []
multi_bold = []
single_bold = []

for idx, q in enumerate(questions):
    bold_opts = [opt for opt in q["options"] if opt["is_bold"]]
    if len(q["options"]) == 0:
        no_options.append((idx, q))
    elif len(bold_opts) == 0:
        no_bold.append((idx, q))
    elif len(bold_opts) == 1:
        single_bold.append((idx, q))
    else:
        multi_bold.append((idx, q))

print(f"Single bold option count: {len(single_bold)}")
print(f"No bold option count: {len(no_bold)}")
print(f"Multiple bold options count: {len(multi_bold)}")
print(f"No options count: {len(no_options)}")

print("\n--- SAMPLE NO BOLD QUESTIONS ---")
for idx, q in no_bold[:5]:
    print(f"Index {idx} | Num: {q['num']} | Question: {q['question']}")
    for opt in q["options"]:
        print(f"  {opt['letter']}. {opt['text']}")
    print("-" * 30)

print("\n--- SAMPLE MULTI BOLD QUESTIONS ---")
for idx, q in multi_bold[:5]:
    print(f"Index {idx} | Num: {q['num']} | Question: {q['question']}")
    for opt in q["options"]:
        print(f"  [{'X' if opt['is_bold'] else ' '}] {opt['letter']}. {opt['text']}")
    print("-" * 30)
