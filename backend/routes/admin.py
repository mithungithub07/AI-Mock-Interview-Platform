from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from services.auth_services import get_admin_user, create_interview_token
from services.emailservices import send_interview_link
from services.pdf_loader import extract_questions_from_pdf, save_questions_to_json, load_questions
from models.admin_model import SendInterviewLinkRequest, QuestionUpdate
import os
import shutil
import json

router = APIRouter(prefix="/admin", tags=["Admin"])

@router.post("/upload-pdf")
async def upload_pdf(
    role: str = Form(...),
    level: str = Form(...),
    file: UploadFile = File(...),
    admin: dict = Depends(get_admin_user)
):
    """Upload PDF and extract questions (Admin only)"""
    
    # Validate file type
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files allowed")
    
    # Role mapping
    role_folder_map = {
        "java": "java_developer",
        "python": "python",
        "react": "react",
        "fullstack": "fullstack"
    }
    
    role_folder = role_folder_map.get(role.lower())
    if not role_folder:
        raise HTTPException(status_code=400, detail="Invalid role")
    
    # Save PDF
    pdf_dir = f"pdfs/{role_folder}"
    os.makedirs(pdf_dir, exist_ok=True)
    
    pdf_path = os.path.join(pdf_dir, file.filename)
    
    with open(pdf_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Extract questions
    try:
        questions_by_level = extract_questions_from_pdf(pdf_path)
        
        # Save to questions.json
        # Save_questions_to_json(role, questions_by_level)
        save_questions_to_json(role, {level: questions_by_level.get(level, [])})
        
        total_questions = sum(len(q) for q in questions_by_level.values())
        
        return {
            "message": "PDF uploaded and questions extracted successfully",
            "role": role,
            "filename": file.filename,
            "questions_extracted": total_questions,
            "breakdown": {level: len(q) for level, q in questions_by_level.items()}
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to extract questions: {str(e)}")

@router.post("/send-interview-link")
def send_link(
    request: SendInterviewLinkRequest,
    admin: dict = Depends(get_admin_user)
):
    """Send interview link via email (Admin only)"""
    
    # Create interview token
    token = create_interview_token(request.role, request.level, request.email)
    
    # Send email
    try:
        send_interview_link(request.email, request.role, request.level, token)
        print("TOKEN GENERATED:", token)
        
        return {
            "message": "Interview link sent successfully",
            "email": request.email,
            "role": request.role,
            "level": request.level
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/questions")
def get_all_questions(admin: dict = Depends(get_admin_user)):
    """Get all questions from questions.json (Admin only)"""
    try:
        questions = load_questions()
        return questions
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load questions: {str(e)}")

@router.put("/questions")
def update_questions(
    update: QuestionUpdate,
    admin: dict = Depends(get_admin_user)
):
    """Update questions for a specific role/level (Admin only)"""
    try:
        questions = load_questions()
        
        if update.role not in questions:
            raise HTTPException(status_code=404, detail="Role not found")
        
        if update.level not in questions[update.role]:
            raise HTTPException(status_code=404, detail="Level not found")
        
        questions[update.role][update.level] = update.questions
        
        # Save back to file
        with open("questions.json", "w") as f:
            json.dump(questions, f, indent=2)
        
        return {
            "message": "Questions updated successfully",
            "role": update.role,
            "level": update.level,
            "count": len(update.questions)
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update questions: {str(e)}")

@router.post("/validate-interview-token")
def validate_interview_token(token: str = Form(...)):
    """Validate interview link token and return questions (Public endpoint)"""
    from services.auth_services import verify_token
    
    try:
        payload = verify_token(token)
        
        # Check if it's an interview token
        if payload.get("type") != "interview_link":
            raise HTTPException(status_code=400, detail="Invalid interview token")
        
        role = payload.get("role")
        level = payload.get("level")
        
        # Load questions for this role/level
        questions_data = load_questions()
        questions = questions_data.get(role, {}).get(level, [])
        
        if not questions:
            raise HTTPException(status_code=404, detail=f"No questions found for {role}/{level}")
        
        return {
            "valid": True,
            "role": role,
            "level": level,
            "candidate_email": payload.get("candidate_email"),
            "questions": questions  # ✅ ADDED THIS
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))