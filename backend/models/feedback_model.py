from pydantic import BaseModel

class FeedbackRequest(BaseModel):
    role: str
    level:str
    interview_data: list