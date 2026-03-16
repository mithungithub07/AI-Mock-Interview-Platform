from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.interview import router as interview_router
from routes.deepgram_token import router as deepgram_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://ai-mock-interview-platform-bymithun.vercel.app",
        "https://ai-mock-interview-platform-git-618cb6-mithungithub07s-projects.vercel.app",
        "https://ai-mock-interview-platform-bymithun-f7p5p5jxr.vercel.app",
        "http://localhost:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(interview_router)
app.include_router(deepgram_router)

@app.get("/")
def homepage():
   return {"message": "AI Based Mock Interview Platform"}





