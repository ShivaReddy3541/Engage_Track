from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List

class UserBase(BaseModel):
    email: str = Field(..., description="User login email address")
    full_name: str = Field(..., description="Full user name")

class UserCreate(UserBase):
    password: str = Field(..., min_length=6, description="Cleartext password (minimum 6 characters)")
    role: str = Field(..., description="Account role: admin, teacher, or student")
    roll_number: Optional[str] = Field(None, description="Student roll number, required for students")

class UserLogin(BaseModel):
    email: str
    password: str

class UserOut(UserBase):
    id: int
    role: str
    roll_number: Optional[str] = None
    department: Optional[str] = None
    section: Optional[str] = None
    is_approved: bool
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    role: str

class TokenData(BaseModel):
    user_id: int
    role: str

# Class Schemas
class ClassCreate(BaseModel):
    name: str = Field(..., min_length=1, description="Classroom name")
    department: str = Field(..., description="Department for the class")
    section: str = Field(..., description="Section for the class")
    absence_allowed_mins: int = Field(default=10, ge=2, le=30, description="Time allowed to be absent in session")
    description: Optional[str] = None
    subject_name: Optional[str] = None
    meet_date: Optional[str] = None
    start_time: Optional[str] = None
    duration_mins: Optional[int] = None

class ClassOut(BaseModel):
    id: int
    name: str
    department: Optional[str] = None
    section: Optional[str] = None
    absence_allowed_mins: Optional[int] = None
    description: Optional[str]
    subject_name: Optional[str] = None
    meet_date: Optional[str] = None
    start_time: Optional[str] = None
    duration_mins: Optional[int] = None
    teacher_id: int
    created_at: datetime
    status: str = "scheduled"
    class Config:
        from_attributes = True

# Enrollment Schemas
class EnrollmentOut(BaseModel):
    id: int
    student_id: int
    class_id: int
    created_at: datetime
    class Config:
        from_attributes = True

# Post / Comment Schemas
class PostCreate(BaseModel):
    content: str = Field(..., min_length=1, description="Post text content")
    attachment_url: Optional[str] = None

class CommentCreate(BaseModel):
    content: str = Field(..., min_length=1, description="Comment text content")

class CommentOut(BaseModel):
    id: int
    post_id: int
    author_id: int
    content: str
    moderation_status: str
    created_at: datetime
    class Config:
        from_attributes = True

class PostOut(BaseModel):
    id: int
    class_id: int
    author_id: int
    content: str
    attachment_url: Optional[str]
    moderation_status: str
    created_at: datetime
    comments: List[CommentOut] = []
    class Config:
        from_attributes = True

# Assignment / Submission Schemas
class AssignmentCreate(BaseModel):
    title: str = Field(..., min_length=2, description="Assignment title")
    description: Optional[str] = None
    deadline: datetime
    file_url: Optional[str] = None

class AssignmentOut(BaseModel):
    id: int
    class_id: int
    title: str
    description: Optional[str]
    file_url: Optional[str]
    deadline: datetime
    created_at: datetime
    class Config:
        from_attributes = True

class SubmissionCreate(BaseModel):
    submission_text: Optional[str] = None
    file_url: Optional[str] = None

class SubmissionOut(BaseModel):
    id: int
    assignment_id: int
    student_id: int
    file_url: Optional[str]
    submission_text: Optional[str]
    plagiarism_score: float
    grade: Optional[str]
    graded_by: Optional[int]
    submitted_at: datetime
    graded_at: Optional[datetime]
    class Config:
        from_attributes = True

class GradeSubmission(BaseModel):
    grade: str = Field(..., min_length=1, description="Grade to assign (e.g. A, B, 95)")

class PreRegisteredStudentBase(BaseModel):
    full_name: str
    father_name: str
    dob: str
    phone_number: str
    email: str
    roll_number: str
    department: str
    section: str
    personal_email: Optional[str] = None

class PreRegisteredStudentOut(PreRegisteredStudentBase):
    id: int
    is_registered: bool
    created_at: datetime
    class Config:
        from_attributes = True

class PreRegisteredStudentCreate(BaseModel):
    full_name: str
    father_name: str
    dob: str
    phone_number: str
    department: str
    section: Optional[str] = None
    personal_email: Optional[str] = None

class FacultyBase(BaseModel):
    name: str
    designation: str
    education: str
    dob: str
    phone_number: str
    email: str
    department: str
    personal_email: Optional[str] = None

class FacultyOut(FacultyBase):
    id: int
    is_registered: bool
    created_at: datetime
    class Config:
        from_attributes = True

class FacilityRequestBase(BaseModel):
    department: str
    request_type: str
    description: str

class FacilityRequestOut(FacilityRequestBase):
    id: int
    requester_id: int
    status: str
    created_at: datetime
    class Config:
        from_attributes = True

class PlacementDriveBase(BaseModel):
    company: str
    role: str
    package: str
    cutoff: str
    date: str
    branches: str
    status: str = "Upcoming"

