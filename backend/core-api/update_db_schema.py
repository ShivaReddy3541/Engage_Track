import sys
import os
import sqlite3

# Add parent dir to path so we can import shared
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import engine
from shared import models

# 1. Create all tables if missing
models.Base.metadata.create_all(bind=engine)

# 2. Add columns if table already existed but missed them
paths = ['lms.db', os.path.join('..', 'lms.db')]
for p in paths:
    if os.path.exists(p):
        conn = sqlite3.connect(p)
        cur = conn.cursor()
        cur.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='timetable_submissions'")
        if cur.fetchone():
            cols = [r[1] for r in cur.execute("PRAGMA table_info(timetable_submissions)").fetchall()]
            if 'score' not in cols:
                cur.execute("ALTER TABLE timetable_submissions ADD COLUMN score INTEGER")
                print(f"Added score to {p}")
            if 'feedback' not in cols:
                cur.execute("ALTER TABLE timetable_submissions ADD COLUMN feedback TEXT")
                print(f"Added feedback to {p}")
        
        cur.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='quizzes'")
        if cur.fetchone():
            cols = [r[1] for r in cur.execute("PRAGMA table_info(quizzes)").fetchall()]
            if 'deadline' not in cols:
                cur.execute("ALTER TABLE quizzes ADD COLUMN deadline DATETIME")
                print(f"Added deadline to quizzes in {p}")
        conn.commit()
        conn.close()

print("Schema verification and update completed successfully!")
