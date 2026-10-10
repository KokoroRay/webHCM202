import json
import sys
import os

sys.stdout.reconfigure(encoding='utf-8')

def merge_datasets():
    orig_path = 'src/data/questions.json'
    supp_path = 'src/data/supplementary_questions.json'
    combined_path = 'src/data/combined_questions.json'

    if not os.path.exists(orig_path):
        print("Original questions.json not found!")
        return

    with open(orig_path, 'r', encoding='utf-8') as f:
        original = json.load(f)

    supplementary = []
    if os.path.exists(supp_path):
        with open(supp_path, 'r', encoding='utf-8') as f:
            supplementary = json.load(f)

    # Re-index supplementary questions starting after original total
    for idx, q in enumerate(supplementary):
        q['id'] = len(original) + idx + 1
        q['bank'] = 'supplementary'

    for q in original:
        q['bank'] = 'original'

    combined = original + supplementary

    with open(supp_path, 'w', encoding='utf-8') as f:
        json.dump(supplementary, f, ensure_ascii=False, indent=2)

    with open(combined_path, 'w', encoding='utf-8') as f:
        json.dump(combined, f, ensure_ascii=False, indent=2)

    print(f"Merged Datasets Summary:")
    print(f"  - Original Bank: {len(original)} questions")
    print(f"  - Supplementary Bank: {len(supplementary)} questions")
    print(f"  - Combined Total: {len(combined)} questions")

if __name__ == '__main__':
    merge_datasets()
