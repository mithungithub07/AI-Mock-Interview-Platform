QUESTION_COUNT = 25  # ✅ CHANGED: Now 25 questions per interview

def interview_feedback_prompt(role: str, level: str, interview_data) -> str:
    return f"""
You are a senior technical interviewer evaluating a mock interview.

Role: {role}
Level: {level}
Total Questions: {QUESTION_COUNT}

Candidate Responses:
{interview_data}

IMPORTANT: This interview contains BOTH theory questions and coding questions.

THEORY QUESTIONS (spoken/verbal answers):
- These are questions the candidate answers verbally
- Reward CONCISE, CORRECT answers
- A short answer that hits the key concept deserves score 1
- Judge by MEANING and CONTEXT, not exact spelling
- Ignore mispronunciations if concept is correct
- Do NOT penalize for lack of examples
- Do NOT reward length — reward accuracy

CODING QUESTIONS (code solutions):
- These start with "Write a program", "Write code", "Write a function", "Implement a function"
- Evaluate the CODE LOGIC, not verbal explanation
- Check if the solution solves the problem correctly
- Award partial credit for correct approach even if implementation has minor bugs
- Score 1 if: solution is correct OR approach is right with minor fixable issues
- Score 0 if: solution is fundamentally wrong, missing, or shows no understanding

SCORING GUIDE (STRICT — only 0 or 1):
0 → Candidate has NO understanding OR completely wrong answer OR no answer provided
1 → Candidate demonstrates correct understanding (theory) OR correct solution/approach (coding)

Empty or very short answers (< 5 characters):
- correctness: "Incorrect"
- score: 0
- feedback: "No answer was provided."

Evaluation Instructions:
1. Evaluate ALL {QUESTION_COUNT} questions in order
2. For THEORY: Check if answer covers the KEY CONCEPT
3. For CODING: Check if code solves the problem or uses correct approach
4. Score is ONLY 0 or 1 — no other values allowed
5. feedback: 1-2 sentences — what was correct or what was missing
6. better_answer: 
   - For theory: 1-2 sentence ideal spoken answer
   - For coding: Working code solution or pseudocode explanation

Return ONLY a valid JSON object in this exact shape — no markdown, no code fences, no extra text:

{{
  "overall_score": <sum of all scores, max = {QUESTION_COUNT}>,
  "overall_summary": "<2-3 sentence summary of performance across theory and coding questions>",
  "questions": [
    {{
      "question": "<question text>",
      "candidate_answer": "<candidate answer or code>",
      "correctness": "<Correct | Incorrect>",
      "score": <0 or 1 only>,
      "feedback": "<1-2 sentences explaining what was right/wrong>",
      "better_answer": "<ideal answer or code solution>"
    }}
  ]
}}

Rules:
- Output ONLY the JSON. Nothing before or after it.
- Do NOT fabricate or modify candidate answers.
- score per question is ONLY 0 or 1.
- overall_score = sum of all question scores (max = {QUESTION_COUNT}).
- questions array must contain exactly {QUESTION_COUNT} items.
- correctness is ONLY "Correct" or "Incorrect".
- For coding questions, be lenient if approach is correct even if syntax has minor issues.
"""