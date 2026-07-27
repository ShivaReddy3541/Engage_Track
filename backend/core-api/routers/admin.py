from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel

from database import get_db
from shared.models import User, PreRegisteredStudent, SystemConfig, Faculty, FacilityRequest, PlacementDrive, StudentFee, ScheduleEvent, Announcement
from schemas import (UserOut, FacultyOut, FacultyBase, PreRegisteredStudentOut, PreRegisteredStudentCreate,
                     FacilityRequestBase, FacilityRequestOut, PlacementDriveBase, PlacementDriveOut,
                     StudentFeeOut, StudentFeeUpdate, StudentFeeCreate, ScheduleEventBase, ScheduleEventOut,
                     AnnouncementBase, AnnouncementOut)
import schemas
from sqlalchemy import or_
from dependencies import RoleChecker, get_current_user
from routers.notifications import create_notification, get_user_department
from sms import send_sms
from email_service import faculty_welcome_email, student_welcome_email

router = APIRouter(
    prefix="/admin",
    tags=["Admin Operations"]
)

@router.get("/pending-teachers", response_model=List[UserOut])
def get_pending_teachers(
    db: Session = Depends(get_db),
    admin: User = Depends(RoleChecker(["admin"]))
):
    """Retrieves all teacher registration requests pending approval."""
    pending = db.query(User).filter(User.role == "teacher", User.is_approved == False).all()
    return pending

@router.post("/approve-teacher/{user_id}")
def approve_teacher(
    user_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(RoleChecker(["admin"]))
):
    """Approves a pending teacher account registration."""
    teacher = db.query(User).filter(User.id == user_id, User.role == "teacher").first()
    if not teacher:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Teacher registration request not found."
        )
    if teacher.is_approved:
        return {"message": f"Teacher '{teacher.full_name}' is already approved."}
        
    teacher.is_approved = True
    db.commit()
    return {"message": f"Teacher '{teacher.full_name}' registration successfully approved!"}

@router.delete("/reject-teacher/{user_id}")
def reject_teacher(
    user_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(RoleChecker(["admin"]))
):
    """Rejects and deletes a pending teacher registration request."""
    teacher = db.query(User).filter(User.id == user_id, User.role == "teacher").first()
    if not teacher:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Teacher registration request not found."
        )
    if teacher.is_approved:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot reject a teacher who is already approved."
        )
        
    db.delete(teacher)
    db.commit()
    return {"message": f"Teacher '{teacher.full_name}' registration successfully rejected and account removed."}

@router.post("/pre-register-student")
def pre_register_student(
    roll_number: str,
    full_name: str,
    db: Session = Depends(get_db),
    authorized_user: User = Depends(RoleChecker(["admin", "teacher"]))
):
    """Pre-registers a student's roll number so they can register their account later."""
    existing = db.query(PreRegisteredStudent).filter(
        PreRegisteredStudent.roll_number == roll_number
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This roll number is already pre-registered."
        )
        
    new_pre_reg = PreRegisteredStudent(
        roll_number=roll_number,
        full_name=full_name,
        is_registered=False
    )
    db.add(new_pre_reg)
    db.commit()
    return {"message": f"Student '{full_name}' with roll number '{roll_number}' successfully pre-registered."}

class BrandingUpdateRequest(BaseModel):
    institution_name: str
    logo_url: str
    primary_color: str
    secondary_color: str
    slogan: str

@router.get("/branding")
def get_branding_config(db: Session = Depends(get_db)):
    """Retrieves current institution branding configs for white-label styling."""
    keys = ["BRAND_INSTITUTION_NAME", "BRAND_LOGO_URL", "BRAND_PRIMARY_COLOR", "BRAND_SECONDARY_COLOR", "BRAND_SLOGAN"]
    configs = db.query(SystemConfig).filter(SystemConfig.key.in_(keys)).all()
    config_dict = {c.key: c.value for c in configs}
    return {
        "institution_name": config_dict.get("BRAND_INSTITUTION_NAME", "SSV University"),
        "logo_url": config_dict.get("BRAND_LOGO_URL", "/assets/ssv_logo.png"),
        "primary_color": config_dict.get("BRAND_PRIMARY_COLOR", "#1e3a8a"),
        "secondary_color": config_dict.get("BRAND_SECONDARY_COLOR", "#f59e0b"),
        "slogan": config_dict.get("BRAND_SLOGAN", "New-Gen Cognitive Proctoring & LMS")
    }

