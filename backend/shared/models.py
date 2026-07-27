import datetime
import hashlib
import json
from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey, Text, JSON
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

class User(Base):
    __tablename__ = 'users'
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False)  # admin, dept_admin, teacher, student
    department = Column(String(50), nullable=True)  # CSE, ECE, EEE — for dept_admin role only
    roll_number = Column(String(50), unique=True, index=True, nullable=True) # Only for students
    is_approved = Column(Boolean, default=True) # Needs admin approval for teachers
    reset_token = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    enrollments = relationship("Enrollment", back_populates="student")
    taught_classes = relationship("Class", back_populates="teacher")
    submissions = relationship("Submission", back_populates="student", foreign_keys="[Submission.student_id]")
    graded_submissions = relationship("Submission", back_populates="grader", foreign_keys="[Submission.graded_by]")
    attendance_records = relationship("AttendanceRecord", back_populates="student")
    agent_events = relationship("AgentEvent", back_populates="student")
    overrides = relationship("TeacherOverride", back_populates="teacher")
    exemptions = relationship("TrustedExemption", back_populates="student", foreign_keys="[TrustedExemption.student_id]")
    created_exemptions = relationship("TrustedExemption", back_populates="admin", foreign_keys="[TrustedExemption.admin_id]")


class PreRegisteredStudent(Base):
    __tablename__ = 'pre_registered_students'
    
    id = Column(Integer, primary_key=True, index=True)
    roll_number = Column(String(50), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    father_name = Column(String(255), nullable=False)
    dob = Column(String(50), nullable=False)
    phone_number = Column(String(50), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    department = Column(String(50), nullable=False)
    section = Column(String(10), nullable=False)
    is_registered = Column(Boolean, default=False)
    personal_email = Column(String(255), unique=True, index=True, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class Faculty(Base):
    __tablename__ = 'faculty'
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    designation = Column(String(255), nullable=False)
    education = Column(String(255), nullable=False)
    dob = Column(String(50), nullable=False)
    phone_number = Column(String(50), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    department = Column(String(50), nullable=False)  # CSE, ECE, EEE
    is_registered = Column(Boolean, default=False)
    personal_email = Column(String(255), unique=True, index=True, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class Class(Base):
    __tablename__ = 'classes'
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    department = Column(String(50), nullable=True)
    section = Column(String(10), nullable=True)
    description = Column(Text, nullable=True)
    subject_name = Column(String(255), nullable=True)
    meet_date = Column(String(50), nullable=True)
    start_time = Column(String(20), nullable=True)
    duration_mins = Column(Integer, nullable=True)
    absence_allowed_mins = Column(Integer, nullable=True, default=10)
    status = Column(String(50), default="scheduled")
    teacher_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    teacher = relationship("User", back_populates="taught_classes")
    enrollments = relationship("Enrollment", back_populates="classroom")
    posts = relationship("Post", back_populates="classroom")
    assignments = relationship("Assignment", back_populates="classroom")
    live_classes = relationship("LiveClass", back_populates="classroom")


class Enrollment(Base):
    __tablename__ = 'enrollments'
    
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    class_id = Column(Integer, ForeignKey('classes.id', ondelete='CASCADE'), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    student = relationship("User", back_populates="enrollments")
    classroom = relationship("Class", back_populates="enrollments")


class Post(Base):
    __tablename__ = 'posts'
    
    id = Column(Integer, primary_key=True, index=True)
    class_id = Column(Integer, ForeignKey('classes.id', ondelete='CASCADE'), nullable=False)
    author_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    content = Column(Text, nullable=False)
    attachment_url = Column(String(512), nullable=True)
    moderation_status = Column(String(50), default="pending")  # pending, approved, flagged
    flagged_reason = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    classroom = relationship("Class", back_populates="posts")
    comments = relationship("Comment", back_populates="post")


class Comment(Base):
    __tablename__ = 'comments'
    
    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey('posts.id', ondelete='CASCADE'), nullable=False)
    author_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    content = Column(Text, nullable=False)
    moderation_status = Column(String(50), default="pending")  # pending, approved, flagged
    flagged_reason = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    post = relationship("Post", back_populates="comments")


class Assignment(Base):
    __tablename__ = 'assignments'
    
    id = Column(Integer, primary_key=True, index=True)
    class_id = Column(Integer, ForeignKey('classes.id', ondelete='CASCADE'), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    file_url = Column(String(512), nullable=True)
    deadline = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    classroom = relationship("Class", back_populates="assignments")
    submissions = relationship("Submission", back_populates="assignment")


class Submission(Base):
    __tablename__ = 'submissions'
    
    id = Column(Integer, primary_key=True, index=True)
    assignment_id = Column(Integer, ForeignKey('assignments.id', ondelete='CASCADE'), nullable=False)
    student_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    file_url = Column(String(512), nullable=True)
    submission_text = Column(Text, nullable=True)
    plagiarism_score = Column(Float, default=0.0)
    grade = Column(String(50), nullable=True)
    graded_by = Column(Integer, ForeignKey('users.id'), nullable=True)
    submitted_at = Column(DateTime, default=datetime.datetime.utcnow)
    graded_at = Column(DateTime, nullable=True)

    # Relationships
    assignment = relationship("Assignment", back_populates="submissions")
    student = relationship("User", back_populates="submissions", foreign_keys=[student_id])
    grader = relationship("User", back_populates="graded_submissions", foreign_keys=[graded_by])


class LiveClass(Base):
    __tablename__ = 'live_classes'
    
    id = Column(Integer, primary_key=True, index=True)
    class_id = Column(Integer, ForeignKey('classes.id', ondelete='CASCADE'), nullable=False)
    title = Column(String(255), nullable=False)
    room_url = Column(String(512), nullable=False)
    start_time = Column(DateTime, default=datetime.datetime.utcnow)
    end_time = Column(DateTime, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    classroom = relationship("Class", back_populates="live_classes")
    attendance_records = relationship("AttendanceRecord", back_populates="live_class")
    agent_events = relationship("AgentEvent", back_populates="live_class")


class AttendanceRecord(Base):
    __tablename__ = 'attendance_records'
    
    id = Column(Integer, primary_key=True, index=True)
    live_class_id = Column(Integer, ForeignKey('live_classes.id', ondelete='CASCADE'), nullable=False)
    student_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    status = Column(String(50), default="present")  # present, absent, excused
    total_seconds_present = Column(Integer, default=0)
    last_seen_at = Column(DateTime, default=datetime.datetime.utcnow)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    live_class = relationship("LiveClass", back_populates="attendance_records")
    student = relationship("User", back_populates="attendance_records")


class AgentEvent(Base):
    __tablename__ = 'agent_events'
    
    id = Column(Integer, primary_key=True, index=True)
    event_type = Column(String(50), nullable=False)  # absence, drowsiness, screen_integrity, content_moderation
    source_agent = Column(String(100), nullable=False)
    student_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=True)  # Nullable for global content moderation
    live_class_id = Column(Integer, ForeignKey('live_classes.id', ondelete='CASCADE'), nullable=True)
    confidence = Column(Float, nullable=False)
    details = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    student = relationship("User", back_populates="agent_events")
    live_class = relationship("LiveClass", back_populates="agent_events")
    decisions = relationship("OrchestratorDecision", back_populates="event")


class OrchestratorDecision(Base):
    __tablename__ = 'orchestrator_decisions'
    
    id = Column(Integer, primary_key=True, index=True)
    agent_event_id = Column(Integer, ForeignKey('agent_events.id', ondelete='CASCADE'), nullable=False)
    action_taken = Column(String(50), nullable=False)  # none, alert, absent, block, review
    status = Column(String(50), default="pending_review")  # pending_review, applied, overridden
    details = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    event = relationship("AgentEvent", back_populates="decisions")
    overrides = relationship("TeacherOverride", back_populates="decision")


class TeacherOverride(Base):
    __tablename__ = 'teacher_overrides'
    
    id = Column(Integer, primary_key=True, index=True)
    decision_id = Column(Integer, ForeignKey('orchestrator_decisions.id', ondelete='CASCADE'), nullable=False)
    teacher_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    action_taken = Column(String(50), nullable=False)  # approve_flag, dismiss_flag
    justification = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    decision = relationship("OrchestratorDecision", back_populates="overrides")
    teacher = relationship("User", back_populates="overrides")


class TrustedExemption(Base):
    __tablename__ = 'trusted_exemptions'
    
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    agent_type = Column(String(50), nullable=False)  # all, alertness, attendance
    admin_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    reason = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    student = relationship("User", back_populates="exemptions", foreign_keys=[student_id])
    admin = relationship("User", back_populates="created_exemptions", foreign_keys=[admin_id])


class AuditLog(Base):
    __tablename__ = 'audit_logs'
    
    id = Column(Integer, primary_key=True, index=True)
    event_type = Column(String(100), nullable=False)
    details = Column(JSON, nullable=False)
    previous_hash = Column(String(64), nullable=False)
    current_hash = Column(String(64), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    @classmethod
    def generate_hash(cls, details_dict, prev_hash):
        # Deterministically convert dictionary to string
        details_str = json.dumps(details_dict, sort_keys=True)
        raw_content = f"{details_str}{prev_hash}"
        return hashlib.sha256(raw_content.encode('utf-8')).hexdigest()


class SystemConfig(Base):
    __tablename__ = 'system_configs'
    
    id = Column(Integer, primary_key=True, index=True)
    key = Column(String(100), unique=True, index=True, nullable=False)
    value = Column(String(255), nullable=False)
    description = Column(String(255), nullable=True)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)


class FacilityRequest(Base):
    __tablename__ = 'facility_requests'
    
    id = Column(Integer, primary_key=True, index=True)
    requester_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    department = Column(String(50), nullable=False)
    request_type = Column(String(100), nullable=False) # e.g., 'library', 'funds', 'hackathon'
    description = Column(Text, nullable=False)
    status = Column(String(50), default="pending") # pending, approved, rejected
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    requester = relationship("User")


class PlacementDrive(Base):
    __tablename__ = 'placement_drives'
    
    id = Column(Integer, primary_key=True, index=True)
    company = Column(String(255), nullable=False)
    role = Column(String(255), nullable=False)
    package = Column(String(100), nullable=False)
    cutoff = Column(String(50), nullable=False)
    date = Column(String(50), nullable=False)
    branches = Column(String(255), nullable=False)
    status = Column(String(50), default="Upcoming") # Upcoming, Ongoing, Completed
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    records = relationship("PlacementRecord", back_populates="drive")


class PlacementRecord(Base):
    __tablename__ = 'placement_records'
    
    id = Column(Integer, primary_key=True, index=True)
    drive_id = Column(Integer, ForeignKey('placement_drives.id', ondelete='CASCADE'), nullable=False)
    student_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    package = Column(String(100), nullable=False)
    status = Column(String(50), default="Offered") # Offered, Accepted, Rejected
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    drive = relationship("PlacementDrive", back_populates="records")
    student = relationship("User")


class StudentFee(Base):
    __tablename__ = 'student_fees'
    
    id = Column(Integer, primary_key=True, index=True)
    pre_student_id = Column(Integer, ForeignKey('pre_registered_students.id', ondelete='CASCADE'), nullable=False, unique=True)
    total_fee = Column(Float, nullable=False, default=120000.0)
    paid_fee = Column(Float, nullable=False, default=0.0)
    status = Column(String(50), default="Due")  # Due, Partial, Cleared
    fee_type = Column(String(100), default="Tuition Fee")  # Tuition Fee, Hostel Fee, etc.
    remarks = Column(Text, nullable=True)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    
    pre_student = relationship("PreRegisteredStudent")


class ScheduleEvent(Base):
    __tablename__ = 'schedule_events'
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    month = Column(String(50), nullable=False)
    day = Column(String(10), nullable=False)
    event_type = Column(String(100), nullable=False) # Academic, Exam, Holiday, Placement, Event
    details = Column(Text, nullable=True)
    attachment_name = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)



class Announcement(Base):
    __tablename__ = 'announcements'
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    priority = Column(String(50), default="Medium")
    target_audience = Column(String(50), default="All")
    department = Column(String(50), nullable=True) # Null or 'All' means global
    attachment_name = Column(String(255), nullable=True)
    date = Column(String(50), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Notification(Base):
    __tablename__ = 'notifications'
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=True) # If null, it could be broadcasted by role/dept
    target_role = Column(String(50), nullable=True) # e.g. student, teacher, dept_admin
    target_department = Column(String(50), nullable=True)
    message = Column(Text, nullable=False)
    type = Column(String(50), default="Info") # Info, Alert, Announcement
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Subject(Base):
    __tablename__ = 'subjects'
    
    id = Column(Integer, primary_key=True, index=True)
    department = Column(String(50), nullable=False)
    section = Column(String(10), nullable=False) # e.g. A, B, C, D
    name = Column(String(255), nullable=False)
    syllabus_pdf_url = Column(String(512), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class TimetableSlot(Base):
    __tablename__ = 'timetable_slots'
    
    id = Column(Integer, primary_key=True, index=True)
    department = Column(String(50), nullable=False)
    section = Column(String(10), nullable=False)
    day_of_week = Column(String(20), nullable=False) # Monday, Tuesday, etc.
    start_time = Column(String(20), nullable=False) # e.g. "09:00"
    end_time = Column(String(20), nullable=False) # e.g. "10:00"
    subject_name = Column(String(255), nullable=False)
    teacher_id = Column(Integer, ForeignKey('users.id', ondelete='SET NULL'), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class TimetableAttendance(Base):
    __tablename__ = 'timetable_attendance'
    
    id = Column(Integer, primary_key=True, index=True)
    timetable_slot_id = Column(Integer, ForeignKey('timetable_slots.id', ondelete='CASCADE'), nullable=False)
    student_id = Column(Integer, nullable=False)
    date = Column(String(50), nullable=False) # e.g., "2026-07-10"
    status = Column(String(50), default="Present") # Present, Absent
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    timetable_slot = relationship("TimetableSlot")
    # student = relationship("User") # Removed due to pseudo-IDs for pre-registered students


class TimetableAssignment(Base):
    __tablename__ = 'timetable_assignments'
    
    id = Column(Integer, primary_key=True, index=True)
    department = Column(String(50), nullable=False)
    section = Column(String(10), nullable=False)
    subject_name = Column(String(255), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    file_url = Column(String(512), nullable=True)
    deadline = Column(DateTime, nullable=True)
    posting_date = Column(String(50), nullable=True) # For scheduling
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class TimetableSubmission(Base):
    __tablename__ = 'timetable_submissions'
    
    id = Column(Integer, primary_key=True, index=True)
    assignment_id = Column(Integer, ForeignKey('timetable_assignments.id', ondelete='CASCADE'), nullable=False)
    student_id = Column(Integer, nullable=False)
    file_url = Column(String(512), nullable=True)
    submission_text = Column(Text, nullable=True)
    grade = Column(String(50), nullable=True)
    score = Column(Integer, nullable=True)
    feedback = Column(Text, nullable=True)
    submitted_at = Column(DateTime, default=datetime.datetime.utcnow)


class Quiz(Base):
    __tablename__ = 'quizzes'
    
    id = Column(Integer, primary_key=True, index=True)
    department = Column(String(50), nullable=False)
    section = Column(String(10), nullable=False)
    subject_name = Column(String(255), nullable=False)
    title = Column(String(255), nullable=False)
    posting_date = Column(String(50), nullable=True) # For scheduling, e.g. "2026-07-10 10:00"
    deadline = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class QuizQuestion(Base):
    __tablename__ = 'quiz_questions'
    
    id = Column(Integer, primary_key=True, index=True)
    quiz_id = Column(Integer, ForeignKey('quizzes.id', ondelete='CASCADE'), nullable=False)
    question_text = Column(Text, nullable=False)
    options = Column(JSON, nullable=False) # List of strings
    correct_option = Column(String(10), nullable=False) # e.g. "A", "B", "C", "D"


class StudentQuizResponse(Base):
    __tablename__ = 'student_quiz_responses'
    
    id = Column(Integer, primary_key=True, index=True)
    quiz_id = Column(Integer, ForeignKey('quizzes.id', ondelete='CASCADE'), nullable=False)
    student_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    score = Column(Integer, nullable=False)
    total_questions = Column(Integer, nullable=False, default=5)
    submitted_at = Column(DateTime, default=datetime.datetime.utcnow)


class OnlineMeet(Base):
    __tablename__ = 'online_meets'

    id = Column(Integer, primary_key=True, index=True)
    meeting_id = Column(String(100), unique=True, index=True, nullable=True)  # e.g. MEET-CSE-A-839201
    teacher_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    department = Column(String(50), nullable=False)
    section = Column(String(10), nullable=False)
    subject_name = Column(String(255), nullable=False)
    topic = Column(String(255), nullable=False)
    meet_date = Column(String(50), nullable=False)   # e.g. "2026-07-16"
    start_time = Column(String(20), nullable=False)  # e.g. "10:00"
    duration_mins = Column(Integer, nullable=False, default=60)
    absence_limit_mins = Column(Integer, nullable=False, default=15) # <= 50% of duration
    camera_mandatory = Column(Boolean, default=False)
    room_url = Column(String(512), nullable=True)
    recording_url = Column(String(512), nullable=True)
    allowed_users_json = Column(Text, nullable=True) # JSON array of whitelisted user IDs/emails
    attendance_report_json = Column(Text, nullable=True) # JSON storing final attendance & proctoring report
    status = Column(String(30), default='scheduled') # scheduled, waiting, active, ended
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    teacher = relationship("User")
    sessions = relationship("OnlineMeetSession", back_populates="meet", cascade="all, delete-orphan")


class OnlineMeetSession(Base):
    __tablename__ = 'online_meet_sessions'

    id = Column(Integer, primary_key=True, index=True)
    meet_id = Column(Integer, ForeignKey('online_meets.id', ondelete='CASCADE'), nullable=False)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    session_token = Column(String(100), index=True, nullable=False) # Unique session token for active duplicate check
    role = Column(String(30), nullable=False) # host, dept_admin, student
    first_join_time = Column(String(50), nullable=True)
    last_leave_time = Column(String(50), nullable=True)
    total_absence_seconds = Column(Integer, default=0)
    warnings_count = Column(Integer, default=0)
    beeps_count = Column(Integer, default=0)
    removal_reason = Column(String(255), nullable=True)
    final_status = Column(String(30), default='Active') # Active, Present, Absent, Removed
    logs_json = Column(Text, nullable=True) # JSON array of events (join, leave, beep, warning, etc.)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow)

    meet = relationship("OnlineMeet", back_populates="sessions")
    user = relationship("User")
