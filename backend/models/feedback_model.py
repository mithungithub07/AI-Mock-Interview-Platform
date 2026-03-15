from pydantic import BaseModel

class FeedbackRequest(BaseModel):
    role: str
    interview_data: list