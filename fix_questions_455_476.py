import json
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

def apply_explicit_fixes():
    paths = ['src/data/questions.json', 'src/data/supplementary_questions.json', 'src/data/combined_questions.json']

    explicit_fixes = {
        455: {
            "question": "Hiến pháp nào thể hiện rõ nhất tư tưởng dân chủ của Hồ Chí Minh, đặt cơ sở pháp lý đầu tiên cho việc thực hiện quyền lực của nhân dân?",
            "options": ["Hiến pháp năm 1946.", "Hiến pháp năm 1959.", "Hiến pháp năm 1980.", "Hiến pháp năm 1992."],
            "correctAnswer": 0,
            "correctAnswers": [0]
        },
        459: {
            "question": "Quyền dân chủ của nhân dân ta lần đầu tiên được thể hiện trong bản Hiến pháp nào?",
            "options": ["Hiến pháp 1946.", "Hiến pháp 1959.", "Hiến pháp 1980.", "Hiến pháp 1992."],
            "correctAnswer": 0,
            "correctAnswers": [0]
        },
        462: {
            "question": "Quyền nào dưới đây là một trong những nội dung của dân chủ trong lĩnh vực chính trị?",
            "options": ["Quyền ứng cử, bầu cử.", "Quyền tự do báo chí.", "Quyền lao động.", "Quyền sáng tác văn học."],
            "correctAnswer": 0,
            "correctAnswers": [0]
        },
        466: {
            "question": "Ở nước ta hiện nay công dân từ bao nhiêu tuổi thì có quyền ứng cử vào Quốc Hội?",
            "options": ["21 tuổi.", "20 tuổi.", "19 tuổi.", "18 tuổi."],
            "correctAnswer": 0,
            "correctAnswers": [0]
        },
        467: {
            "question": "Đảng ta lấy chủ nghĩa Mác - Lênin, tư tưởng Hồ Chí Minh làm nền tảng tư tưởng, kim chỉ nam cho hành động của Đảng. Được Đại hội Đảng lần thứ mấy xác định?",
            "options": ["Đại hội VII", "Đại hội VI", "Đại hội V", "Đại hội VIII"],
            "correctAnswer": 0,
            "correctAnswers": [0]
        },
        468: {
            "question": "Tư tưởng Hồ Chí Minh là hệ thống quan điểm toàn diện, sâu sắc về những vấn đề cơ bản của cách mạng Việt Nam, được đại hội Đảng lần thứ mấy khẳng định?",
            "options": ["Đại hội IX", "Đại hội X", "Đại hội XI", "Đại hội XII"],
            "correctAnswer": 0,
            "correctAnswers": [0]
        },
        476: {
            "question": "Cương lĩnh chính trị đầu tiên của Đảng, Hồ Chí Minh viết: (Chọn phương án đúng nhất)",
            "options": [
                "Làm tư sản dân quyền cách mạng và thổ địa cách mạng để đi tới xã hội cộng sản.",
                "Làm tư sản dân quyền cách mạng và thổ địa cách mạng.",
                "Làm tư sản dân quyền và thổ địa.",
                "Quá độ lên chủ nghĩa xã hội."
            ],
            "correctAnswer": 0,
            "correctAnswers": [0]
        },
        397: {
            "question": "Theo tư tưởng Hồ Chí Minh, con người Việt Nam trong thời đại mới phải có bao nhiêu phẩm chất cơ bản?",
            "options": ["3 phẩm chất cơ bản", "4 phẩm chất cơ bản", "5 phẩm chất cơ bản", "6 phẩm chất cơ bản"],
            "correctAnswer": 1,
            "correctAnswers": [1]
        },
        808: {
            "question": "Trong tư tưởng Hồ Chí Minh, Đảng lãnh đạo nhà nước bằng:",
            "options": [
                "Đường lối, quan điểm, chủ trương",
                "Pháp luật, chính sách, kế hoạch",
                "Qua các tổ chức Đảng, đảng viên trong bộ máy nhà nước",
                "Tất cả các phương án trên"
            ],
            "correctAnswer": 3,
            "correctAnswers": [3]
        }
    }

    for path in paths:
        if not os.path.exists(path):
            continue
        with open(path, 'r', encoding='utf-8') as f:
            data = json.load(f)

        for q in data:
            if q['id'] in explicit_fixes:
                fix = explicit_fixes[q['id']]
                q['question'] = fix['question']
                q['options'] = fix['options']
                q['correctAnswer'] = fix['correctAnswer']
                q['correctAnswers'] = fix['correctAnswers']
                q['isMulti'] = len(fix['correctAnswers']) > 1

        with open(path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

        print(f"Applied fixes to {path}")

if __name__ == '__main__':
    apply_explicit_fixes()