@router.post("/branding")
def update_branding_config(
    req: BrandingUpdateRequest,
    db: Session = Depends(get_db),
    admin: User = Depends(RoleChecker(["admin"]))
):
    """Updates branding configs (Restricted to Administrator)."""
    mappings = {
        "BRAND_INSTITUTION_NAME": req.institution_name,
        "BRAND_LOGO_URL": req.logo_url,
        "BRAND_PRIMARY_COLOR": req.primary_color,
        "BRAND_SECONDARY_COLOR": req.secondary_color,
        "BRAND_SLOGAN": req.slogan
    }
    for k, v in mappings.items():
        config = db.query(SystemConfig).filter(SystemConfig.key == k).first()
        if config:
            config.value = v
        else:
            db.add(SystemConfig(key=k, value=v, description="Custom branding parameter"))
    db.commit()
    return {"message": "Institution branding configurations successfully updated!"}



@router.get("/faculty/all-emails")
def get_all_faculty_emails(
    db: Session = Depends(get_db),
    admin: User = Depends(RoleChecker(["admin", "dept_admin"]))
):
    """Returns a flat list of all faculty emails across all departments for global uniqueness checks."""
    rows = db.query(Faculty.email).all()
    return [r[0].lower() for r in rows]


@router.get("/faculty", response_model=List[FacultyOut])
def get_faculty(
    db: Session = Depends(get_db),
    admin: User = Depends(RoleChecker(["admin", "dept_admin"]))
):
    """Retrieves faculty members. Full admins see all; dept_admins only see their own department."""
    if admin.role == "dept_admin":
        return db.query(Faculty).filter(Faculty.department == admin.department).all()
    return db.query(Faculty).all()



@router.post("/faculty", response_model=FacultyOut)
def add_faculty(
    req: FacultyBase,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    admin: User = Depends(RoleChecker(["admin", "dept_admin"]))
):
    """Adds a new faculty member. dept_admins can only add to their own department."""
    # Dept admin can only add to their own department
    if admin.role == "dept_admin" and req.department != admin.department:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"You can only add faculty to the {admin.department} department."
        )
    # Enforce domain
    if not req.email.lower().endswith("@ssvuniversity.in"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Faculty email must end with the college domain '@ssvuniversity.in'."
        )
        
    # Enforce global email uniqueness (across Faculty table and User table)
    exists_faculty = db.query(Faculty).filter(Faculty.email == req.email.lower()).first()
    exists_user = db.query(User).filter(User.email == req.email.lower()).first()
    if exists_faculty or exists_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A faculty member or user with this email address already exists in the system."
        )

    # Check for personal email uniqueness
    if req.personal_email:
        personal_email_lower = req.personal_email.strip().lower()
        exists_fac_personal = db.query(Faculty).filter(Faculty.personal_email == personal_email_lower).first()
        exists_stu_personal = db.query(PreRegisteredStudent).filter(PreRegisteredStudent.personal_email == personal_email_lower).first()
        exists_user_personal = db.query(User).filter(User.email == personal_email_lower).first()
        if exists_fac_personal or exists_stu_personal or exists_user_personal:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A faculty member or student with this personal email address already exists in the system."
            )
    
    from security import hash_password

    new_faculty = Faculty(
        name=req.name,
        designation=req.designation,
        education=req.education,
        dob=req.dob,
        phone_number=req.phone_number,
        email=req.email,
        department=req.department,
        personal_email=req.personal_email,
        is_registered=True
    )
    db.add(new_faculty)

    # Automatically create approved teacher account with default password '123456'
    new_user = User(
        email=req.email.lower(),
        hashed_password=hash_password("123456"),
        full_name=req.name,
        role="teacher",
        department=req.department,
        is_approved=True
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_faculty)
    
    # Send welcome email to personal email address in background
    if req.personal_email:
        background_tasks.add_task(
            faculty_welcome_email,
            name=req.name,
            department=req.department,
            designation=req.designation,
            college_email=req.email,
            personal_email=req.personal_email
        )

    return new_faculty


