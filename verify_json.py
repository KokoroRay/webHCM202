import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('questions.json', 'r', encoding='utf-8') as f:
    qs = json.load(f)

print("Total questions in json:", len(qs))
indices = [0, 5, 10, 100, 441, 550, len(qs) - 1]
for i in indices:
    if i < len(qs):
        q = qs[i]
        print(f"\n=== Q{q['id']} (Page {q['page']}) ===")
        print("Question:", q['question'])
        print("Options:")
        for opt_idx, opt in enumerate(q['options']):
            marker = " (CORRECT)" if opt_idx == q['correctAnswer'] else ""
            print(f"  [{opt_idx}] {opt}{marker}")
