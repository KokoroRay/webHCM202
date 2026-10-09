import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('src/data/questions.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

anomalies = []
for q in data:
    txt = q['question']
    # Check if question ends with pattern like ': a ...' or 'a "..."'
    if re.search(r'\:\s*[a-eA-E]\s+', txt) or re.search(r'\s+[a-eA-E]\s+[\"\“\”]', txt):
        anomalies.append(q)

print(f"Found {len(anomalies)} potential anomalies:")
for q in anomalies:
    print(f"ID {q['id']} ({q['original_num']}): {q['question']}")
    print("  Options:", q['options'])
    print("  Correct Answer:", q['correctAnswer'])
    print("-" * 50)
