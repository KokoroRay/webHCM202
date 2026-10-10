import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('src/data/combined_questions.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

multi_qs = []
for q in data:
    txt = q['question']
    if 'chọn' in txt.lower():
        multi_qs.append(q)

print(f"Total questions with 'chọn' in text: {len(multi_qs)}")
for q in multi_qs:
    qid = q['id']
    qtxt = q['question']
    ca = q.get('correctAnswer')
    cas = q.get('correctAnswers')
    print(f"ID {qid} [Orig: {q.get('original_num')}] (Page {q.get('page', '?')}): {qtxt}")
    print(f"   Options: {q['options']}")
    print(f"   Current correctAnswer: {ca}, correctAnswers: {cas}\n")
