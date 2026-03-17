from pydantic import BaseModel

class InterviewRequest(BaseModel):
    role: str
    level: str