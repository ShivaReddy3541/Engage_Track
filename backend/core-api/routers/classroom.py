from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from shared.models import User, Class, Enrollment
from schemas import ClassCreate, ClassOut
from dependencies import get_current_user, RoleChecker

router = APIRouter(
    prefix="/classes",
    tags=["Classrooms"]
)

@router.post("", response_model=ClassOut, status_code=status.HTTP_201_CREATED)
def create_class(
    class_in: ClassCreate,
    db: Session = Depends(get_db),
    teacher: User = Depends(RoleChecker(["teacher"]))
):
    """Creates a new classroom. Restricted to Teachers."""
    new_class = Class(
        name=class_in.name,
        department=class_in.department,
        section=class_in.section,
        absence_allowed_mins=class_in.absence_allowed_mins,
        description=class_in.description,
        subject_name=class_in.subject_name,
        meet_date=class_in.meet_date,
        start_time=class_in.start_time,
        duration_mins=class_in.duration_mins,
        teacher_id=teacher.id
    )
    db.add(new_class)
    db.commit()
    db.refresh(new_class)
    return new_class

@router.get("", response_model=List[ClassOut])
def get_classes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Lists classes: Teachers see their own classes, Students see enrolled classes, Admins see all."""
    if current_user.role == "admin":
        return db.query(Class).all()
        
    elif current_user.role == "teacher":
        return db.query(Class).filter(Class.teacher_id == current_user.id).all()
        
    elif current_user.role == "student":
        # Get classes matching the student's department and section
        from shared.models import PreRegisteredStudent
        student_info = db.query(PreRegisteredStudent).filter(PreRegisteredStudent.roll_number == current_user.roll_number).first()
        if student_info:
            return db.query(Class).filter(Class.department == student_info.department, Class.section == student_info.section).all()
        return []
        
    return []

@router.get("/all-available", response_model=List[ClassOut])
def get_all_available_classes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Lists all classrooms created by teachers so students can browse and enroll, and admins can monitor."""
    return db.query(Class).all()

@router.post("/{class_id}/enroll")
def enroll_student(
    class_id: int,
    db: Session = Depends(get_db),
    student: User = Depends(RoleChecker(["student"]))
):
    """Enrolls the authenticated student in the specified class."""
    classroom = db.query(Class).filter(Class.id == class_id).first()
    if not classroom:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Classroom not found."
        )
        
    # Check if already enrolled
    existing = db.query(Enrollment).filter(
        Enrollment.student_id == student.id,
        Enrollment.class_id == class_id
    ).first()
    
    if existing:
        return {"message": "You are already enrolled in this class."}
        
    new_enrollment = Enrollment(
        student_id=student.id,
        class_id=class_id
    )
    db.add(new_enrollment)
    db.commit()
    return {"message": f"Successfully enrolled in '{classroom.name}'!"}

@router.get("/{class_id}", response_model=ClassOut)
def get_class_details(
    class_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Gets details for a specific classroom."""
    classroom = db.query(Class).filter(Class.id == class_id).first()
    if not classroom:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Classroom not found."
        )
    return classroom

from pydantic import BaseModel
class JoinVerifyRequest(BaseModel):
    roll_no: str
    password: str

@router.post("/{class_id}/verify-join")
def verify_join(
    class_id: int,
    req: JoinVerifyRequest,
    db: Session = Depends(get_db)
):
    """Verifies a student's roll number and password to join a live class."""
    from shared.models import PreRegisteredStudent
    from security import verify_password
    
    # Verify the class exists
    classroom = db.query(Class).filter(Class.id == class_id).first()
    if not classroom:
        raise HTTPException(status_code=404, detail="Classroom not found.")
        
    # Find user by roll number
    user = db.query(User).filter(User.roll_number == req.roll_no).first()
    if not user or user.role != "student":
        raise HTTPException(status_code=401, detail="Invalid roll number or not a registered student.")
        
    # Verify password
    if not verify_password(req.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid password.")
        
    # Check section match
    student_info = db.query(PreRegisteredStudent).filter(PreRegisteredStudent.roll_number == req.roll_no).first()
    if not student_info or student_info.department != classroom.department or student_info.section != classroom.section:
        raise HTTPException(status_code=403, detail="You do not belong to the correct department/section for this class.")
        
    return {"message": "Verification successful."}

@router.put("/{class_id}/close")
def close_class(
    class_id: int,
    db: Session = Depends(get_db),
    teacher: User = Depends(RoleChecker(["teacher"]))
):
    """Marks a classroom as completed."""
    classroom = db.query(Class).filter(Class.id == class_id, Class.teacher_id == teacher.id).first()
    if not classroom:
        raise HTTPException(status_code=404, detail="Classroom not found or you do not have permission.")
    
    classroom.status = "completed"
    db.commit()
    return {"message": "Class marked as completed."}
