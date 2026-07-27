import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import sqlite3
import datetime
from database import SessionLocal
from shared.models import User

# Connect to sqlite
sqlite_conn = sqlite3.connect('lms.db')
cursor = sqlite_conn.cursor()
cursor.execute("SELECT id, email, hashed_password, full_name, role, department, roll_number, is_approved, reset_token, created_at FROM users")
rows = cursor.fetchall()

# Connect to postgres
db = SessionLocal()

for row in rows:
    try:
        if type(row[9]) == str:
            try:
                created_at = datetime.datetime.strptime(row[9], "%Y-%m-%d %H:%M:%S.%f")
            except:
                created_at = datetime.datetime.utcnow()
        else:
            created_at = row[9] or datetime.datetime.utcnow()

        user = User(
            id=row[0],
            email=row[1],
            hashed_password=row[2],
            full_name=row[3],
            role=row[4],
            department=row[5],
            roll_number=row[6],
            is_approved=bool(row[7]),
            reset_token=row[8],
            created_at=created_at
        )
        db.add(user)
    except Exception as e:
        print(f"Error copying {row[1]}: {e}")

db.commit()
print(f"Copied {len(rows)} users from SQLite to Supabase!")
db.close()
sqlite_conn.close()
