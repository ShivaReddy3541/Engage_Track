from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import datetime
import math
import re

from database import get_db
from shared.models import User, Assignment, Submission, Class, Enrollment
from schemas import AssignmentCreate, AssignmentOut, SubmissionCreate, SubmissionOut, GradeSubmission
from dependencies import get_current_user, RoleChecker

router = APIRouter(
    prefix="/classes",
    tags=["Assignments"]
)

# --- Pure-Python Cosine Similarity Engine for Plagiarism Checks ---
def tokenize(text: str) -> List[str]:
    """Tokenizes text into lowercase alphanumeric words."""
    return re.findall(r'\w+', text.lower())

def calculate_cosine_similarity(text1: str, text2: str) -> float:
    """Calculates TF cosine similarity between two text strings."""
    tokens1 = tokenize(text1)
    tokens2 = tokenize(text2)
    if not tokens1 or not tokens2:
        return 0.0
        
    # Build vocabulary set
    vocab = set(tokens1).union(set(tokens2))
    
    # Calculate word frequency counts
    freq1 = {}
    for t in tokens1:
        freq1[t] = freq1.get(t, 0) + 1
        
    freq2 = {}
    for t in tokens2:
        freq2[t] = freq2.get(t, 0) + 1
        
    # Calculate dot product
    dot_prod = sum(freq1[w] * freq2.get(w, 0) for w in freq1 if w in freq2)
    
    # Calculate magnitudes
    mag1 = math.sqrt(sum(c**2 for c in freq1.values()))
    mag2 = math.sqrt(sum(c**2 for c in freq2.values()))
    
    if mag1 == 0.0 or mag2 == 0.0:
        return 0.0
        
    return dot_prod / (mag1 * mag2)


@router.post("/{class_id}/assignments", response_model=AssignmentOut, status_code=status.HTTP_201_CREATED)
def create_assignment(
    class_id: int,
    assignment_in: AssignmentCreate,
    db: Session = Depends(get_db),
    teacher: User = Depends(RoleChecker(["teacher"]))
):
    """Creates a new assignment for a class. Restricted to class Teacher."""
    classroom = db.query(Class).filter(Class.id == class_id, Class.teacher_id == teacher.id).first()
    if not classroom:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to create assignments for this class."
        )
        
    new_assignment = Assignment(
        class_id=class_id,
        title=assignment_in.title,
        description=assignment_in.description,
        file_url=assignment_in.file_url,
        deadline=assignment_in.deadline
    )
    db.add(new_assignment)
    db.commit()
    db.refresh(new_assignment)
    return new_assignment

