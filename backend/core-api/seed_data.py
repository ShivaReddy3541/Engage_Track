import sys
import os

# Add parent dir to path so we can import shared
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import SessionLocal, engine
from shared import models

def seed():
    models.Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Check if we already have some data, if so, maybe don't duplicate, but let's just add it
        print("Seeding sample placement drives...")
        drives = [
            models.PlacementDrive(company="Google", role="Software Engineer", package="30 LPA", cutoff="8.0 CGPA", date="2026-08-15", branches="CSE, ECE", status="Upcoming"),
            models.PlacementDrive(company="Microsoft", role="SDE", package="40 LPA", cutoff="8.5 CGPA", date="2026-07-10", branches="CSE", status="Ongoing"),
            models.PlacementDrive(company="Amazon", role="SDE 1", package="25 LPA", cutoff="7.5 CGPA", date="2026-06-01", branches="CSE, ECE, EEE", status="Completed"),
        ]
        db.add_all(drives)

        print("Seeding sample schedule events...")
        events = [
            models.ScheduleEvent(title="Mid Term Exams", month="July", day="15", event_type="Exam", details="Mid term exams for all branches"),
            models.ScheduleEvent(title="Tech Fest", month="August", day="10", event_type="Event", details="Annual technology festival"),
            models.ScheduleEvent(title="Placement Talk", month="July", day="20", event_type="Placement", details="Pre-placement talk by Google"),
        ]
        db.add_all(events)

        print("Seeding sample announcements...")
        announcements = [
            models.Announcement(title="Hostel Fee Reminder", content="Please pay your hostel fees by end of this month to avoid late fines.", priority="High", target_audience="Students", date="2026-07-08"),
            models.Announcement(title="Library Timings Extended", content="The library will now be open till 10 PM during exam days.", priority="Medium", target_audience="All", date="2026-07-07"),
            models.Announcement(title="Upcoming Hackathon", content="Register for the 24-hour hackathon happening this weekend in the main auditorium.", priority="High", target_audience="Students", date="2026-07-06"),
        ]
        db.add_all(announcements)
        
        db.commit() # commit drives so we can reference them

        # Assuming we have at least one user to assign fees and records to
        user = db.query(models.User).filter(models.User.role == 'student').first()
        if user:
            print(f"Skipping fees for student {user.email} (requires pre_student_id)...")

            print("Seeding placement records...")
            # Get the completed drive
            completed_drive = db.query(models.PlacementDrive).filter(models.PlacementDrive.company == "Amazon").first()
            if completed_drive:
                record = models.PlacementRecord(drive_id=completed_drive.id, student_id=user.id, package="25 LPA", status="Accepted")
                db.add(record)

            print("Seeding pending facility requests...")
            freq = models.FacilityRequest(requester_id=user.id, department="CSE", request_type="hackathon", description="Requesting auditorium for 24h hackathon", status="pending")
            db.add(freq)
        else:
            print("No student found in DB. Skipping fee, placement record, and facility request seeding.")

        db.commit()
        print("Seeding completed successfully!")
    except Exception as e:
        db.rollback()
        print(f"Error seeding data: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed()
