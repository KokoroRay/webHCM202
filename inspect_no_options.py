import sys
import json
import re

sys.stdout.reconfigure(encoding='utf-8')
from parse_all_questions import questions

no_options = [q for q in questions if len(q["options"]) == 0]
print(f"Total no options: {len(no_options)}")

for q in no_options[:15]:
    print("Num:", q["num"])
    print("Question text:", q["question"])
    print("Raw lines:", q["raw_lines"])
    print("=" * 50)
