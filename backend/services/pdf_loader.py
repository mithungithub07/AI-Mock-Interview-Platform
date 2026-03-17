import PyPDF2
import json
import os
import random

QUESTIONS_JSON = "questions.json"
PDFS_FOLDER   = "pdfs"


def extract_questions_from_pdf(pdf_path: str) -> list:
    questions = []
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
                    # pick lines that look like questions
                    if line.endswith("?") and len(line) > 15:
                        questions.append(line)
    except Exception as e:
        print(f"Error reading {pdf_path}: {e}")
    return questions


def build_questions_json():
    """
    Run this once after adding PDFs.
    Extracts all questions from PDFs and saves to questions.json
    """
    data = {}
    roles  = ["java", "python", "react", "fullstack"]
    levels = ["fresher", "junior", "senior", "architect"]

    for role in roles:
        data[role] = {}
        for level in levels:
            pdf_path = os.path.join(PDFS_FOLDER, role, f"{level}.pdf")
            if os.path.exists(pdf_path):
                questions = extract_questions_from_pdf(pdf_path)
                data[role][level] = questions
                print(f"✅ {role}/{level} → {len(questions)} questions extracted")
            else:
                data[role][level] = []
                print(f"⚠️  {role}/{level} → PDF not found, skipping")

    with open(QUESTIONS_JSON, "w") as f:
        json.dump(data, f, indent=2)

    print(f"\n✅ questions.json saved!")


def get_questions_from_json(role: str, level: str, count: int = 5) -> list:
    """
    Load questions from questions.json for the given role and level.
    Returns random selection of questions.
    """
    try:
        with open(QUESTIONS_JSON, "r") as f:
            data = json.load(f)

        questions = data.get(role, {}).get(level, [])

        if not questions:
            return []  # fallback to AI generation if empty

        return random.sample(questions, min(count, len(questions)))

    except FileNotFoundError:
        return []  # fallback to AI generation if JSON not found