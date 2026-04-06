from pydantic import BaseModel, EmailStr

class SendInterviewLinkRequest(BaseModel):
    email: EmailStr
    role: str
    level: str

class QuestionUpdate(BaseModel):
    role: str
    level: str
    questions: list[str]