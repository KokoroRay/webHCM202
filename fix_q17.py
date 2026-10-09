import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

for filepath in ['questions.json', 'src/data/questions.json']:
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    for q in data:
        if q['id'] == 17:
            q['question'] = 'Theo Hồ Chí Minh, bọn đế quốc thực dân tuyên truyền khẩu hiệu "độc lập tự do" thực chất là che đậy bản chất:'
            q['options'] = [
                '"ăn cướp" và "giết người"',
                '"ăn cắp" và "hại dân"',
                '"bóc lột" và "đàn áp"',
                '"cướp bóc" và "đàn áp".'
            ]
            q['correctAnswer'] = 0
            print(f"Updated Question 17 in {filepath}")
            
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
