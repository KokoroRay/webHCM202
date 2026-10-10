import json
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

def fix_442():
    paths = ['src/data/questions.json', 'src/data/supplementary_questions.json', 'src/data/combined_questions.json']

    for path in paths:
        if not os.path.exists(path):
            continue
        with open(path, 'r', encoding='utf-8') as f:
            data = json.load(f)

        for q in data:
            if q['id'] == 442:
                q['question'] = "Chọn câu trả lời đúng nhất theo TTHCM:"
                q['options'] = [
                    "ĐCS Việt Nam là Đảng của giai cấp công nhân, nhân dân lao động và của dân tộc Việt Nam",
                    "ĐCS Việt Nam là của giai cấp công nhân.",
                    "ĐCS Việt Nam là của nhân dân lao động.",
                    "ĐCS Việt Nam là của dân tộc Việt Nam."
                ]
                q['correctAnswer'] = 0
                q['correctAnswers'] = [0]
                q['isMulti'] = False

        with open(path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

        print(f"Fixed 442 in {path}")

if __name__ == '__main__':
    fix_442()
