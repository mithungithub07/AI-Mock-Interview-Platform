from services.prompt import interview_feedback_prompt
import os
from dotenv import load_dotenv
from groq import Groq


load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def generate_feedback_ai(role, level, interview_data):
    print("INTERVIEW DATA RECEIVED:", interview_data)

    try:
        for item in interview_data:
          if not item["answer"] or len(item["answer"].strip()) < 5:
            item["answer"] = "No answer provided"
            
        prompt = interview_feedback_prompt(role, level, interview_data)

        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",  
            temperature=0.2,
            messages=[{"role": "user", "content": prompt}]
        )

        feedback = response.choices[0].message.content
        return feedback

    except Exception as e:
       
        return {"error": "Failed to generate feedback"}