@router.delete("/faculty/{faculty_id}")
def remove_faculty(
    faculty_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(RoleChecker(["admin", "dept_admin"]))
):
    """Removes a faculty member. dept_admins can only remove from their own department."""
    faculty = db.query(Faculty).filter(Faculty.id == faculty_id).first()
    if not faculty:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Faculty member not found."
        )
    # Dept admin cannot remove from another department
    if admin.role == "dept_admin" and faculty.department != admin.department:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"You can only remove faculty from the {admin.department} department."
        )
    # Delete corresponding registered User record if it exists
    registered_user = db.query(User).filter(User.email == faculty.email.lower()).first()
    if registered_user:
        db.delete(registered_user)
        
    db.delete(faculty)
    db.commit()
    return {"message": f"Faculty member '{faculty.name}' successfully removed."}

@router.get("/students", response_model=List[PreRegisteredStudentOut])
def get_students(
    db: Session = Depends(get_db),
    admin: User = Depends(RoleChecker(["admin", "dept_admin"]))
):
    """Retrieves all pre-registered students. Full admins see all; dept_admins only see their own department."""
    if admin.role == "dept_admin":
        return db.query(PreRegisteredStudent).filter(PreRegisteredStudent.department == admin.department).all()
    return db.query(PreRegisteredStudent).all()

@router.post("/students", response_model=PreRegisteredStudentOut)
def add_student(
    req: PreRegisteredStudentCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    admin: User = Depends(RoleChecker(["admin", "dept_admin"]))
):
    """Adds a new student to pre-registration. Generates roll number and email, auto-assigns section, sends SMS."""
    if admin.role == "dept_admin" and req.department.upper() != admin.department.upper():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"You can only add students to the {admin.department} department."
        )
        
    if req.department.upper() not in ["CSE", "ECE", "EEE"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid department. Must be CSE, ECE, or EEE."
        )

    # Check for personal email uniqueness
    if req.personal_email:
        personal_email_lower = req.personal_email.strip().lower()
        exists_fac_personal = db.query(Faculty).filter(Faculty.personal_email == personal_email_lower).first()
        exists_stu_personal = db.query(PreRegisteredStudent).filter(PreRegisteredStudent.personal_email == personal_email_lower).first()
        exists_user_personal = db.query(User).filter(User.email == personal_email_lower).first()
        if exists_fac_personal or exists_stu_personal or exists_user_personal:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A faculty member or student with this personal email address already exists in the system."
            )

    # Determine section automatically: fill A, B, C up to 20 students, default to D (last section)
    count_a = db.query(PreRegisteredStudent).filter(PreRegisteredStudent.department == req.department.upper(), PreRegisteredStudent.section == "A").count()
    count_b = db.query(PreRegisteredStudent).filter(PreRegisteredStudent.department == req.department.upper(), PreRegisteredStudent.section == "B").count()
    count_c = db.query(PreRegisteredStudent).filter(PreRegisteredStudent.department == req.department.upper(), PreRegisteredStudent.section == "C").count()
    
    if count_a < 20:
        section = "A"
    elif count_b < 20:
        section = "B"
    elif count_c < 20:
        section = "C"
    else:
        section = "D"

    # Generate roll number
    dept_prefix = {
        "CSE": "26CS",
        "ECE": "26EC",
        "EEE": "26EE"
    }.get(req.department.upper(), "26XX")
    
    students = db.query(PreRegisteredStudent).filter(PreRegisteredStudent.department == req.department.upper()).all()
    max_num = 0
    for s in students:
        roll = s.roll_number
        if len(roll) > 4 and roll.startswith(dept_prefix):
            try:
                num = int(roll[4:])
                if num > max_num:
                    max_num = num
            except ValueError:
                pass
    next_num = max_num + 1
    roll_number = f"{dept_prefix}{next_num:03d}"
    email = f"{roll_number.lower()}@ssvuniversity.in"
    
    new_student = PreRegisteredStudent(
        roll_number=roll_number,
        full_name=req.full_name,
        father_name=req.father_name,
        dob=req.dob,
        phone_number=req.phone_number,
        email=email,
        department=req.department.upper(),
        section=section,
        is_registered=False,
        personal_email=req.personal_email
    )
    db.add(new_student)
    db.commit()
    db.refresh(new_student)
    
    # Send welcome email to personal email address in background
    if req.personal_email:
        background_tasks.add_task(
            student_welcome_email,
            full_name=req.full_name,
            department=req.department.upper(),
            section=section,
            roll_number=roll_number,
            college_email=email,
            personal_email=req.personal_email
        )

    return new_student

