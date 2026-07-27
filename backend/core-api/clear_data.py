import sqlite3
import os

paths = ['lms.db', os.path.join('..', 'lms.db')]
tables = [
    'timetable_assignments', 'timetable_submissions', 
    'quizzes', 'quiz_questions', 'student_quiz_responses', 
    'assignments', 'submissions', 'online_meets'
]

for p in paths:
    if os.path.exists(p):
        conn = sqlite3.connect(p)
        cur = conn.cursor()
        for t in tables:
            cur.execute(f"SELECT name FROM sqlite_master WHERE type='table' AND name='{t}'")
            if cur.fetchone():
                cur.execute(f"DELETE FROM {t}")
                conn.commit()
                print(f"Cleared table {t} in {p}")
        conn.close()
print("All academic data cleared successfully!")