class PlacementDriveOut(PlacementDriveBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True

class StudentFeeCreate(BaseModel):
    pre_student_id: int
    total_fee: float = 120000.0
    paid_fee: float = 0.0
    status: str = "Due"
    fee_type: str = "Tuition Fee"
    remarks: Optional[str] = None

class StudentFeeUpdate(BaseModel):
    paid_fee: float
    status: str
    remarks: Optional[str] = None

class StudentFeeOut(BaseModel):
    id: int
    pre_student_id: int
    student_name: str
    roll_number: str
    department: str
    section: str
    total_fee: float
    paid_fee: float
    status: str
    fee_type: str
    remarks: Optional[str] = None
    class Config:
        from_attributes = True

class ScheduleEventBase(BaseModel):
    title: str
    month: str
    day: str
    event_type: str
    details: Optional[str] = None
    attachment_name: Optional[str] = None


class ScheduleEventOut(ScheduleEventBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True

class AnnouncementBase(BaseModel):
    title: str
    content: str
    priority: str = "Medium"
    target_audience: str = "All"
    department: Optional[str] = None
    attachment_name: Optional[str] = None
    date: str

class AnnouncementOut(AnnouncementBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True

class NotificationOut(BaseModel):
    id: int
    user_id: Optional[int]
    target_role: Optional[str]
    target_department: Optional[str]
    message: str
    type: str
    is_read: bool
    created_at: datetime
    class Config:
        from_attributes = True

class SubjectBase(BaseModel):
    department: str
    section: str
    name: str
    syllabus_pdf_url: Optional[str] = None

class SubjectOut(SubjectBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True

class TimetableSlotBase(BaseModel):
    department: str
    section: str
    day_of_week: str
    start_time: str
    end_time: str
    subject_name: str
    teacher_id: Optional[int] = None

class TimetableSlotOut(TimetableSlotBase):
    id: int
    teacher_name: Optional[str] = None
    created_at: datetime
    class Config:
        from_attributes = True


class TimetableAttendanceBase(BaseModel):
    timetable_slot_id: int
    student_id: int
    date: str
    status: str


class TimetableAttendanceOut(TimetableAttendanceBase):
    id: int
    created_at: datetime
    student_name: Optional[str] = None
    roll_number: Optional[str] = None
    class Config:
        from_attributes = True


class TimetableAttendanceCreate(BaseModel):
    timetable_slot_id: int
    date: Optional[str] = None
    records: List[dict] # list of dicts with student_id and status


class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    phone_number: Optional[str] = None
    dob: Optional[str] = None
    designation: Optional[str] = None
    education: Optional[str] = None
    department: Optional[str] = None
    section: Optional[str] = None
    roll_number: Optional[str] = None


class TimetableAssignmentBase(BaseModel):
    department: str
    section: str
    subject_name: str
    title: str
    description: Optional[str] = None
    file_url: Optional[str] = None
    deadline: Optional[datetime] = None
    posting_date: Optional[str] = None


class TimetableAssignmentOut(TimetableAssignmentBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True


class TimetableSubmissionOut(BaseModel):
    id: int
    assignment_id: int
    student_id: int
    file_url: Optional[str] = None
    submission_text: Optional[str] = None
    grade: Optional[str] = None
    score: Optional[int] = None
    feedback: Optional[str] = None
    submitted_at: datetime
    class Config:
        from_attributes = True


class QuizBase(BaseModel):
    department: str
    section: str
    subject_name: str
    title: str
    posting_date: Optional[str] = None
    deadline: Optional[datetime] = None


class QuizQuestionBase(BaseModel):
    question_text: str
    options: List[str]
    correct_option: str


class QuizQuestionOut(QuizQuestionBase):
    id: int
    quiz_id: int
    class Config:
        from_attributes = True


class QuizOut(QuizBase):
    id: int
    created_at: datetime
    questions: Optional[List[QuizQuestionOut]] = None
    class Config:
        from_attributes = True


class StudentQuizResponseBase(BaseModel):
    quiz_id: int
    student_id: int
    score: int
    total_questions: int


class StudentQuizResponseOut(StudentQuizResponseBase):
    id: int
    submitted_at: datetime
    class Config:
        from_attributes = True


class OnlineMeetCreate(BaseModel):
    department: str
    section: str
    subject_name: str
    topic: str
    meet_date: str
    start_time: str
    duration_mins: int = 60
    absence_limit_mins: int = 15
    camera_mandatory: bool = False


class OnlineMeetOut(BaseModel):
    id: int
    meeting_id: Optional[str] = None
    teacher_id: int
    department: str
    section: str
    subject_name: str
    topic: str
    meet_date: str
    start_time: str
    duration_mins: int
    absence_limit_mins: int = 15
    camera_mandatory: bool = False
    room_url: Optional[str] = None
    recording_url: Optional[str] = None
    allowed_users_json: Optional[str] = None
    attendance_report_json: Optional[str] = None
    status: str = "scheduled"
    is_active: Optional[bool] = True
    created_at: Optional[datetime] = None
    teacher_name: Optional[str] = None
    class Config:
        from_attributes = True


class OnlineMeetSessionOut(BaseModel):
    id: int
    meet_id: int
    user_id: int
    session_token: str
    role: str
    first_join_time: Optional[str] = None
    last_leave_time: Optional[str] = None
    total_absence_seconds: int = 0
    warnings_count: int = 0
    beeps_count: int = 0
    removal_reason: Optional[str] = None
    final_status: str = "Active"
    logs_json: Optional[str] = None
    user_name: Optional[str] = None
    roll_number: Optional[str] = None
    class Config:
        from_attributes = True


class MeetJoinCheckResponse(BaseModel):
    allowed: bool
    status: str  # "locked", "waiting_room", "active", "denied"
    message: str
    meet: Optional[OnlineMeetOut] = None
    user_role: Optional[str] = None
    session_token: Optional[str] = None
    participants: Optional[List[dict]] = None


class MeetActionRequest(BaseModel):
    action: str  # mute_all, request_camera, remove_student, toggle_camera_mandatory, end_meeting, record_event
    target_user_id: Optional[int] = None
    payload: Optional[dict] = None

