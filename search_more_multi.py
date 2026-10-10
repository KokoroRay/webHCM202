import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('src/data/combined_questions.json', 'r', encoding='utf-8') as f:
    questions = json.load(f)

for q in questions:
    text = q['question']
    # Look for any digit followed by đáp án / phương án / khía cạnh / nội dung
    if re.search(r'\b(2|3|4|nhiều|các)\b\s*(đáp\s*án|phương\s*án|khía\s*cạnh|yếu\s*tố|nội\s*dung)', text, re.IGNORECASE):
        print(f"ID {q['id']} [Orig: {q.get('original_num')}]: {text}")
        print(f"   CorrectAnswer: {q.get('correctAnswer')}, CorrectAnswers: {q.get('correctAnswers')}\n")