@router.delete("/students/{student_id}")
def remove_student(
    student_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(RoleChecker(["admin", "dept_admin"]))
):
    """Removes a pre-registered student. dept_admins can only remove from their own department."""
    student = db.query(PreRegisteredStudent).filter(PreRegisteredStudent.id == student_id).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found."
        )
    if admin.role == "dept_admin" and student.department != admin.department:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"You can only remove students from the {admin.department} department."
        )
        
    # Also delete the registered User account if it exists
    registered_user = db.query(User).filter(User.email == student.email).first()
    if registered_user:
        db.delete(registered_user)
        
    db.delete(student)
    db.commit()
    return {"message": f"Student '{student.full_name}' successfully removed."}


@router.post("/facility-requests", response_model=FacilityRequestOut)
def create_facility_request(
    req: FacilityRequestBase,
    db: Session = Depends(get_db),
    admin: User = Depends(RoleChecker(["admin"]))
):
    """Admin creates a facility request."""
    new_request = FacilityRequest(
        requester_id=admin.id,
        department=admin.department or "admin",
        request_type=req.request_type,
        description=req.description
    )
    db.add(new_request)
    db.commit()
    db.refresh(new_request)
    return new_request

@router.get("/facility-requests", response_model=List[FacilityRequestOut])
def get_facility_requests(
    db: Session = Depends(get_db),
    admin: User = Depends(RoleChecker(["admin"]))
):
    """Admin sees all requests."""
    return db.query(FacilityRequest).all()

@router.put("/facility-requests/{request_id}/status")
def update_facility_request_status(
    request_id: int,
    status_str: str,
    db: Session = Depends(get_db),
    admin: User = Depends(RoleChecker(["admin"]))
):
    """Admin approves or rejects a request."""
    freq = db.query(FacilityRequest).filter(FacilityRequest.id == request_id).first()
    if not freq:
        raise HTTPException(status_code=404, detail="Request not found")
    freq.status = status_str
    db.commit()
    return {"message": f"Request status updated to {status_str}"}

@router.post("/placement-drives", response_model=PlacementDriveOut)
def add_placement_drive(
    req: PlacementDriveBase,
    db: Session = Depends(get_db),
    admin: User = Depends(RoleChecker(["admin", "dept_admin"]))
):
    new_drive = PlacementDrive(**req.model_dump())
    db.add(new_drive)
    db.commit()
    db.refresh(new_drive)
    
    # Trigger notification for students, teachers, and dept admins
    create_notification(
        db,
        message=f"New Placement Drive: {new_drive.company} is hiring for '{new_drive.role}' ({new_drive.package})",
        target_role=None,
        target_department=new_drive.branches if new_drive.branches and new_drive.branches != "All" else None,
        type_str="Info"
    )
    return new_drive

@router.get("/placement-drives", response_model=List[PlacementDriveOut])
def get_placement_drives(db: Session = Depends(get_db)):
    return db.query(PlacementDrive).all()

@router.delete("/placement-drives/{drive_id}")
def remove_placement_drive(
    drive_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(RoleChecker(["admin", "dept_admin"]))
):
    drive = db.query(PlacementDrive).filter(PlacementDrive.id == drive_id).first()
    if drive:
        db.delete(drive)
        db.commit()
    return {"message": "Placement drive removed"}

def _build_fee_records(students, db):
    """Helper: ensure a StudentFee record exists for each PreRegisteredStudent and return serialized list."""
    from shared.models import StudentFee
    fee_records = []
    for st in students:
        fee = db.query(StudentFee).filter(StudentFee.pre_student_id == st.id).first()
        if not fee:
            fee = StudentFee(pre_student_id=st.id, total_fee=120000.0, paid_fee=0.0, status="Due", fee_type="Tuition Fee")
            db.add(fee)
            db.commit()
            db.refresh(fee)
        fee_records.append({
            "id": fee.id,
            "pre_student_id": st.id,
            "student_name": st.full_name,
            "roll_number": st.roll_number,
            "department": st.department,
            "section": st.section,
            "total_fee": fee.total_fee,
            "paid_fee": fee.paid_fee,
            "status": fee.status,
            "fee_type": fee.fee_type,
            "remarks": fee.remarks,
        })
    return fee_records

