from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from shared.models import User, Notification
import schemas
from dependencies import get_current_user

router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"]
)

def get_user_department(user: User, db: Session) -> str:
    if user.department:
        return user.department
    
    # Lazy lookup if department is not set in the users table
    if user.role == "student":
        from shared.models import PreRegisteredStudent
        stu = db.query(PreRegisteredStudent).filter(PreRegisteredStudent.roll_number == user.roll_number).first()
        if stu:
            return stu.department
    elif user.role == "teacher":
        from shared.models import Faculty
        fac = db.query(Faculty).filter(Faculty.email == user.email).first()
        if fac:
            return fac.department
    return None

@router.get("", response_model=List[schemas.NotificationOut])
def get_my_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from sqlalchemy import or_, and_
    dept = get_user_department(current_user, db)
    
    # Fetch notifications targeted to this user specifically,
    # or to their role, or to their department, or globally.
    query = db.query(Notification).filter(
        or_(
            Notification.user_id == current_user.id,
            and_(
                Notification.user_id == None,
                or_(Notification.target_role == None, Notification.target_role == "All", Notification.target_role == current_user.role),
                or_(Notification.target_department == None, Notification.target_department == "All", Notification.target_department == dept)
            )
        )
    ).order_by(Notification.id.desc())
    return query.all()

@router.put("/read")
def mark_all_notifications_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from sqlalchemy import or_, and_
    dept = get_user_department(current_user, db)
    
    notifs = db.query(Notification).filter(
        or_(
            Notification.user_id == current_user.id,
            and_(
                Notification.user_id == None,
                or_(Notification.target_role == None, Notification.target_role == "All", Notification.target_role == current_user.role),
                or_(Notification.target_department == None, Notification.target_department == "All", Notification.target_department == dept)
            )
        )
    ).all()
    
    for n in notifs:
        n.is_read = True
    db.commit()
    return {"message": "All notifications marked as read"}

@router.put("/{notif_id}/read")
def mark_notification_read(
    notif_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    notif = db.query(Notification).filter(Notification.id == notif_id).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    notif.is_read = True
    db.commit()
    return {"message": "Notification marked as read"}

def create_notification(db: Session, message: str, target_role: str = None, target_department: str = None, user_id: int = None, type_str: str = "Info"):
    new_notif = Notification(
        user_id=user_id,
        target_role=target_role,
        target_department=target_department,
        message=message,
        type=type_str,
        is_read=False
    )
    db.add(new_notif)
    db.commit()
