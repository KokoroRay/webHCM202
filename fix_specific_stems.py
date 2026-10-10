import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

def fix_stems():
    paths = ['src/data/questions.json', 'src/data/supplementary_questions.json', 'src/data/combined_questions.json']

    fixes = {
        476: "Cương lĩnh chính trị đầu tiên của Đảng, Hồ Chí Minh viết: (Chọn phương án đúng nhất)",
        471: "Năm 1911, Hồ Chí Minh quyết định ra đi tìm đường cứu nước, Người khảo sát ở:",
        475: "Nói tới dân tộc thì vấn đề dân tộc được C.Mác và V.I .Lênin bàn nhiều về:",
        477: "Tháng 8/1945, câu nói bất hủ của Hồ Chí Minh là:",
        460: "Chủ trương trong quan hệ quốc tế của nước ta hiện nay là:",
        461: "Một trong những quan điểm của Hồ Chí Minh về xây dựng đạo đức mới là:",
        464: "Theo Hồ Chí Minh, Đảng cộng sản Việt Nam là Đảng của:",
        465: "Hồ Chí Minh coi sức mạnh của đạo đức là:",
        458: "Trong tư tưởng Hồ Chí Minh lực lượng chủ yếu của khối đại đoàn kết dân tộc là:",
    }

    for path in paths:
        if not os.path.exists(path):
            continue
        with open(path, 'r', encoding='utf-8') as f:
            data = json.load(f)

        updated = False
        for q in data:
            if q['id'] in fixes:
                q['question'] = fixes[q['id']]
                updated = True
            # Extra cleanup: Ensure option strings don't have leading A. B. C. D.
            clean_opts = []
            for opt in q['options']:
                opt_str = opt.strip()
                import re
                m = re.match(r'^\s*([a-dA-D1-4])[\.\,\:\/\s\-\)]\s*(.*)', opt_str)
                if m and len(m.group(1)) == 1:
                    opt_str = m.group(2).strip()
                clean_opts.append(opt_str)
            if clean_opts != q['options']:
                q['options'] = clean_opts
                updated = True

        if updated:
            with open(path, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            print(f"Updated {path}")

import os
if __name__ == '__main__':
    fix_stems()
