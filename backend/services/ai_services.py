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

        return response.choices[0].message.content

    except Exception as e:
        print("ERROR:", e)
        return {
            "error": str(e),
            "role": role,
            "questions": []
            }