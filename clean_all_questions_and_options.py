import json
import re
import sys
import os

sys.stdout.reconfigure(encoding='utf-8')

def clean_all_datasets():
    # Load questions.json, supplementary_questions.json, combined_questions.json
    orig_path = 'src/data/questions.json'
    supp_path = 'src/data/supplementary_questions.json'
    combined_path = 'src/data/combined_questions.json'

    with open(combined_path, 'r', encoding='utf-8') as f:
        questions = json.load(f)

    cleaned_questions = 0
    cleaned_options = 0

    for q in questions:
        orig_q = q['question']
        orig_opts = list(q['options'])

        # Step 1: Clean options array (remove leading A., B., C., D., a., b., c., d., 1., 2., etc.)
        new_opts = []
        for opt in orig_opts:
            clean_opt = opt.strip()
            # Iteratively strip prefixes like "A.", "a)", "A, ", "1. ", "a/ "
            while True:
                m = re.match(r'^\s*([a-dA-D1-4])[\.\,\:\/\s\-\)]\s*(.*)', clean_opt)
                if m and len(m.group(1)) == 1:
                    clean_opt = m.group(2).strip()
                else:
                    break
            new_opts.append(clean_opt)

        if new_opts != orig_opts:
            q['options'] = new_opts
            cleaned_options += 1

        # Step 2: Clean question stem (remove concatenated choices at end of question text)
        q_text = orig_q.strip()

        # Check if question has '?' and text after '?' contains option strings
        if '?' in q_text:
            q_parts = q_text.split('?')
            # The stem is everything up to the first '?' (or last valid '?')
            stem = q_parts[0].strip() + '?'
            remainder = "?".join(q_parts[1:]).strip()

            if remainder:
                # If remainder matches options or option letters
                remainder_is_opts = False
                for opt in new_opts:
                    if len(opt) >= 2 and opt in remainder:
                        remainder_is_opts = True
                        break
                
                if remainder_is_opts or re.match(r'^\s*([a-dA-D1-4][\.\,\:\/\s\-\)]|[A-D]\b|Năm\b)', remainder):
                    q_text = stem

        # If question does not have '?' but choices are appended
        if q_text == orig_q and new_opts:
            # Check if options 0, 1, 2, 3 appear sequentially in q_text
            # Find earliest occurrence of option 0 or option 1 text in q_text
            earliest = len(q_text)
            for opt in new_opts:
                if len(opt) >= 3:
                    # Find opt in q_text
                    idx = q_text.find(opt)
                    # Must not be right at start of question text (min 15 chars in stem)
                    if idx >= 15 and idx < earliest:
                        # Check if preceding character is whitespace or colon or punctuation
                        earliest = idx

            if earliest < len(q_text):
                stem = q_text[:earliest].strip()
                # Remove trailing trailing punctuation or broken instructions
                stem = re.sub(r'[\s\,\-\:]+$', '', stem)
                # Keep prompt if needed (e.g. ":")
                if not stem.endswith('.') and not stem.endswith('?') and not stem.endswith(':'):
                    stem += ':'
                q_text = stem

        # Specific manual fixes for edge cases if any
        if q['id'] == 445:
            q_text = "Theo TTHCM, ĐCS Việt Nam ra đời là sản phẩm của sự kết hợp CNMLN với phong trào công nhân và phong trào yêu nước là:"
            q['options'] = [
                "Xác định nguồn gốc ra đời của đảng.",
                "Xác định nhiệm vụ của Đảng.",
                "Xác định bản chất của đảng.",
                "Xác định năng lực của đảng."
            ]

        if q['id'] == 450:
            q_text = "Tư tưởng đại đoàn kết dân tộc của Hồ Chí Minh được hình thành dựa trên cơ sở nào?"
            q['options'] = [
                "Từ truyền thống đoàn kết nhân ái, tinh thần gắn kết cộng đồng dân tộc Việt Nam",
                "Từ quan điểm của chủ nghĩa Mác –Lênin về vai trò của quần chúng nhân dân",
                "Từ thực tiễn thành công và thất bại của phong trào cách mạng Việt Nam và thế giới",
                "Tất cả các phương án đều đúng."
            ]

        if q_text != orig_q:
            print(f"ID {q['id']} [{q.get('original_num')}]:")
            print(f"   BEFORE: {orig_q}")
            print(f"   AFTER : {q_text}\n")
            q['question'] = q_text
            cleaned_questions += 1

    print(f"Total questions cleaned stems: {cleaned_questions}")
    print(f"Total options cleaned prefixes: {cleaned_options}")

    # Split back into questions.json & supplementary_questions.json
    orig_list = [q for q in questions if q.get('bank') == 'original' or q['id'] <= 614]
    supp_list = [q for q in questions if q.get('bank') == 'supplementary' or q['id'] > 614]

    with open(orig_path, 'w', encoding='utf-8') as f:
        json.dump(orig_list, f, ensure_ascii=False, indent=2)

    with open(supp_path, 'w', encoding='utf-8') as f:
        json.dump(supp_list, f, ensure_ascii=False, indent=2)

    with open(combined_path, 'w', encoding='utf-8') as f:
        json.dump(questions, f, ensure_ascii=False, indent=2)

    print("Successfully cleaned and saved all dataset files!")

if __name__ == '__main__':
    clean_all_datasets()
