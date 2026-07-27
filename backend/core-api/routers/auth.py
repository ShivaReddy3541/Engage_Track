from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from pydantic import BaseModel
import uuid
import os
import smtplib
from email.message import EmailMessage

from database import get_db
from shared.models import User, PreRegisteredStudent, Faculty
from schemas import UserCreate, UserOut, Token, UserLogin
import schemas
from security import hash_password, verify_password, create_access_token
from dependencies import get_current_user

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    """Registers a new student or teacher account with strict role, roll number, and approval checks."""
    # Prevent public registration of admin accounts
    if user_in.role == "admin":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Admin accounts cannot be registered publicly. Please use the seeded administrator credentials."
        )
        
    if user_in.role not in ["student", "teacher"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid role. Must be 'student' or 'teacher'."
        )
    
    # Check if email is already taken
    existing_user = db.query(User).filter(User.email == user_in.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists."
        )
    
    # Validation logic specific to roles
    is_approved = True
    roll_number = None

    if user_in.role == "teacher":
        if not user_in.email.lower().endswith("@ssvuniversity.in"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Teacher registration is restricted to official '@ssvuniversity.in' email addresses."
            )
            
        faculty_record = db.query(Faculty).filter(Faculty.email == user_in.email).first()
        if not faculty_record:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This email is not pre-registered in the college system as a faculty member."
            )
            
        # Mark as registered
        faculty_record.is_registered = True
        
        # Teachers are now pre-approved by Admins via predefined emails
        is_approved = True
        
    elif user_in.role == "student":
        student_record = db.query(PreRegisteredStudent).filter(PreRegisteredStudent.email == user_in.email).first()
        if not student_record:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This email is not pre-registered in the college system as a student."
            )
            
        # Mark as registered
        student_record.is_registered = True
        
        # Override the input roll_number with the official one from the DB
        roll_number = student_record.roll_number
        is_approved = True
    
    # Determine department
    department = None
    if user_in.role == "teacher":
        department = faculty_record.department
    elif user_in.role == "student":
        department = student_record.department

    # Create new database user record
    new_user = User(
        email=user_in.email,
        hashed_password=hash_password(user_in.password),
        full_name=user_in.full_name,
        role=user_in.role,
        department=department,
        roll_number=roll_number,
        is_approved=is_approved
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/login", response_model=Token)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    """Authenticates credentials and issues a JWT access token if approved by administrator."""
    clean_email = login_data.email.strip().lower()
    user = db.query(User).filter(User.email.ilike(clean_email)).first()
    if not user:
        user = db.query(User).filter(User.email == login_data.email.strip()).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    # Check if account has been approved (primarily for teachers)
    if not user.is_approved:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account registration is pending Administrator approval."
        )
    
    # Create Access Token
    access_token = create_access_token(subject=user.id, role=user.role)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role
    }

@router.get("/me", response_model=UserOut)
def read_current_user_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieves authenticated user context from token claims."""
    section = None
    if current_user.role == "student" and current_user.roll_number:
        pre_student = db.query(PreRegisteredStudent).filter(PreRegisteredStudent.roll_number == current_user.roll_number).first()
        if pre_student:
            section = pre_student.section
            
    user_out = UserOut(
        email=current_user.email,
        full_name=current_user.full_name,
        id=current_user.id,
        role=current_user.role,
        roll_number=current_user.roll_number,
        department=current_user.department,
        section=section,
        is_approved=current_user.is_approved,
        created_at=current_user.created_at
    )
    return user_out

def load_env_file():
    env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env")
    if not os.path.exists(env_path):
        env_path = os.path.join(os.path.dirname(__file__), ".env")
    if os.path.exists(env_path):
        with open(env_path, "r") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    key, val = line.split("=", 1)
                    os.environ[key.strip()] = val.strip()

# Run environment file loader on module load
load_env_file()

def send_reset_email(to_email: str, reset_url: str) -> bool:
    smtp_user = os.getenv("SMTP_USER") or os.getenv("EMAIL_USER")
    smtp_password = os.getenv("SMTP_PASSWORD") or os.getenv("EMAIL_PASS")
    smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
    
    smtp_port_env = os.getenv("SMTP_PORT")
    if smtp_port_env:
        smtp_port = int(smtp_port_env)
    else:
        smtp_port = 587 if os.getenv("EMAIL_USER") and not os.getenv("SMTP_USER") else 465
    
    if not smtp_user or not smtp_password:
        print("[SMTP CONFIG ERROR] No SMTP credentials configured. Skipping reset email.")
        return False
        
    try:
        print(f"Attempting to send password reset email to {to_email} using {smtp_user} via port {smtp_port}...")
        msg = EmailMessage()
        msg.set_content(f"""Hello,

You have requested to reset your password for your EngageAI account.
Please click the link below to set your new password:

{reset_url}

If you did not request this reset, please ignore this email.

Best regards,
EngageAI Team""")
        
        msg['Subject'] = 'Reset your EngageAI Password'
        msg['From'] = smtp_user
        msg['To'] = to_email
        
        if smtp_port == 465:
            with smtplib.SMTP_SSL(smtp_host, smtp_port) as smtp:
                smtp.login(smtp_user, smtp_password)
                smtp.send_message(msg)
        else:
            with smtplib.SMTP(smtp_host, smtp_port) as smtp:
                smtp.ehlo()
                smtp.starttls()
                smtp.ehlo()
                smtp.login(smtp_user, smtp_password)
                smtp.send_message(msg)
        print(f"Password reset email sent successfully to {to_email}")
        return True
    except Exception as e:
        print(f"\n[SMTP ERROR] Failed to send email via smtplib: {e}\n")
        return False

class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

@router.post("/forgot-password")
def forgot_password(req: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """Generates a password reset token and sends it to the user's email if SMTP is configured."""
    user = db.query(User).filter(User.email == req.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="A user with this email address was not found."
        )
    
    # Generate reset token
    token = str(uuid.uuid4())
    user.reset_token = token
    db.commit()

    reset_url = f"http://localhost:5173/reset-password?token={token}"
    print(f"\n[PASSWORD RESET ENGINE] Generated link for {user.email}:\n{reset_url}\n")
    
    return {
        "success": True,
        "message": "Password reset link generated successfully.",
        "reset_link": reset_url
    }

@router.post("/reset-password")
def reset_password(req: ResetPasswordRequest, db: Session = Depends(get_db)):
    """Resets user's password utilizing the validation token."""
    user = db.query(User).filter(User.reset_token == req.token).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired password reset token."
        )
    
    # Update password using hash
    user.hashed_password = hash_password(req.new_password)
    user.reset_token = None
    db.commit()
    
    return {
        "success": True,
        "message": "Password updated successfully."
    }

@router.put("/profile", response_model=UserOut)
def update_current_user_profile(
    req: schemas.ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Updates profile information for the currently logged-in user."""
    if req.full_name:
        current_user.full_name = req.full_name
    if req.department:
        current_user.department = req.department
    if req.roll_number and current_user.role == "student":
        current_user.roll_number = req.roll_number

    # Update pre-registered student record if student
    if current_user.role == "student" and current_user.roll_number:
        pre_student = db.query(PreRegisteredStudent).filter(PreRegisteredStudent.roll_number == current_user.roll_number).first()
        if not pre_student:
            pre_student = db.query(PreRegisteredStudent).filter(PreRegisteredStudent.email == current_user.email).first()
        if pre_student:
            if req.full_name: pre_student.full_name = req.full_name
            if req.phone_number: pre_student.phone_number = req.phone_number
            if req.dob: pre_student.dob = req.dob
            if req.section: pre_student.section = req.section
            if req.department: pre_student.department = req.department

    # Update faculty record if teacher or dept_admin
    if current_user.role in ["teacher", "dept_admin"]:
        from shared.models import Faculty
        faculty = db.query(Faculty).filter(Faculty.email == current_user.email).first()
        if faculty:
            if req.full_name: faculty.name = req.full_name
            if req.phone_number: faculty.phone_number = req.phone_number
            if req.dob: faculty.dob = req.dob
            if req.designation: faculty.designation = req.designation
            if req.education: faculty.education = req.education
            if req.department: faculty.department = req.department

    db.commit()
    db.refresh(current_user)

    section = None
    if current_user.role == "student" and current_user.roll_number:
        pre = db.query(PreRegisteredStudent).filter(PreRegisteredStudent.roll_number == current_user.roll_number).first()
        if pre:
            section = pre.section

    return UserOut(
        email=current_user.email,
        full_name=current_user.full_name,
        id=current_user.id,
        role=current_user.role,
        roll_number=current_user.roll_number,
        department=current_user.department,
        section=section,
        is_approved=current_user.is_approved,
        created_at=current_user.created_at
    )
