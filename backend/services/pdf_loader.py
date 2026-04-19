import PyPDF2
import json
import os
import random

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
QUESTIONS_JSON = os.path.join(BASE_DIR, "questions.json")
PDFS_FOLDER = os.path.join(BASE_DIR, "pdfs")


ROLE_FOLDER_MAP = {
    "java": "java_developer",
    "python": "python",
    "react": "react",
    "fullstack": "fullstack",
}


ROLE_PDF_MAP = {
    "java": "Java_Interview_Questions.pdf",
    "python": "Python_Interview_Questions.pdf",
    "react": "React_Interview_Questions.pdf",
    "fullstack": "Full_Stack_Interview_Questions.pdf",
}

LEVEL_MAP = {
    "fresher":   "Fresher Level",
    "junior":    "Junior Level",
    "senior":    "Senior Level",
    "architect": "Architect Level",
}


ROLE_NAME_MAP = {
    "java developer": "java",
    "python developer": "python",
    "react developer": "react",
    "full stack developer": "fullstack",
}


def extract_questions_by_level(pdf_path: str) -> dict:
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

        
                    matched_level = None
                    for level_key, heading in LEVEL_MAP.items():
                        if heading.lower() in line.lower():
                            matched_level = level_key
                            break

                    if matched_level:
                        current_level = matched_level
                        continue

           
                    if current_level and line.endswith("?") and len(line) > 15:
                        if line[:2].upper().startswith("Q") and "." in line[:4]:
                            line = line[line.index(".") + 1:].strip()
                        if line and line not in result[current_level]:
                            result[current_level].append(line)

    except Exception as e:
        print(f"Error reading {pdf_path}: {e}")

    return result


def build_questions_json():
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
                print(f"{role}/{level} → {len(qs)} questions extracted")
        else:
            print(f"PDF not found: {pdf_path}")
            data[role] = {level: [] for level in LEVEL_MAP.keys()}

    with open(QUESTIONS_JSON, "w") as f:
        json.dump(data, f, indent=2)

    print(f"\n questions.json saved!")


def get_questions_from_json(role: str, level: str, count: int = 15) -> list:
    try:
        with open(QUESTIONS_JSON, "r") as f:
            data = json.load(f)

        normalized_role = ROLE_NAME_MAP.get(role.lower(), role.lower())

        questions = data.get(normalized_role, {}).get(level.lower(), [])

        if not questions:
            print(f" No questions found for {role}/{level} in questions.json")
            return []

        selected = random.sample(questions, min(count, len(questions)))
        print(f" Loaded {len(selected)} questions for {role}/{level} from PDF bank")
        return selected

    except FileNotFoundError:
        print(" questions.json not found")
        return []
    


def extract_questions_from_pdf(pdf_path: str) -> dict:
    """Extract ALL questions from PDF - ignore level headers"""
    import re
    
    questions = []
    
    try:
        with open(pdf_path, "rb") as f:
            reader = PyPDF2.PdfReader(f)
            for page in reader.pages:
                text = page.extract_text()
                if not text:
                    continue

                print(f"PAGE TEXT: {text[:500]}")

                lines = text.split("\n")
                for line in lines:
                    line = line.strip()
                    
                    # Match numbered questions: "1. ", "2. ", etc.
                    match = re.match(r'^\d+\.\s+(.+)', line)
                    if match:
                        question = match.group(1).strip()
                        if len(question) > 10:  # Valid question
                            questions.append(question)
                            print(f"FOUND: {question}")
    
    except Exception as e:
        print(f"Error extracting from {pdf_path}: {e}")
    
    # Return all questions under "fresher" key (will be reassigned by admin.py)
    print(f"TOTAL EXTRACTED: {len(questions)}") 
    return {"fresher": questions}


def save_questions_to_json(role: str, questions_by_level: dict):
    """Save extracted questions to questions.json, avoiding duplicates"""
    
    print(f"📁 Saving to: {QUESTIONS_JSON}")  # ← ADD THIS
    
    # Load existing questions
    try:
        with open(QUESTIONS_JSON, "r") as f:
            all_questions = json.load(f)
        print(f"📖 Loaded existing questions: {list(all_questions.keys())}")  # ← ADD THIS
    except FileNotFoundError:
        all_questions = {}
        print("📄 Creating new questions.json")  # ← ADD THIS
    
    # Initialize role if not exists
    if role not in all_questions:
        all_questions[role] = {level: [] for level in LEVEL_MAP.keys()}
    
    # Merge questions, skip duplicates
    # Merge questions, skip duplicates
    for level, new_questions in questions_by_level.items():
        if level not in all_questions[role]:
            all_questions[role][level] = []
    
    # Print first 3 existing questions
        print(f"📚 Existing questions sample: {all_questions[role][level][:3]}")  # ← ADD
    
    # Normalize existing questions for comparison
        existing_normalized = {q.strip().lower() for q in all_questions[role][level]}
        print(f"📊 Total existing normalized: {len(existing_normalized)}")  # ← ADD
    
        added_count = 0
    
        for q in new_questions:
            q = q.strip()
            q_normalized = q.lower()
        
            if q and q_normalized not in existing_normalized and len(q) > 10:
                all_questions[role][level].append(q)
                existing_normalized.add(q_normalized)
                added_count += 1
    
    print(f"➕ Added {added_count} new questions (skipped {len(new_questions) - added_count} duplicates)")
    
    # Save back
    with open(QUESTIONS_JSON, "w") as f:
        json.dump(all_questions, f, indent=2)
    
    print(f"✅ Saved to questions.json - Total for {role}/{level}: {len(all_questions[role][level])}")  # ← ADD THIS


def load_questions() -> dict:
    """Load all questions from questions.json"""
    try:
        with open(QUESTIONS_JSON, "r") as f:
            return json.load(f)
    except FileNotFoundError:
        return {}    