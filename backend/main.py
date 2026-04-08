from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.interview import router as interview_router
from routes.deepgram_token import router as deepgram_router
from routes.auth import router as auth_router
from routes.admin import router as admin_router
from database import init_db, SessionLocal
from sqlalchemy import text
from contextlib import asynccontextmanager


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup logic
    init_db()
    print("✅ Database initialized")
    
    yield
    
    print("🛑 App shutting down")


app = FastAPI(lifespan=lifespan)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://ai-mock-interview-platform-mu.vercel.app",
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"message": "AI Mock Interview Platform API v2.0"}


# 🔧 Database Health Check Endpoint
@app.get("/api/health/db")
def check_db_health():
    """Test database connection"""
    try:
        db = SessionLocal()
        result = db.execute(text("SELECT 1"))
        db.close()
        return {
            "status": "success",
            "message": "✅ Connected to Supabase PostgreSQL",
            "database": "supabase"
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"❌ Database connection failed: {str(e)}",
            "error_type": type(e).__name__
        }


app.include_router(interview_router)
app.include_router(deepgram_router)
app.include_router(auth_router)
app.include_router(admin_router)