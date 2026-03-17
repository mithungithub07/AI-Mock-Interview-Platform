#Configuration 
import random
QUESTION_COUNT = 5

def interview_question_prompt(role: str, level: str) -> str:

    level_guide = {
        "fresher":   "basic concepts, definitions, simple differences",
        "junior":    "practical usage, common patterns, basic problem solving",
        "senior":    "deep understanding, best practices, performance, trade-offs",
        "architect": "system thinking, design decisions, scalability, leadership",
    }

    difficulty = {
        "Basic":        int(QUESTION_COUNT * 0.6),
        "Intermediate": int(QUESTION_COUNT * 0.3),
        "Hard":         QUESTION_COUNT - int(QUESTION_COUNT * 0.6) - int(QUESTION_COUNT * 0.3),
    }

    difficulty_lines = "\n".join(
        f"- {count} {level} question{'s' if count > 1 else ''}"
        for level, count in difficulty.items()
        if count > 0
    )

    numbered_format = "\n".join(
        f"Q{i}. <question>" for i in range(1, QUESTION_COUNT + 1)
    )

    random_angle = random.choice(topic_angles)
    random_seed  = random.randint(1, 99999)

    return f"""
You are an AI interviewer. Session ID: {random_seed}

Generate exactly {QUESTION_COUNT} UNIQUE interview questions for the role: {role}.
Candidate level: {level}
Level focus: {level_guide.get(level, "general concepts")}
Session angle: {random_angle}

Difficulty distribution:
{difficulty_lines}

Rules:
- Match question complexity to the candidate level.
- Questions must be commonly asked in real interviews.
- Each question must be under 20 words.
- ALL questions must be answerable VERBALLY in a spoken interview.
- Do NOT ask "implement", "write", "design", "build", "create", or "code" questions.
- Ask concept-based, experience-based, or explanation-based questions only.
- NEVER repeat questions — always generate fresh questions.

STRICT OUTPUT RULES:
- Output ONLY the questions — no intro, no explanation, no extra text.

Output format (exactly):
{numbered_format}
"""


def interview_feedback_prompt(role: str, interview_data) -> str:

    return f"""
You are a senior technical interviewer evaluating a spoken mock interview.

Role: {role}
Total Questions: {QUESTION_COUNT}

Candidate Responses:
{interview_data}

SCORING PHILOSOPHY:
This is a SPOKEN interview — not a written exam.
Reward candidates who give CONCISE, CORRECT answers.
A short answer that hits the key concept deserves a score of 1.
A wrong or missing answer gets a score of 0.
Do NOT penalise for lack of examples.
Do NOT reward length — reward accuracy and clarity.
The candidate may mispronounce technical terms — judge by MEANING and CONTEXT, not exact spelling.
If the answer clearly conveys the correct concept, give full marks even if a term is slightly misspelled in the transcript.
A partial answer that identifies the correct use case should score 1.         ← add this line
Do NOT compare against the model answer length — only check if the core concept is present.   ← add this line

Scoring guide (STRICT — only 0 or 1):
0 → Candidate clearly has NO understanding — completely wrong or no answer provided
1 → Candidate demonstrates correct understanding of the core concept

Empty or very short answers (< 5 characters):
- correctness: "Incorrect"
- score: 0
- feedback: "No answer was provided."

Evaluation Instructions:
1. Evaluate ALL {QUESTION_COUNT} questions in order.
2. Extract the KEY CONCEPT the question is testing.
3. Check if the candidate's answer covers that key concept — regardless of length.
4. Score is ONLY 0 or 1 — no other values allowed.
5. feedback: 1 sentence — what was correct or what key point was missing.
6. better_answer: 1–2 sentences max — the ideal concise spoken answer.

Return ONLY a valid JSON object in this exact shape — no markdown, no code fences, no extra text:

{{
  "overall_score": <sum of all scores, max = {QUESTION_COUNT}>,
  "overall_summary": "<2-3 sentence summary focusing on conceptual understanding>",
  "questions": [
    {{
      "question": "<question text>",
      "candidate_answer": "<candidate answer or empty string>",
      "correctness": "<Correct | Incorrect>",
      "score": <0 or 1 only>,
      "feedback": "<1 sentence>",
      "better_answer": "<1-2 sentence ideal spoken answer>"
    }}
  ]
}}

Rules:
- Output ONLY the JSON. Nothing before or after it.
- Do NOT fabricate or modify candidate answers.
- score per question is ONLY 0 or 1.
- overall_score = sum of all question scores (max = {QUESTION_COUNT}).
- questions array must contain exactly {QUESTION_COUNT} items.
- correctness is ONLY "Correct" or "Incorrect" — no "Partially Correct".
"""