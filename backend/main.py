from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.interview import router as interview_router
from routes.deepgram_token import router as deepgram_router
from routes.auth import router as auth_router
from routes.admin import router as admin_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://ai-mock-interview-platform-mu.vercel.app",
                   "http://localhost:5173"
                   ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "AI Mock Interview Platform API v2.0"}

app.include_router(interview_router)
app.include_router(deepgram_router)
app.include_router(auth_router)
app.include_router(admin_router)







