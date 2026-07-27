import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import SessionLocal
from shared import models
import datetime

db = SessionLocal()

try:
    teacher = db.query(models.User).filter(models.User.email == "admin@ssvuniversity.in").first()
    student = db.query(models.User).filter(models.User.role == "student").first()

    if not teacher or not student:
        print("Teacher or Student not found!")
    else:
        # Create a class
        new_class = models.Class(
            name="Advanced AI",
            department="CSE",
            section="A",
            subject_name="Artificial Intelligence",
            teacher_id=teacher.id,
            status="active"
        )
        db.add(new_class)
        db.commit()
        db.refresh(new_class)

        # Enroll student
        enrollment = models.Enrollment(student_id=student.id, class_id=new_class.id)
        db.add(enrollment)
        
        # Create Online Meet
        meet = models.OnlineMeet(
            meeting_id="MEET-CSE-A-9999",
            teacher_id=teacher.id,
            department="CSE",
            section="A",
            subject_name="Artificial Intelligence",
            topic="Neural Networks Live Session",
            meet_date=datetime.datetime.now().strftime("%Y-%m-%d"),
            start_time=(datetime.datetime.now() - datetime.timedelta(minutes=5)).strftime("%H:%M"),
            duration_mins=60,
            status="active",
            is_active=True
        )
        db.add(meet)
        db.commit()
        print("Successfully created a Class and an active Online Meet!")
except Exception as e:
    print(f"Error: {e}")
    db.rollback()
finally:
    db.close()
