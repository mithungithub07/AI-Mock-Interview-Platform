from services.pdf_loader import build_questions_json

if __name__ == "__main__":
    print("Extracting questions from PDFs...")
    build_questions_json()
    print("Done!")