from fastapi import APIRouter
from models.interview_model import InterviewRequest
from services.ai_services import generate_questions
from services.feedback import generate_feedback_ai
from models.feedback_model import FeedbackRequest

router = APIRouter()

@router.post("/start-interview")
def start_interview(request: InterviewRequest):
    role = request.role
    level = request.level
    questions = generate_questions(role, level)

    return {"role": role,
            "level":level,
            "questions":questions
            }


@router.post("/generate-feedback")
def generate_feedback(data: FeedbackRequest):

    role = data.role
    interview_data = data.interview_data
    level = data.level
    feedback = generate_feedback_ai(role, level, interview_data)

    return {
        "feedback": feedback
    }


