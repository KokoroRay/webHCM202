import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('src/data/combined_questions.json', 'r', encoding='utf-8') as f:
    questions = json.load(f)

print(f"Loaded {len(questions)} questions.")

broken = []
for q in questions:
    opts = q['options']
    # Check if options count > 4 or any option looks like question text fragment
    is_broken = False
    if len(opts) > 4:
        is_broken = True
    else:
        for opt in opts:
            if opt.endswith('?') or opt.endswith('nào?') or opt.endswith('đúng nhất)') or opt.endswith('bản'):
                is_broken = True
                break

    if is_broken:
        broken.append(q)

print(f"Found {len(broken)} questions with potential option array issues:")
for q in broken:
    print(f"ID {q['id']} [{q.get('original_num')}]:")
    print(f"   Q: {q['question']}")
    print(f"   Opts ({len(q['options'])}): {q['options']}")
    print(f"   CorrectAnswer: {q.get('correctAnswer')}, CorrectAnswers: {q.get('correctAnswers')}\n")
