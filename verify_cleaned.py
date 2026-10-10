import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('src/data/combined_questions.json', 'r', encoding='utf-8') as f:
    qs = json.load(f)

for q in qs:
    if q['id'] in [444, 442, 445, 459, 476]:
        print(f"ID {q['id']}:")
        print(f"   Q: {q['question']}")
        print(f"   Opts: {q['options']}\n")
