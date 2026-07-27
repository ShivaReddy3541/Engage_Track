import io
import pandas as pd
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from fastapi import APIRouter, Depends, HTTPException, Body
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from database import get_db
from dependencies import RoleChecker
from shared import models

router = APIRouter()

@router.post("/export")
def export_data(
    prompt: str = Body(..., embed=True), 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(RoleChecker(["admin", "dept_admin"]))
):
    prompt_lower = prompt.lower()
    
    # 1. Determine format
    if "pdf" in prompt_lower:
        export_format = "pdf"
    else:
        # Default to excel if not specified or explicitly requested
        export_format = "excel"
        
    # 2. Determine target data based on prompt keywords
    data = []
    headers = []
    filename = f"export.{'pdf' if export_format == 'pdf' else 'xlsx'}"
    
    if "student" in prompt_lower:
        # Filter for students
        query = db.query(models.User).filter(models.User.role == 'student')
        if "cse" in prompt_lower:
            query = query.filter(models.User.department == 'CSE')
        # Since section is in PreRegisteredStudent, we might just filter by department for now
        # Or we can join if necessary. But User model doesn't have section, only PreRegisteredStudent does.
        # Let's just return what we have in User table.
        users = query.all()
        headers = ["ID", "Full Name", "Email", "Department", "Roll Number"]
        for u in users:
            data.append([u.id, u.full_name, u.email, u.department, u.roll_number])
        filename = f"students_export.{'pdf' if export_format == 'pdf' else 'xlsx'}"
        
    elif "teacher" in prompt_lower or "faculty" in prompt_lower:
        users = db.query(models.User).filter(models.User.role == 'teacher').all()
        headers = ["ID", "Full Name", "Email", "Department"]
        for u in users:
            data.append([u.id, u.full_name, u.email, u.department])
        filename = f"teachers_export.{'pdf' if export_format == 'pdf' else 'xlsx'}"
        
    elif "placement" in prompt_lower:
        drives = db.query(models.PlacementDrive).all()
        headers = ["ID", "Company", "Role", "Package", "Date", "Status"]
        for d in drives:
            data.append([d.id, d.company, d.role, d.package, d.date, d.status])
        filename = f"placements_export.{'pdf' if export_format == 'pdf' else 'xlsx'}"
        
    elif "schedule" in prompt_lower:
        events = db.query(models.ScheduleEvent).all()
        headers = ["ID", "Title", "Date", "Type", "Details"]
        for e in events:
            data.append([e.id, e.title, f"{e.month} {e.day}", e.event_type, e.details])
        filename = f"schedule_export.{'pdf' if export_format == 'pdf' else 'xlsx'}"
        
    elif "announcement" in prompt_lower:
        announcements = db.query(models.Announcement).all()
        headers = ["ID", "Title", "Content", "Date", "Priority"]
        for a in announcements:
            data.append([a.id, a.title, a.content, a.date, a.priority])
        filename = f"announcements_export.{'pdf' if export_format == 'pdf' else 'xlsx'}"
    else:
        raise HTTPException(status_code=400, detail="Could not determine the target data from the prompt.")

    if not data:
        raise HTTPException(status_code=404, detail="No data found for the requested export.")

    # 3. Generate file
    df = pd.DataFrame(data, columns=headers)
    
    if export_format == "excel":
        output = io.BytesIO()
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            df.to_excel(writer, index=False, sheet_name='Export')
        output.seek(0)
        return StreamingResponse(
            output, 
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    else: # PDF
        output = io.BytesIO()
        c = canvas.Canvas(output, pagesize=letter)
        width, height = letter
        
        c.drawString(30, height - 30, f"Exported Data: {filename}")
        
        y = height - 60
        # Simple rendering
        c.drawString(30, y, " | ".join(headers))
        y -= 20
        
        for row in data:
            if y < 40:
                c.showPage()
                y = height - 40
            row_str = " | ".join([str(item) for item in row])
            # Truncate if too long
            if len(row_str) > 100:
                row_str = row_str[:97] + "..."
            c.drawString(30, y, row_str)
            y -= 15
            
        c.save()
        output.seek(0)
        return StreamingResponse(
            output, 
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
