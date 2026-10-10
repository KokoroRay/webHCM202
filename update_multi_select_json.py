import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

def update_datasets():
    # Load all 3 files
    with open('src/data/questions.json', 'r', encoding='utf-8') as f:
        orig = json.load(f)

    supp = []
    if os.path.exists('src/data/supplementary_questions.json'):
        with open('src/data/supplementary_questions.json', 'r', encoding='utf-8') as f:
            supp = json.load(f)

    # Multi-select map: question ID -> list of correct option indices
    # We can also detect questions based on text regex if any new ones are found
    multi_map = {
        490: [0, 1],       # Lựa chọn 2 đáp án đúng: A & B
        496: [0, 1, 2],    # Chọn 3 phương án đúng: A, B & C
    }

    # Process original bank
    for q in orig:
        qid = q['id']
        if qid in multi_map:
            q['correctAnswers'] = multi_map[qid]
            q['isMulti'] = True
        else:
            if 'correctAnswers' not in q:
                q['correctAnswers'] = [q['correctAnswer']]
            q['isMulti'] = len(q['correctAnswers']) > 1

    # Process supplementary bank
    for q in supp:
        qid = q['id']
        if qid in multi_map:
            q['correctAnswers'] = multi_map[qid]
            q['isMulti'] = True
        else:
            if 'correctAnswers' not in q:
                q['correctAnswers'] = [q['correctAnswer']]
            q['isMulti'] = len(q['correctAnswers']) > 1

    # Save questions.json and supplementary_questions.json
    with open('src/data/questions.json', 'w', encoding='utf-8') as f:
        json.dump(orig, f, ensure_ascii=False, indent=2)

    with open('src/data/supplementary_questions.json', 'w', encoding='utf-8') as f:
        json.dump(supp, f, ensure_ascii=False, indent=2)

    # Combine
    combined = orig + supp
    with open('src/data/combined_questions.json', 'w', encoding='utf-8') as f:
        json.dump(combined, f, ensure_ascii=False, indent=2)

    print("Updated datasets successfully with multi-select metadata!")

import os
if __name__ == '__main__':
    update_datasets()
