from fastapi import APIRouter
from models.interview_model import InterviewRequest
from services.ai_services import generate_questions
from services.feedback import generate_feedback_ai
from models.feedback_model import FeedbackRequest

router = APIRouter()

@router.post("/start-interview")
def start_interview(request: InterviewRequest):
    role = request.role
    
    questions = generate_questions(role)

    return {"role": role,
            "questions":questions
            }


@router.post("/generate-feedback")
def generate_feedback(data: FeedbackRequest):

    role = data.role
    interview_data = data.interview_data

    feedback = generate_feedback_ai(role, interview_data)

    return {
        "feedback": feedback
    }


