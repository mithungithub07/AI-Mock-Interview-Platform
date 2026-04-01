import os
from dotenv import load_dotenv
from groq import Groq
from services.prompt import interview_feedback_prompt
from services.pdf_loader import get_questions_from_json

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))


def generate_questions(role: str, level: str):
    return get_questions_from_json(role, level, count=15)


def generate_feedback_ai(role: str, level: str, interview_data):
    try:
        prompt = interview_feedback_prompt(role, level, interview_data)
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            temperature=0.3,
            messages=[
                {"role": "user", "content": prompt}
            ]
        )
        return response.choices[0].message.content or ""

    except Exception as e:
        print("Feedback ERROR:", e)
        return ""