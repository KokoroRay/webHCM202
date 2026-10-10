import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

def find_multi():
    with open('src/data/combined_questions.json', 'r', encoding='utf-8') as f:
        questions = json.load(f)

    print(f"Total questions in combined bank: {len(questions)}")
    
    multi_list = []
    
    for idx, q in enumerate(questions):
        text = q['question']
        
        # Regex patterns for multi select instructions in Vietnamese
        # e.g. "chọn 2 phương án", "lựa chọn 3 đáp án", "chọn các phương án"
        m1 = re.search(r'chọn\s*(\d+)\s*(phương\s*án|đáp\s*án)', text, re.IGNORECASE)
        m2 = re.search(r'lựa\s*chọn\s*(\d+)\s*(phương\s*án|đáp\s*án)', text, re.IGNORECASE)
        m3 = re.search(r'chọn\s*(các|nhiều)\s*(phương\s*án|đáp\s*án)', text, re.IGNORECASE)
        
        if m1 or m2 or m3:
            num = 0
            if m1: num = int(m1.group(1))
            elif m2: num = int(m2.group(1))
            
            multi_list.append({
                "id": q['id'],
                "original_num": q.get('original_num'),
                "page": q.get('page'),
                "question": text,
                "options": q['options'],
                "num_to_select": num,
                "current_correctAnswer": q.get('correctAnswer')
            })

    print(f"Found {len(multi_list)} multi-select questions:")
    for m in multi_list:
        print(f"ID {m['id']} [{m['original_num']}] (Tr. {m['page']}): {m['question']}")
        print(f"   Target select count: {m['num_to_select']}")
        print(f"   Options ({len(m['options'])}): {m['options']}")
        print(f"   Current correctAnswer: {m['current_correctAnswer']}\n")

if __name__ == '__main__':
    find_multi()
