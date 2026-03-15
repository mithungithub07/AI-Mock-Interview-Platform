import os
from fastapi import APIRouter
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

@router.get("/deepgram-token")
def get_token():
    return {"token": os.getenv("DEEPGRAM_API_KEY")}
