from services.prompt import interview_feedback_prompt
import os
from dotenv import load_dotenv
from groq import Groq


load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def generate_feedback_ai(role, level, interview_data):
    try:
        for item in interview_data:
            if not item["answer"] or len(item["answer"].strip()) < 5:
                item["answer"] = "No answer provided"
        
        print("INTERVIEW_DATA:", interview_data[:2])  # Debug first 2 items
        
        prompt = interview_feedback_prompt(role, level, interview_data)

        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",  
            temperature=0.2,
            messages=[{"role": "user", "content": prompt}]
        )
        
        feedback = response.choices[0].message.content
        print("AI RAW RESPONSE:", feedback[:500])  # Debug first 500 chars
        
        return feedback

    except Exception as e:
        print("FEEDBACK ERROR:", str(e))
        import traceback
        traceback.print_exc()  # Full error trace
        return {"error": f"Failed to generate feedback: {str(e)}"}