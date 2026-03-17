import os
from dotenv import load_dotenv
from  groq import Groq
from services.prompt import interview_question_prompt

load_dotenv()

# print("API KEY:", os.getenv("GROQ_API_KEY"))

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def generate_questions(role: str, level: str):

    try:
        
        prompt = interview_question_prompt(role, level)
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            temperature=0.9,
            messages=[
                {"role": "user", "content": prompt}
            ]
        )
        questions_text = response.choices[0].message.content or ""
        questions = [q.strip() for q in questions_text.split("\n") if q.strip()]
        return questions

    except Exception as e:
        print("ERROR:", e)
        return []