@router.get("/fees", response_model=List[StudentFeeOut])
def get_student_fees(
    department: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all student fees (admin) or filtered by department (dept_admin)."""
    if current_user.role not in ["admin", "dept_admin"]:
        raise HTTPException(status_code=403, detail=f"Not authorized: role is '{current_user.role}'")
    query = db.query(PreRegisteredStudent)
    if current_user.role == "dept_admin":
        # dept_admin can only see their own department
        query = query.filter(PreRegisteredStudent.department == current_user.department)
    elif department:
        query = query.filter(PreRegisteredStudent.department == department)
    students = query.all()
    return _build_fee_records(students, db)

@router.put("/fees/{fee_id}")
def update_student_fee(
    fee_id: int,
    req: StudentFeeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a fee record. Admin can update any; dept_admin only their department."""
    if current_user.role not in ["admin", "dept_admin"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    fee = db.query(StudentFee).filter(StudentFee.id == fee_id).first()
    if not fee:
        raise HTTPException(status_code=404, detail="Fee record not found")
    # Dept admin scope check
    if current_user.role == "dept_admin":
        student = db.query(PreRegisteredStudent).filter(PreRegisteredStudent.id == fee.pre_student_id).first()
        if not student or student.department != current_user.department:
            raise HTTPException(status_code=403, detail="Not authorized for this student")
    fee.paid_fee = req.paid_fee
    fee.status = req.status
    if req.remarks is not None:
        fee.remarks = req.remarks
    db.commit()
    db.refresh(fee)
    return {"message": "Fee updated successfully"}

@router.post("/schedule-events", response_model=ScheduleEventOut)
def add_schedule_event(
    req: ScheduleEventBase,
    db: Session = Depends(get_db),
    admin: User = Depends(RoleChecker(["admin"]))
):
    new_event = ScheduleEvent(**req.model_dump())
    db.add(new_event)
    db.commit()
    db.refresh(new_event)
    
    # Trigger notification
    create_notification(
        db,
        message=f"New Schedule Event: {new_event.title} ({new_event.event_type}) added for {new_event.month} {new_event.day}",
        type_str="Info"
    )
    return new_event

@router.get("/schedule-events", response_model=List[ScheduleEventOut])
def get_schedule_events(db: Session = Depends(get_db)):
    return db.query(ScheduleEvent).all()

@router.delete("/schedule-events/{event_id}")
def remove_schedule_event(
    event_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(RoleChecker(["admin"]))
):
    event = db.query(ScheduleEvent).filter(ScheduleEvent.id == event_id).first()
    if event:
        db.delete(event)
        db.commit()
    return {"message": "Event removed"}

@router.post("/announcements", response_model=AnnouncementOut)
def add_announcement(
    req: AnnouncementBase,
    db: Session = Depends(get_db),
    admin: User = Depends(RoleChecker(["admin", "dept_admin"]))
):
    # Force department if dept_admin
    dept = req.department
    if admin.role == "dept_admin":
        dept = admin.department

    new_ann = Announcement(
        title=req.title,
        content=req.content,
        priority=req.priority,
        target_audience=req.target_audience,
        department=dept,
        attachment_name=req.attachment_name,
        date=req.date
    )
    db.add(new_ann)
    db.commit()
    db.refresh(new_ann)

    # Trigger notifications according to requirement:
    # If Main Admin posts -> Notify: Dept Admin + Teachers (+ Students if targeted)
    # If Dept Admin posts -> Notify: Teachers + Students
    if admin.role == "admin" or (dept is None or dept == "All" or dept == ""):
        create_notification(
            db,
            message=f"Main Admin Announcement: {new_ann.title}",
            target_role="dept_admin",
            type_str="Announcement"
        )
        create_notification(
            db,
            message=f"Main Admin Announcement: {new_ann.title}",
            target_role="teacher",
            type_str="Announcement"
        )
        if req.target_audience in ["All", "Student"]:
            create_notification(
                db,
                message=f"Main Admin Announcement: {new_ann.title}",
                target_role="student",
                type_str="Announcement"
            )
    else:
        create_notification(
            db,
            message=f"Dept Admin ({dept}) Announcement: {new_ann.title}",
            target_department=dept,
            target_role="teacher",
            type_str="Announcement"
        )
        create_notification(
            db,
            message=f"Dept Admin ({dept}) Announcement: {new_ann.title}",
            target_department=dept,
            target_role="student",
            type_str="Announcement"
        )
    return new_ann

@router.get("/announcements", response_model=List[AnnouncementOut])
def get_announcements(
    mine: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from sqlalchemy import or_
    
    if current_user.role == "admin":
        return db.query(Announcement).order_by(Announcement.id.desc()).all()
        
    elif current_user.role == "dept_admin":
        if mine:
            # Return announcements posted by this department admin
            return db.query(Announcement).filter(
                Announcement.department == current_user.department
            ).order_by(Announcement.id.desc()).all()
        else:
            # Return global announcements posted by main admin
            return db.query(Announcement).filter(
                or_(Announcement.department == None, Announcement.department == "All", Announcement.department == "")
            ).order_by(Announcement.id.desc()).all()
            
    else:
        # Student or Teacher: see announcements from their department
        dept = get_user_department(current_user, db)
        if dept:
            return db.query(Announcement).filter(
                or_(
                    Announcement.department == dept,
                    Announcement.department == None,
                    Announcement.department == "All",
                    Announcement.department == ""
                )
            ).order_by(Announcement.id.desc()).all()
        return []

@router.delete("/announcements/{ann_id}")
def remove_announcement(
    ann_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(RoleChecker(["admin", "dept_admin"]))
):
    ann = db.query(Announcement).filter(Announcement.id == ann_id).first()
    if not ann:
        raise HTTPException(status_code=404, detail="Announcement not found")
        
    if admin.role == "dept_admin" and ann.department != admin.department:
        raise HTTPException(status_code=403, detail="You can only delete your department's announcements")
        
    db.delete(ann)
    db.commit()
    return {"message": "Announcement removed"}

@router.get("/admissions-rate")
def get_admissions_rate(db: Session = Depends(get_db)):
    # Mocking previous year data for demonstration
    previous_year_total = 180 
    current_year_total = db.query(PreRegisteredStudent).count()
    if current_year_total == 0:
        current_year_total = 210 # Fallback mock data if db is empty
        
    rate_change = 0
    if previous_year_total > 0:
        rate_change = ((current_year_total - previous_year_total) / previous_year_total) * 100
        
    return {
        "current_year_total": current_year_total,
        "previous_year_total": previous_year_total,
        "this_year_count": current_year_total,
        "previous_year_count": previous_year_total,
        "rate_change_percent": round(rate_change, 1)
    }


from shared.models import PlacementRecord

@router.get("/placements/records")
def get_placement_records(db: Session = Depends(get_db)):
    records = db.query(PlacementRecord).all()
    results = []
    for r in records:
        student = db.query(PreRegisteredStudent).filter(PreRegisteredStudent.id == r.student_id).first()
        if student:
            results.append({
                "id": r.id,
                "student_name": student.full_name,
                "department": student.department,
                "company": r.drive.company,
                "package": r.package,
                "status": r.status,
                "date": r.created_at
            })
    return results

class ExportRequest(BaseModel):
    prompt: str

@router.post("/export")
def generate_export_data(
    req: ExportRequest,
    db: Session = Depends(get_db),
    admin: User = Depends(RoleChecker(["admin", "dept_admin"]))
):
    """
    A simple NLP parser that returns structured data based on the user's prompt.
    E.g., "generate the excel sheet for the students in cse of section A"
    """
    prompt = req.prompt.lower()
    
    # Detect Format
    export_format = "excel"
    if "pdf" in prompt:
        export_format = "pdf"
        
    # Detect Target Entity
    data = []
    headers = []
    filename = "export"
    
    if "student" in prompt:
        query = db.query(PreRegisteredStudent)
        if "cse" in prompt:
            query = query.filter(PreRegisteredStudent.department == "CSE")
        if "ece" in prompt:
            query = query.filter(PreRegisteredStudent.department == "ECE")
        if "eee" in prompt:
            query = query.filter(PreRegisteredStudent.department == "EEE")
            
        if "section a" in prompt:
            query = query.filter(PreRegisteredStudent.section == "A")
        elif "section b" in prompt:
            query = query.filter(PreRegisteredStudent.section == "B")
        elif "section c" in prompt:
            query = query.filter(PreRegisteredStudent.section == "C")
            
        records = query.all()
        headers = ["Roll Number", "Name", "Department", "Section", "Email"]
        data = [{"Roll Number": r.roll_number, "Name": r.full_name, "Department": r.department, "Section": r.section, "Email": r.email} for r in records]
        filename = "students_export"
        
    elif "teacher" in prompt or "facult" in prompt:
        query = db.query(Faculty)
        if "cse" in prompt:
            query = query.filter(Faculty.department == "CSE")
        if "ece" in prompt:
            query = query.filter(Faculty.department == "ECE")
        if "eee" in prompt:
            query = query.filter(Faculty.department == "EEE")
            
        records = query.all()
        headers = ["Name", "Designation", "Department", "Email"]
        data = [{"Name": r.name, "Designation": r.designation, "Department": r.department, "Email": r.email} for r in records]
        filename = "faculty_export"
        
    elif "placement" in prompt:
        records = db.query(PlacementDrive).all()
        headers = ["Company", "Role", "Package", "Status", "Date"]
        data = [{"Company": r.company, "Role": r.role, "Package": r.package, "Status": r.status, "Date": r.date} for r in records]
        filename = "placements_export"
        
    elif "schedule" in prompt:
        records = db.query(ScheduleEvent).all()
        headers = ["Title", "Month", "Day", "Type"]
        data = [{"Title": r.title, "Month": r.month, "Day": r.day, "Type": r.event_type} for r in records]
        filename = "schedule_export"
        
    elif "announcement" in prompt:
        records = db.query(Announcement).all()
        headers = ["Title", "Priority", "Target", "Date"]
        data = [{"Title": r.title, "Priority": r.priority, "Target": r.target_audience, "Date": r.date} for r in records]
        filename = "announcements_export"
        
    else:
        # Fallback to empty if not matched
        pass
        
    return {
        "format": export_format,
        "filename": filename,
        "headers": headers,
        "data": data
    }

def check_event_starts_tomorrow(event_day: str, tomorrow_day: int) -> bool:
    try:
        start_day_str = event_day.split("-")[0].strip()
        return int(start_day_str) == tomorrow_day
    except Exception:
        return False

@router.post("/fees/bulk-clear")
def bulk_clear_fees(
    department: str,
    section: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Bulk clears fee dues for all students in a specific department and section."""
    if current_user.role not in ["admin", "dept_admin"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    if current_user.role == "dept_admin" and department.upper() != current_user.department.upper():
        raise HTTPException(status_code=403, detail="Not authorized for this department")
        
    from shared.models import StudentFee, PreRegisteredStudent
    
    # Query fees for students in department and section
    fees = db.query(StudentFee).join(PreRegisteredStudent).filter(
        PreRegisteredStudent.department == department.upper(),
        PreRegisteredStudent.section == section.upper()
    ).all()
    
    for f in fees:
        f.paid_fee = f.total_fee
        f.status = "Cleared"
        f.remarks = f"Bulk cleared by {current_user.role} admin"
        
    db.commit()
    return {"message": f"Successfully cleared fees for {department} - {section} ({len(fees)} students)."}

def check_event_starts_tomorrow(event_day: str, tomorrow_day: int) -> bool:
    try:
        start_day_str = event_day.split("-")[0].strip()
        return int(start_day_str) == tomorrow_day
    except Exception:
        return False

@router.post("/trigger-automated-announcements")
def trigger_automated_announcements(
    db: Session = Depends(get_db),
    admin: User = Depends(RoleChecker(["admin"]))
):
    """Manually triggers the automated announcement check for tomorrow's events."""
    from shared.models import ScheduleEvent, Announcement
    from datetime import datetime, timedelta
    
    tomorrow = datetime.now() + timedelta(days=1)
    month_str = tomorrow.strftime("%B")
    tomorrow_day = tomorrow.day
    
    events = db.query(ScheduleEvent).filter(
        ScheduleEvent.month == month_str
    ).all()
    
    triggered_count = 0
    for ev in events:
        if check_event_starts_tomorrow(ev.day, tomorrow_day):
            ann_title = f"Reminder: {ev.title} Tomorrow"
            exists = db.query(Announcement).filter(Announcement.title == ann_title).first()
            if not exists:
                new_ann = Announcement(
                    title=ann_title,
                    content=f"This is an automated reminder that {ev.title} ({ev.event_type}) is scheduled for tomorrow. Details: {ev.details}",
                    priority="High",
                    target_audience="All",
                    attachment_name=ev.attachment_name or "schedule_details.pdf",
                    date=tomorrow.strftime("%Y-%m-%d")
                )
                db.add(new_ann)
                triggered_count += 1
                
    db.commit()
    return {"message": f"Triggered check. Created {triggered_count} automated announcements."}


@router.put("/users/{user_id}", response_model=UserOut)
def admin_update_user_profile(
    user_id: int,
    req: schemas.ProfileUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(RoleChecker(["admin", "dept_admin"]))
):
    """Allows Admins or Dept Admins to edit any teacher or student's complete details."""
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")

    if admin.role == "dept_admin" and target_user.department != admin.department:
        raise HTTPException(status_code=403, detail="Not authorized to edit users outside your department")

    if req.full_name: target_user.full_name = req.full_name
    if req.department: target_user.department = req.department
    if req.roll_number and target_user.role == "student": target_user.roll_number = req.roll_number

    if target_user.role == "student" and target_user.roll_number:
        pre = db.query(PreRegisteredStudent).filter(PreRegisteredStudent.roll_number == target_user.roll_number).first()
        if not pre and target_user.email:
            pre = db.query(PreRegisteredStudent).filter(PreRegisteredStudent.email == target_user.email).first()
        if pre:
            if req.full_name: pre.full_name = req.full_name
            if req.phone_number: pre.phone_number = req.phone_number
            if req.dob: pre.dob = req.dob
            if req.section: pre.section = req.section
            if req.department: pre.department = req.department

    if target_user.role in ["teacher", "dept_admin"]:
        from shared.models import Faculty
        fac = db.query(Faculty).filter(Faculty.email == target_user.email).first()
        if fac:
            if req.full_name: fac.name = req.full_name
            if req.phone_number: fac.phone_number = req.phone_number
            if req.dob: fac.dob = req.dob
            if req.designation: fac.designation = req.designation
            if req.education: fac.education = req.education
            if req.department: fac.department = req.department

    db.commit()
    db.refresh(target_user)

    section = None
    if target_user.role == "student" and target_user.roll_number:
        pre = db.query(PreRegisteredStudent).filter(PreRegisteredStudent.roll_number == target_user.roll_number).first()
        if pre:
            section = pre.section

    return UserOut(
        email=target_user.email,
        full_name=target_user.full_name,
        id=target_user.id,
        role=target_user.role,
        roll_number=target_user.roll_number,
        department=target_user.department,
        section=section,
        is_approved=target_user.is_approved,
        created_at=target_user.created_at
    )


@router.get("/placements", response_model=List[schemas.PlacementDriveOut])
def get_placements(
    department: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieves placement drives filtered by department unless Main Admin requesting all."""
    query = db.query(PlacementDrive)
    if current_user.role != "admin":
        user_dept = current_user.department or department
        if user_dept and user_dept != "All":
            # Show drives where branches matches user_dept or All or contains dept
            query = query.filter(
                or_(
                    PlacementDrive.branches.ilike(f"%{user_dept}%"),
                    PlacementDrive.branches.ilike("%All%"),
                    PlacementDrive.branches == ""
                )
            )
    elif department and department != "All":
        query = query.filter(
            or_(
                PlacementDrive.branches.ilike(f"%{department}%"),
                PlacementDrive.branches.ilike("%All%")
            )
        )
    return query.order_by(PlacementDrive.id.desc()).all()


@router.post("/placements", response_model=schemas.PlacementDriveOut)
def create_placement_drive(
    req: schemas.PlacementDriveBase,
    db: Session = Depends(get_db),
    admin: User = Depends(RoleChecker(["admin", "dept_admin"]))
):
    """Creates a placement drive. Dept Admins can only post for their department."""
    branches = req.branches
    if admin.role == "dept_admin":
        branches = admin.department

    drive = PlacementDrive(
        company=req.company,
        role=req.role,
        package=req.package,
        cutoff=req.cutoff,
        date=req.date,
        branches=branches,
        status=req.status or "Upcoming"
    )
    db.add(drive)
    db.commit()
    db.refresh(drive)

    # Notify target students & teachers
    if admin.role == "dept_admin" or branches != "All":
        create_notification(
            db,
            message=f"New Placement Drive ({drive.company} - {drive.package}): {drive.role}",
            target_department=branches if branches != "All" else None,
            target_role="student",
            type_str="Alert"
        )
    else:
        create_notification(
            db,
            message=f"New Global Placement Drive ({drive.company} - {drive.package}): {drive.role}",
            target_role="student",
            type_str="Alert"
        )

    return drive