@router.get("/{class_id}/assignments", response_model=List[AssignmentOut])
def get_assignments(
    class_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieves all assignments for a class. Requires student enrollment or teaching role."""
    classroom = db.query(Class).filter(Class.id == class_id).first()
    if not classroom:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Classroom not found."
        )
        
    # Check authorization
    if current_user.role == "student":
        enrolled = db.query(Enrollment).filter(
            Enrollment.student_id == current_user.id,
            Enrollment.class_id == class_id
        ).first()
        if not enrolled:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You must be enrolled to view assignments."
            )
    elif current_user.role == "teacher":
        if classroom.teacher_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not the instructor of this class."
            )
            
    return db.query(Assignment).filter(Assignment.class_id == class_id).all()

@router.post("/assignments/{assignment_id}/submissions", response_model=SubmissionOut, status_code=status.HTTP_201_CREATED)
def submit_assignment(
    assignment_id: int,
    submission_in: SubmissionCreate,
    db: Session = Depends(get_db),
    student: User = Depends(RoleChecker(["student"]))
):
    """Submits student homework, calculating plagiarism score against previous class submissions."""
    assignment = db.query(Assignment).filter(Assignment.id == assignment_id).first()
    if not assignment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assignment not found."
        )
        
    # Verify student is enrolled in the class of the assignment
    enrolled = db.query(Enrollment).filter(
        Enrollment.student_id == student.id,
        Enrollment.class_id == assignment.class_id
    ).first()
    if not enrolled:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not enrolled in this class."
        )
        
    # Check duplicate submission
    existing = db.query(Submission).filter(
        Submission.assignment_id == assignment_id,
        Submission.student_id == student.id
    ).first()
    
    # Extract text for comparison
    new_text = submission_in.submission_text or ""
    
    # Calculate Plagiarism Score against previous class submissions
    max_plagiarism = 0.0
    if new_text.strip():
        # Fetch previous submissions for the same assignment (excluding own)
        prev_submissions = db.query(Submission.submission_text).filter(
            Submission.assignment_id == assignment_id,
            Submission.student_id != student.id
        ).all()
        
        for (prev_text,) in prev_submissions:
            if prev_text and prev_text.strip():
                score = calculate_cosine_similarity(new_text, prev_text)
                if score > max_plagiarism:
                    max_plagiarism = score
                    
    # Format similarity percentage
    plagiarism_score = round(max_plagiarism * 100, 2)
    
    if existing:
        # Overwrite submission
        existing.submission_text = new_text
        existing.file_url = submission_in.file_url
        existing.plagiarism_score = plagiarism_score
        existing.submitted_at = datetime.datetime.utcnow()
        db.commit()
        db.refresh(existing)
        return existing
        
    new_submission = Submission(
        assignment_id=assignment_id,
        student_id=student.id,
        submission_text=new_text,
        file_url=submission_in.file_url,
        plagiarism_score=plagiarism_score
    )
    db.add(new_submission)
    db.commit()
    db.refresh(new_submission)
    return new_submission

@router.get("/assignments/student/my-submissions", response_model=List[SubmissionOut])
def get_my_class_submissions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieves all class assignment submissions made by the logged-in student."""
    if current_user.role != "student":
        raise HTTPException(status_code=403, detail="Only students can view their class submissions")
    return db.query(Submission).filter(Submission.student_id == current_user.id).all()


@router.get("/assignments/{assignment_id}/submissions", response_model=List[SubmissionOut])
def get_submissions(
    assignment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieves submissions. Teachers see all, Students see only their own."""
    assignment = db.query(Assignment).filter(Assignment.id == assignment_id).first()
    if not assignment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assignment not found."
        )
        
    if current_user.role == "student":
        return db.query(Submission).filter(
            Submission.assignment_id == assignment_id,
            Submission.student_id == current_user.id
        ).all()
    else:
        # Verify teacher teaches this class
        classroom = db.query(Class).filter(Class.id == assignment.class_id).first()
        if current_user.role == "teacher" and classroom.teacher_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not authorized to view these submissions."
            )
        return db.query(Submission).filter(Submission.assignment_id == assignment_id).all()

@router.post("/submissions/{submission_id}/grade", response_model=SubmissionOut)
def grade_submission(
    submission_id: int,
    grade_in: GradeSubmission,
    db: Session = Depends(get_db),
    teacher: User = Depends(RoleChecker(["teacher"]))
):
    """Assigns a grade to a student submission. Restricted to teacher."""
    submission = db.query(Submission).filter(Submission.id == submission_id).first()
    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Submission not found."
        )
        
    # Verify teacher teaches the class of the assignment
    assignment = db.query(Assignment).filter(Assignment.id == submission.assignment_id).first()
    classroom = db.query(Class).filter(Class.id == assignment.class_id).first()
    if classroom.teacher_id != teacher.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to grade submissions for this class."
        )
        
    submission.grade = grade_in.grade
    submission.graded_by = teacher.id
    submission.graded_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(submission)
    return submission

@router.post("/submissions/{submission_id}/evaluate", response_model=SubmissionOut)
def evaluate_submission(
    submission_id: int,
    db: Session = Depends(get_db),
    teacher: User = Depends(RoleChecker(["teacher"]))
):
    """Uses Gemini API to evaluate the submission and auto-assign a grade."""
    import os
    import json
    import google.generativeai as genai
    
    submission = db.query(Submission).filter(Submission.id == submission_id).first()
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found.")
        
    assignment = db.query(Assignment).filter(Assignment.id == submission.assignment_id).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found.")

    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="Gemini API Key not configured.")
        
    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        prompt = (
            f"You are an AI teacher's assistant evaluating a student's submission.\n\n"
            f"Assignment Description/Questions:\n{assignment.description}\n\n"
            f"Student's Submission:\n{submission.submission_text}\n\n"
            f"Evaluate the submission based on correctness, completeness, and originality. "
            f"Provide a grade out of 100 (e.g., '85/100') on the first line, followed by brief feedback. "
            f"Also estimate if the text looks AI-generated and provide an AI-plagiarism score (0-100) on the second line as 'AI_SCORE: 20'."
        )
        
        response = model.generate_content(prompt)
        text = response.text.strip()
        
        # Simple parsing of the response
        lines = text.split('\n')
        grade = lines[0].strip() if lines else "Pending"
        
        # Look for AI_SCORE
        plagiarism = submission.plagiarism_score
        for line in lines:
            if line.startswith("AI_SCORE:"):
                try:
                    ai_val = float(line.split(":")[1].strip())
                    plagiarism = max(plagiarism, ai_val)
                except:
                    pass
                    
        # Update submission with AI feedback as the grade (or append feedback)
        # We will store the AI response directly in the grade field if it fits, 
        # or just the numeric grade and leave feedback out for now.
        submission.grade = grade[:50] # restrict to 50 chars as per model
        submission.plagiarism_score = plagiarism
        submission.graded_by = teacher.id
        submission.graded_at = datetime.datetime.utcnow()
        
        db.commit()
        db.refresh(submission)
        return submission
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Evaluation failed: {str(e)}")
