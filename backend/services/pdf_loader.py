import PyPDF2
import json
import os
import random


# Add this at the top of pdf_loader.py
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
QUESTIONS_JSON = os.path.join(BASE_DIR, "questions.json")
PDFS_FOLDER = os.path.join(BASE_DIR, "pdfs")


# Map role name → folder name
ROLE_FOLDER_MAP = {
    "java": "java_developer",
    "python": "python",
    "react": "react",
    "fullstack": "fullstack",
}

# Map role name → PDF filename
ROLE_PDF_MAP = {
    "java": "Java_Interview_Questions.pdf",
    "python": "Python_Interview_Questions.pdf",
    "react": "React_Interview_Questions.pdf",
    "fullstack": "Full_Stack_Interview_Questions.pdf",
}

# Level headings as they appear in the PDF
LEVEL_HEADINGS = ["Fresher Level", "Junior Level", "Senior Level", "Architect Level"]

LEVEL_MAP = {
    "fresher":   "Fresher Level",
    "junior":    "Junior Level",
    "senior":    "Senior Level",
    "architect": "Architect Level",
}


def extract_questions_by_level(pdf_path: str) -> dict:
    """
    Extract questions from a single PDF that contains all 4 levels.
    Returns a dict: { "fresher": [...], "junior": [...], "senior": [...], "architect": [...] }
    """
    result = {level: [] for level in LEVEL_MAP.keys()}
    current_level = None

    try:
        with open(pdf_path, "rb") as f:
            reader = PyPDF2.PdfReader(f)
            for page in reader.pages:
                text = page.extract_text()
                if not text:
                    continue

                lines = text.split("\n")
                for line in lines:
                    line = line.strip()
                    if not line:
                        continue

                    # Detect level heading
                    matched_level = None
                    for level_key, heading in LEVEL_MAP.items():
                        if heading.lower() in line.lower():
                            matched_level = level_key
                            break

                    if matched_level:
                        current_level = matched_level
                        continue

                    # Extract question lines
                    if current_level and line.endswith("?") and len(line) > 15:
                        # Clean up Q1. Q2. prefixes if present
                        if line[:2].upper().startswith("Q") and "." in line[:4]:
                            line = line[line.index(".") + 1:].strip()
                        if line and line not in result[current_level]:
                            result[current_level].append(line)

    except Exception as e:
        print(f"Error reading {pdf_path}: {e}")

    return result


def build_questions_json():
    """
    Run this once after adding PDFs.
    Extracts all questions from PDFs (by level) and saves to questions.json.
    """
    data = {}
    roles = ["java", "python", "react", "fullstack"]

    for role in roles:
        folder = ROLE_FOLDER_MAP[role]
        pdf_name = ROLE_PDF_MAP[role]
        pdf_path = os.path.join(PDFS_FOLDER, folder, pdf_name)

        if os.path.exists(pdf_path):
            level_questions = extract_questions_by_level(pdf_path)
            data[role] = level_questions
            for level, qs in level_questions.items():
                print(f"✅ {role}/{level} → {len(qs)} questions extracted")
        else:
            print(f"⚠️  PDF not found: {pdf_path}")
            data[role] = {level: [] for level in LEVEL_MAP.keys()}

    with open(QUESTIONS_JSON, "w") as f:
        json.dump(data, f, indent=2)

    print(f"\n✅ questions.json saved!")


def get_questions_from_json(role: str, level: str, count: int = 15) -> list:
    """
    Load questions from questions.json for the given role and level.
    Returns a random selection of `count` questions.
    Falls back to empty list if not found (AI generation will kick in).
    """
    try:
        with open(QUESTIONS_JSON, "r") as f:
            data = json.load(f)

        questions = data.get(role.lower(), {}).get(level.lower(), [])

        if not questions:
            print(f"⚠️  No questions found for {role}/{level} in questions.json")
            return []

        selected = random.sample(questions, min(count, len(questions)))
        print(f"✅ Loaded {len(selected)} questions for {role}/{level} from PDF bank")
        return selected

    except FileNotFoundError:
        print("⚠️  questions.json not found, falling back to AI generation")
        return []